/**
 * 가족 구성원 라우터
 * 가족관계증명서/주민등록등본 업로드 → AI OCR 추출 → 저장
 * 유류분 배제 작성 시 자동 불러오기
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { familyMembers } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { invokeLLM, type Message } from "../_core/llm";
import { storagePut } from "../storage";

export const familyMembersRouter = router({
  /** 내 가족 구성원 목록 조회 */
  getMyFamilyMembers: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.userId, ctx.user.id))
      .orderBy(familyMembers.createdAt);
  }),

  /** 가족관계증명서/주민등록등본 업로드 → AI OCR 추출 */
  extractFromDocument: protectedProcedure
    .input(
      z.object({
        /** base64 인코딩된 이미지 데이터 */
        imageBase64: z.string(),
        /** 파일명 */
        fileName: z.string(),
        /** 문서 종류 */
        docType: z.enum(["family_cert", "resident_cert"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");
      // S3에 원본 파일 저장
      const fileBuffer = Buffer.from(input.imageBase64, "base64");
      const fileKey = `family-docs/${ctx.user.id}/${Date.now()}_${input.fileName}`;
      const { key: savedKey } = await storagePut(fileKey, fileBuffer, "image/jpeg");

      // AI OCR로 가족 정보 추출
      const docLabel =
        input.docType === "family_cert" ? "가족관계증명서" : "주민등록등본";

      const systemPrompt = `당신은 한국 ${docLabel}에서 가족 구성원 정보를 추출하는 전문가입니다.
문서 이미지를 분석하여 가족 구성원 정보를 JSON 배열로 반환하세요.
각 구성원에 대해 다음 정보를 추출하세요:
- nameKo: 이름 (한국어)
- relationship: 관계 (예: 배우자, 자녀, 부모, 형제, 자매 등 원문 그대로)
- birthDate: 생년월일 (YYYY-MM-DD 형식, 없으면 null)
- idFront: 주민등록번호 앞 6자리 (있으면, 없으면 null)

본인(신청인/기준자)은 제외하고 가족 구성원만 추출하세요.
반드시 JSON 배열만 반환하세요. 다른 텍스트는 포함하지 마세요.`;

      const messages: Message[] = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "image_url" as const,
              image_url: {
                url: `data:image/jpeg;base64,${input.imageBase64}`,
                detail: "high" as const,
              },
            },
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

      const content = typeof response.choices[0].message.content === "string"
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

      // DB에 저장 (중복 방지: 같은 이름+관계 있으면 업데이트)
      const saved = [];
      for (const member of extracted) {
        const [existing] = await db
          .select()
          .from(familyMembers)
          .where(
            and(
              eq(familyMembers.userId, ctx.user.id),
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
              source: input.docType,
              sourceFileKey: savedKey,
              rawData: JSON.stringify(member),
            })
            .where(eq(familyMembers.id, existing.id));
          saved.push({ ...existing, ...member });
        } else {
          const [inserted] = await db
            .insert(familyMembers)
            .values({
              userId: ctx.user.id,
              nameKo: member.nameKo,
              relationship: member.relationship,
              birthDate: member.birthDate ?? undefined,
              idFront: member.idFront ?? undefined,
              source: input.docType,
              sourceFileKey: savedKey,
              rawData: JSON.stringify(member),
            })
            .returning({ id: familyMembers.id });
          saved.push({ id: inserted.id, ...member });
        }
      }

      return {
        success: true,
        count: saved.length,
        members: saved,
      };
    }),

  /** 가족 구성원 수동 추가 */
  addFamilyMember: protectedProcedure
    .input(
      z.object({
        nameKo: z.string().min(1),
        relationship: z.string().min(1),
        birthDate: z.string().optional(),
        idFront: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");
      const [inserted] = await db
        .insert(familyMembers)
        .values({
          userId: ctx.user.id,
          nameKo: input.nameKo,
          relationship: input.relationship,
          birthDate: input.birthDate,
          idFront: input.idFront,
          address: input.address,
          source: "manual",
        })
        .returning({ id: familyMembers.id });
      return { id: inserted.id };
    }),

  /** 가족 구성원 주소 업데이트 */
  updateAddress: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        address: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");
      await db
        .update(familyMembers)
        .set({ address: input.address })
        .where(
          and(
            eq(familyMembers.id, input.id),
            eq(familyMembers.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  /** 가족 구성원 삭제 */
  deleteFamilyMember: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");
      await db
        .delete(familyMembers)
        .where(
          and(
            eq(familyMembers.id, input.id),
            eq(familyMembers.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),
});
