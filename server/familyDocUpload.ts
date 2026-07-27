/**
 * 가족관계증명서 파일 업로드 전용 라우터
 * base64 JSON 방식 대신 multipart/form-data로 파일을 받아 처리
 * - 큰 이미지 파일도 안정적으로 처리
 */
import { Router } from "express";
import multer from "multer";
import { getDb } from "./db";
import { familyMembers } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { invokeLLM, type Message } from "./_core/llm";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";

const router = Router();

// 메모리 스토리지 (최대 20MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("지원하지 않는 파일 형식입니다."));
    }
  },
});

router.post("/api/family-doc/upload", upload.single("file"), async (req, res) => {
  try {
    // 인증 확인
    let userId: number;
    try {
      const user = await sdk.authenticateRequest(req as any);
      userId = user.id;
    } catch {
      return res.status(401).json({ error: "로그인이 필요합니다." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "파일이 없습니다." });
    }

    const docType = (req.body.docType as string) || "family_cert";
    const docLabel = docType === "family_cert" ? "가족관계증명서" : "주민등록등본";

    // S3에 파일 저장
    const ext = req.file.originalname.split(".").pop() || "jpg";
    const fileKey = `family-docs/${userId}/${Date.now()}.${ext}`;
    const { key: savedKey } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);

    // base64 변환 (LLM 비전 API용)
    const base64 = req.file.buffer.toString("base64");
    const isPdf = req.file.mimetype === "application/pdf";
    const mimeType = req.file.mimetype.startsWith("image/") ? req.file.mimetype : "image/jpeg";

    // AI OCR로 가족 정보 추출
    const systemPrompt = `당신은 한국 ${docLabel}에서 가족 구성원 정보를 추출하는 전문가입니다.
문서를 분석하여 가족 구성원 정보를 JSON 배열로 반환하세요.
각 구성원에 대해 다음 정보를 추출하세요:
- nameKo: 이름 (한국어)
- relationship: 관계 (예: 배우자, 자녀, 부모, 형제, 자매 등 원문 그대로)
- birthDate: 생년월일 (YYYY-MM-DD 형식, 없으면 null)
- idFront: 주민등록번호 앞 6자리 (있으면, 없으면 null)

본인(신청인/기준자)은 제외하고 가족 구성원만 추출하세요.
반드시 JSON 배열만 반환하세요. 다른 텍스트는 포함하지 마세요.`;

    // PDF는 file_url 타입, 이미지는 image_url 타입으로 LLM에 전달
    const fileContent = isPdf
      ? {
          type: "file_url" as const,
          file_url: {
            url: `data:application/pdf;base64,${base64}`,
            mime_type: "application/pdf" as const,
          },
        }
      : {
          type: "image_url" as const,
          image_url: {
            url: `data:${mimeType};base64,${base64}`,
            detail: "high" as const,
          },
        };

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          fileContent,
          {
            type: "text" as const,
            text: `이 ${docLabel}에서 가족 구성원 정보를 추출해주세요.`,
          },
        ],
      },
    ];

    const response = await invokeLLM({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "family_members_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              members: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nameKo: { type: "string" },
                    relationship: { type: "string" },
                    birthDate: { type: ["string", "null"] },
                    idFront: { type: ["string", "null"] },
                  },
                  required: ["nameKo", "relationship", "birthDate", "idFront"],
                  additionalProperties: false,
                },
              },
            },
            required: ["members"],
            additionalProperties: false,
          },
        },
      },
    });

    const content =
      typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0].message.content);

    let extracted: Array<{
      nameKo: string;
      relationship: string;
      birthDate: string | null;
      idFront: string | null;
    }> = [];

    try {
      const parsed = JSON.parse(content);
      extracted = parsed.members || [];
    } catch {
      extracted = [];
    }

    // DB에 저장 (중복 방지)
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "DB 연결 실패" });
    }

    const saved = [];
    for (const member of extracted) {
      const [existing] = await db
        .select()
        .from(familyMembers)
        .where(
          and(
            eq(familyMembers.userId, userId),
            eq(familyMembers.nameKo, member.nameKo)
          )
        );

      if (existing) {
        await db
          .update(familyMembers)
          .set({
            relationship: member.relationship,
            birthDate: member.birthDate ?? undefined,
            idFront: member.idFront ?? undefined,
            source: docType as "family_cert" | "resident_cert",
            sourceFileKey: savedKey,
            rawData: JSON.stringify(member),
          })
          .where(eq(familyMembers.id, existing.id));
        saved.push({ ...existing, ...member });
      } else {
        const [inserted] = await db
          .insert(familyMembers)
          .values({
            userId,
            nameKo: member.nameKo,
            relationship: member.relationship,
            birthDate: member.birthDate ?? undefined,
            idFront: member.idFront ?? undefined,
            source: docType as "family_cert" | "resident_cert",
            sourceFileKey: savedKey,
            rawData: JSON.stringify(member),
          })
          .returning({ id: familyMembers.id });
        saved.push({ id: inserted.id, ...member });
      }
    }

    return res.json({
      success: true,
      count: saved.length,
      members: saved,
    });
  } catch (err: any) {
    console.error("[FamilyDocUpload] Error:", err);
    return res.status(500).json({ error: err.message || "서버 오류가 발생했습니다." });
  }
});

export { router as familyDocUploadRouter };
