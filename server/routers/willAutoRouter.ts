/**
 * willAutoRouter - 구매 후 자동화 파이프라인
 *
 * 1. scanAssetDocument  - 자산증명서 이미지 AI OCR (은행잔액증명/등기부등본/주식보유증명/보험증권/기타)
 * 2. buildAssetData     - 스캔 결과 목록 → 구조화된 자산 데이터 자동완성
 * 3. generateWillDraft  - 자산 데이터 + 상속인 목록 → 한국 민법 기반 유언장 초안 자동 생성
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, heirs, willAssetScans } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { storagePut } from "../storage";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// ─── 자산증명서 유형 ───────────────────────────────────────────
const ASSET_DOC_TYPES = [
  "bank_balance",
  "real_estate_registry",
  "stock_certificate",
  "insurance_policy",
  "bond_certificate",
  "pension_statement",
  "vehicle_registration",
  "business_registration",
  "loan_statement",
  "other",
] as const;

const DOC_TYPE_LABELS: Record<string, string> = {
  bank_balance: "은행 잔액증명서",
  real_estate_registry: "부동산 등기부등본",
  stock_certificate: "주식보유증명서",
  insurance_policy: "보험증권",
  bond_certificate: "채권증명서",
  pension_statement: "연금 수급 확인서",
  vehicle_registration: "자동차 등록증",
  business_registration: "사업자등록증",
  loan_statement: "대출 잔액 확인서",
  other: "기타 자산 서류",
};

export const willAutoRouter = router({
  /**
   * 자산증명서 이미지 AI OCR 분석
   * - 은행잔액증명서, 부동산 등기부등본, 주식보유증명서, 보험증권 등
   * - 이미지(data URL 또는 https URL)를 받아 AI가 자동 분석
   */
  scanAssetDocument: protectedProcedure
    .input(z.object({
      imageUrl: z.string().refine(
        (v) => v.startsWith("http") || v.startsWith("data:"),
        { message: "올바른 파일 URL 또는 data URL을 입력해주세요" }
      ),
      docTypeHint: z.enum(ASSET_DOC_TYPES).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // PDF 여부 판단 및 텍스트 추출
        const mimeMatch = input.imageUrl.match(/^data:([^;]+);base64,/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const isPdf = mime === "application/pdf" || input.imageUrl.startsWith("data:application/pdf");
        const isImg = mime.startsWith("image/");

        let userContent: any[];

        if (isPdf) {
          // PDF → pdf-parse로 텍스트 추출 후 AI에 텍스트로 전달
          const base64Data = input.imageUrl.replace(/^data:[^;]+;base64,/, "");
          const pdfBuffer = Buffer.from(base64Data, "base64");
          let pdfText = "";
          try {
            const parsed = await pdfParse(pdfBuffer);
            pdfText = parsed.text?.trim() || "";
          } catch (parseErr) {
            console.error("[willAuto] PDF 텍스트 추출 실패:", parseErr);
          }

          if (!pdfText) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "PDF에서 텍스트를 추출할 수 없습니다. 스캔 이미지 PDF인 경우 JPG/PNG로 변환 후 업로드해주세요.",
            });
          }

          userContent = [
            {
              type: "text",
              text: `다음은 PDF에서 추출한 자산증명서 텍스트입니다. 분석하고 JSON 형식으로만 반환하세요.

--- PDF 텍스트 시작 ---
${pdfText.slice(0, 8000)}
--- PDF 텍스트 끝 ---

서류 유형 힌트: ${input.docTypeHint || "자동감지"}

다음 JSON 형식으로만 반환하세요:
{
  "docType": "${input.docTypeHint || "자동감지"}",
  "detectedDocType": "bank_balance|real_estate_registry|stock_certificate|insurance_policy|bond_certificate|other",
  "issuer": "발급기관명 (은행명, 법원, 증권사 등)",
  "ownerName": "소유자/예금주 이름",
  "assetName": "자산명 (계좌번호, 소재지, 종목명 등)",
  "assetCode": "고유코드 (계좌번호 뒷4자리, 종목코드 등)",
  "amount": "금액 (숫자만, 원화 기준)",
  "unit": "원|주|㎡|필지",
  "referenceDate": "기준일 YYYY-MM-DD",
  "expiryDate": "만기일 YYYY-MM-DD (해당시)",
  "location": "소재지 (부동산인 경우)",
  "area": "면적 (부동산인 경우, 숫자만)",
  "beneficiary": "수익자/수혜자 (보험인 경우)",
  "additionalInfo": "기타 중요 정보",
  "confidence": "high|medium|low"
}`,
            },
          ];
        } else {
          // 이미지 → image_url 타입으로 전달
          const imageContent = isImg
            ? { type: "image_url" as const, image_url: { url: input.imageUrl, detail: "high" as const } }
            : null;
          userContent = [];
          if (imageContent) userContent.push(imageContent);
          userContent.push({
            type: "text",
            text: `이 자산증명서를 분석하고 다음 JSON 형식으로만 반환하세요:
{
  "docType": "${input.docTypeHint || "자동감지"}",
  "detectedDocType": "bank_balance|real_estate_registry|stock_certificate|insurance_policy|bond_certificate|other",
  "issuer": "발급기관명 (은행명, 법원, 증권사 등)",
  "ownerName": "소유자/예금주 이름",
  "assetName": "자산명 (계좌번호, 소재지, 종목명 등)",
  "assetCode": "고유코드 (계좌번호 뒷4자리, 종목코드 등)",
  "amount": "금액 (숫자만, 원화 기준)",
  "unit": "원|주|㎡|필지",
  "referenceDate": "기준일 YYYY-MM-DD",
  "expiryDate": "만기일 YYYY-MM-DD (해당시)",
  "location": "소재지 (부동산인 경우)",
  "area": "면적 (부동산인 경우, 숫자만)",
  "beneficiary": "수익자/수혜자 (보험인 경우)",
  "additionalInfo": "기타 중요 정보",
  "confidence": "high|medium|low"
}`,
          });
        }

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `당신은 한국 금융·부동산·주식 관련 자산증명서 전문 OCR 시스템입니다.
              제공된 문서에서 자산 정보를 정확하게 추출하세요.
              
              지원 문서 유형:
              - bank_balance: 은행 잔액증명서 (예금주, 은행명, 계좌번호, 잔액, 기준일)
              - real_estate_registry: 부동산 등기부등본 (소재지, 면적, 소유자, 공시지가, 등기일)
              - stock_certificate: 주식보유증명서 (종목명, 종목코드, 보유주수, 평가금액, 기준일)
              - insurance_policy: 보험증권 (보험사, 상품명, 보험금액, 만기일, 수익자)
              - bond_certificate: 채권증명서 (발행기관, 채권명, 액면금액, 만기일)
              - other: 기타 자산 관련 서류
              
              규칙:
              1. 명확하게 확인되는 정보만 추출 (추측 금지)
              2. 금액은 숫자만 (원화 기준, 단위 제거)
              3. 날짜는 YYYY-MM-DD 형식
              4. 불명확한 필드는 null 반환
              5. JSON만 반환`,
            },
            {
              role: "user",
              content: userContent,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "asset_doc_scan_result",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  docType: { type: "string" },
                  detectedDocType: { type: "string" },
                  issuer: { type: ["string", "null"] },
                  ownerName: { type: ["string", "null"] },
                  assetName: { type: ["string", "null"] },
                  assetCode: { type: ["string", "null"] },
                  amount: { type: ["string", "null"] },
                  unit: { type: ["string", "null"] },
                  referenceDate: { type: ["string", "null"] },
                  expiryDate: { type: ["string", "null"] },
                  location: { type: ["string", "null"] },
                  area: { type: ["string", "null"] },
                  beneficiary: { type: ["string", "null"] },
                  additionalInfo: { type: ["string", "null"] },
                  confidence: { type: "string" },
                },
                required: [
                  "docType", "detectedDocType", "issuer", "ownerName", "assetName",
                  "assetCode", "amount", "unit", "referenceDate", "expiryDate",
                  "location", "area", "beneficiary", "additionalInfo", "confidence",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "자산증명서 분석에 실패했습니다." });
        }
        const result = typeof content === "string" ? JSON.parse(content) : content;

        // 자산 유형별 한국어 레이블
        const docTypeLabels: Record<string, string> = {
          bank_balance: "은행 잔액증명서",
          real_estate_registry: "부동산 등기부등본",
          stock_certificate: "주식보유증명서",
          insurance_policy: "보험증권",
          bond_certificate: "채권증명서",
          other: "기타 자산 서류",
        };

        return {
          success: true,
          data: {
            ...result,
            docTypeLabel: docTypeLabels[result.detectedDocType] || "자산 서류",
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[willAuto] 자산증명서 OCR 오류:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "자산증명서 분석 중 오류가 발생했습니다. 이미지를 다시 확인해주세요.",
        });
      }
    }),

  /**
   * AI 자산 데이터 자동완성
   * - 여러 자산증명서 스캔 결과를 통합하여 구조화된 자산 목록 생성
   */
  buildAssetData: protectedProcedure
    .input(z.object({
      scanResults: z.array(z.object({
        docTypeLabel: z.string(),
        detectedDocType: z.string(),
        issuer: z.string().nullable(),
        ownerName: z.string().nullable(),
        assetName: z.string().nullable(),
        assetCode: z.string().nullable(),
        amount: z.string().nullable(),
        unit: z.string().nullable(),
        referenceDate: z.string().nullable(),
        location: z.string().nullable(),
        area: z.string().nullable(),
        beneficiary: z.string().nullable(),
        additionalInfo: z.string().nullable(),
        confidence: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      // 사용자 정보 조회
      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      const user = userRows[0];

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `당신은 한국 상속법 전문가입니다. 제공된 자산증명서 스캔 데이터를 바탕으로 
              구조화된 자산 목록을 생성하세요. 한국 민법 및 상속세법 기준으로 자산을 분류하고 
              총 자산 가치를 계산하세요.`,
            },
            {
              role: "user",
              content: `다음 자산증명서 스캔 결과를 분석하여 구조화된 자산 데이터를 생성하세요.
              
소유자: ${user?.name || "미확인"}

스캔 결과:
${JSON.stringify(input.scanResults, null, 2)}

다음 JSON 형식으로 반환하세요:
{
  "assets": [
    {
      "id": "고유ID (asset_1, asset_2...)",
      "category": "real_estate|financial_bank|financial_stock|financial_insurance|financial_bond|other",
      "categoryLabel": "부동산|예금/적금|주식/펀드|보험|채권|기타",
      "name": "자산명",
      "description": "상세 설명 (소재지, 계좌번호 뒷4자리 등)",
      "estimatedValue": "추정 가치 (숫자, 원화)",
      "unit": "원|주",
      "quantity": "수량 (주식인 경우 주수)",
      "issuer": "발급기관/은행/증권사",
      "referenceDate": "기준일",
      "location": "소재지 (부동산)",
      "area": "면적 (부동산, ㎡)",
      "country": "KR",
      "notes": "특이사항"
    }
  ],
  "summary": {
    "totalEstimatedValue": "총 추정 자산 가치 (원화 숫자)",
    "realEstateTotal": "부동산 합계",
    "financialTotal": "금융자산 합계",
    "otherTotal": "기타 합계",
    "taxableEstimate": "과세 추정액 (상속세 기준)",
    "notes": "자산 평가 주의사항"
  }
}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "asset_data_result",
              strict: false,
              schema: {
                type: "object",
                properties: {
                  assets: { type: "array" },
                  summary: { type: "object" },
                },
                required: ["assets", "summary"],
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "자산 데이터 생성 실패" });
        const result = typeof content === "string" ? JSON.parse(content) : content;

        return { success: true, data: result };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "자산 데이터 자동완성 중 오류가 발생했습니다." });
      }
    }),

  /**
   * 법적 유언장 초안 자동 생성
   * - 신분증 정보 + 자산 데이터 + 상속인 목록 → 한국 민법 기반 유언장 자동 작성
   * - 민법 제1065조~1072조 (공정증서 유언 요건 포함)
   */
  generateWillDraft: protectedProcedure
    .input(z.object({
      // 유언자 정보 (신분증 스캔 결과)
      testator: z.object({
        name: z.string(),
        idNumber: z.string().optional(),
        birthDate: z.string().optional(),
        address: z.string().optional(),
        nationality: z.string().optional(),
      }),
      // 자산 목록 (buildAssetData 결과)
      assets: z.array(z.object({
        id: z.string(),
        categoryLabel: z.string(),
        name: z.string(),
        description: z.string().optional(),
        estimatedValue: z.string().optional(),
        location: z.string().optional(),
        issuer: z.string().optional(),
        notes: z.string().optional(),
      })),
      // 상속인 목록 (DB heirs 또는 직접 입력)
      heirs: z.array(z.object({
        priority: z.number(),
        name: z.string(),
        relationship: z.string(),
        shareValue: z.string().optional(),
        shareType: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
      })),
      // 추가 지시사항
      specialInstructions: z.object({
        funeralWish: z.string().optional(),
        executor: z.string().optional(),
        donationAmount: z.string().optional(),
        donationOrg: z.string().optional(),
        petCare: z.string().optional(),
        otherWishes: z.string().optional(),
      }).optional(),
      // 유언 유형
      willType: z.enum(["holographic", "notarial", "electronic"]).default("electronic"),
    }))
    .mutation(async ({ input }) => {
      try {
        const today = new Date();
        const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `당신은 한국 민법 전문 유언장 작성 전문가입니다.
              
              한국 민법 유언 관련 조항:
              - 제1065조: 유언의 방식 (자필증서, 녹음, 공정증서, 비밀증서, 구수증서)
              - 제1066조: 자필증서에 의한 유언 (전문 자필, 연월일, 주소, 성명 자필, 날인)
              - 제1068조: 공정증서에 의한 유언 요건
              - 제1073조: 유언의 효력 발생 시기 (사망 시)
              - 제1112조~1118조: 유류분 (직계비속·배우자 1/2, 직계존속·형제자매 1/3)
              - 제1000조: 상속 순위 (직계비속→직계존속→형제자매→4촌이내 방계혈족)
              
              중요 규칙:
              1. "법적 효력 보장" 표현 금지 → "민법 요건에 따라 작성된" 표현 사용
              2. 유류분 침해 여부 자동 검토 및 경고 포함
              3. 상속세 납부 의무 안내 포함
              4. 전문적이고 공식적인 문어체 사용
              5. 날짜, 장소, 서명란 포함`,
            },
            {
              role: "user",
              content: `다음 정보를 바탕으로 한국 민법 기준 유언장 초안을 작성하세요.

## 유언자 정보
- 성명: ${input.testator.name}
- 주민등록번호: ${input.testator.idNumber || "미확인"}
- 생년월일: ${input.testator.birthDate || "미확인"}
- 주소: ${input.testator.address || "미확인"}
- 국적: ${input.testator.nationality || "대한민국"}

## 자산 목록
${input.assets.map((a, i) => `${i + 1}. [${a.categoryLabel}] ${a.name}
   - 설명: ${a.description || ""}
   - 추정가치: ${a.estimatedValue ? Number(a.estimatedValue).toLocaleString() + "원" : "미확인"}
   - 소재지: ${a.location || ""}
   - 발급기관: ${a.issuer || ""}
   - 비고: ${a.notes || ""}`).join("\n")}

## 상속인 목록
${input.heirs.map((h) => `- ${h.priority}순위: ${h.name} (${h.relationship})
   - 분배: ${h.shareValue || "미정"} ${h.shareType === "percent" ? "%" : "원"}
   - 주소: ${h.address || "미확인"}
   - 연락처: ${h.phone || "미확인"}`).join("\n")}

## 특별 지시사항
- 장례 방식: ${input.specialInstructions?.funeralWish || "미지정"}
- 유언 집행자: ${input.specialInstructions?.executor || "1순위 상속인"}
- 사회 기부: ${input.specialInstructions?.donationAmount ? input.specialInstructions.donationAmount + "원" : "없음"} (${input.specialInstructions?.donationOrg || ""})
- 반려동물 돌봄: ${input.specialInstructions?.petCare || "없음"}
- 기타: ${input.specialInstructions?.otherWishes || "없음"}

## 작성 날짜
${dateStr}

다음 JSON 형식으로 반환하세요:
{
  "willText": "완성된 유언장 전문 (한국어, 공식 문어체, 마크다운 사용 가능)",
  "legalWarnings": ["유류분 경고", "상속세 안내 등 법적 주의사항 배열"],
  "inheritanceRatioCheck": {
    "isValid": true,
    "totalPercent": 100,
    "issues": ["분배 비율 문제점 배열"]
  },
  "estimatedInheritanceTax": "상속세 추정액 (원화)",
  "recommendedActions": ["공증 권장", "변호사 검토 권장 등 추천 조치 배열"],
  "willSummary": "유언장 핵심 내용 3줄 요약"
}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "will_draft_result",
              strict: false,
              schema: {
                type: "object",
                properties: {
                  willText: { type: "string" },
                  legalWarnings: { type: "array" },
                  inheritanceRatioCheck: { type: "object" },
                  estimatedInheritanceTax: { type: "string" },
                  recommendedActions: { type: "array" },
                  willSummary: { type: "string" },
                },
                required: ["willText", "legalWarnings", "inheritanceRatioCheck", "estimatedInheritanceTax", "recommendedActions", "willSummary"],
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "유언장 생성 실패" });
        const result = typeof content === "string" ? JSON.parse(content) : content;

        return {
          success: true,
          data: {
            ...result,
            generatedAt: new Date().toISOString(),
            testatorName: input.testator.name,
            assetCount: input.assets.length,
            heirCount: input.heirs.length,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "유언장 자동 생성 중 오류가 발생했습니다." });
      }
    }),

  /**
   * 자산증명서 이미지 AI OCR 분석 + DB 저장 (무제한 다중 업로드)
   */
  scanAndSaveAssetDocument: protectedProcedure
    .input(z.object({
      imageUrl: z.string().min(1),
      docTypeHint: z.enum(ASSET_DOC_TYPES).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (userRows.length === 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      const userId = userRows[0].id;
      const docTypeHint = input.docTypeHint || "other";

      // ── 파일 유형 판단 ──
      const rawDataUrl = input.imageUrl;
      const mimeTypeMatch = rawDataUrl.match(/^data:([^;]+);base64,/);
      const fileMimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const isPdfFile = fileMimeType === "application/pdf";
      const isDocFile = [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/haansofthwp", "application/x-hwp",
        "text/plain",
      ].includes(fileMimeType);
      const isImageFile = fileMimeType.startsWith("image/");

      // ── AI OCR 분석 ──
      let ocrResult: any = {
        detectedDocType: docTypeHint,
        docTypeLabel: DOC_TYPE_LABELS[docTypeHint],
        issuer: null, ownerName: null, assetName: null, assetCode: null,
        amount: null, unit: null, referenceDate: null, location: null,
        area: null, beneficiary: null, additionalInfo: null,
        confidence: "low", estimatedValue: null,
      };
      try {
        // PDF는 file_url 타입으로 전송, 다른 문서는 텍스트 설명만 전송
        let userContent: any[];
        if (isPdfFile) {
          userContent = [
            { type: "text", text: `이 자산증명서 PDF(${DOC_TYPE_LABELS[docTypeHint]})를 분석해주세요.` },
            { type: "file_url", file_url: { url: rawDataUrl, mime_type: "application/pdf" } },
          ];
        } else if (isImageFile) {
          userContent = [
            { type: "text", text: `이 자산증명서(${DOC_TYPE_LABELS[docTypeHint]})를 분석해주세요.` },
            { type: "image_url", image_url: { url: rawDataUrl, detail: "high" } },
          ];
        } else {
          // Word/Excel/HWP 등 기타 문서: 파일명에서 자산 유형 추정 후 텍스트만 전송
          userContent = [
            { type: "text", text: `다음 자산 서류(${DOC_TYPE_LABELS[docTypeHint]})에 대한 정보를 추출해주세요. 파일 형식: ${fileMimeType}. 서류 종류에 맞는 기본 정보를 JSON으로 반환하세요.` },
          ];
        }

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `당신은 한국 자산증명서 OCR 전문가입니다. 파일에서 자산 정보를 추출하세요. 힌트: "${DOC_TYPE_LABELS[docTypeHint]}". 계좌번호/주민번호는 마지막 4자리만 표시. JSON만 반환.`,
            },
            {
              role: "user",
              content: userContent,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "asset_ocr",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  detectedDocType: { type: "string" },
                  docTypeLabel: { type: "string" },
                  issuer: { type: ["string", "null"] },
                  ownerName: { type: ["string", "null"] },
                  assetName: { type: ["string", "null"] },
                  assetCode: { type: ["string", "null"] },
                  amount: { type: ["string", "null"] },
                  unit: { type: ["string", "null"] },
                  referenceDate: { type: ["string", "null"] },
                  location: { type: ["string", "null"] },
                  area: { type: ["string", "null"] },
                  beneficiary: { type: ["string", "null"] },
                  additionalInfo: { type: ["string", "null"] },
                  confidence: { type: "string" },
                  estimatedValue: { type: ["string", "null"] },
                },
                required: ["detectedDocType", "docTypeLabel", "confidence"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        if (content) ocrResult = typeof content === "string" ? JSON.parse(content) : content;
      } catch (e) {
        console.error("[willAuto] OCR 실패:", e);
      }

      // ── S3에 파일 저장 (이미지·PDF·문서 모두) ──
      let savedImageKey: string | null = null;
      let savedImageUrl: string | null = null;
      try {
        if (rawDataUrl.startsWith("data:")) {
          const matches = rawDataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const buffer = Buffer.from(matches[2], "base64");
            // MIME 타입별 확장자 매핑
            const extMap: Record<string, string> = {
              "application/pdf": "pdf",
              "application/msword": "doc",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
              "application/vnd.ms-excel": "xls",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
              "application/haansofthwp": "hwp",
              "application/x-hwp": "hwp",
              "text/plain": "txt",
            };
            const ext = extMap[mimeType] || mimeType.split("/")[1] || "bin";
            const folder = isPdfFile || isDocFile ? "asset-docs" : "asset-scans";
            const { key, url } = await storagePut(`${folder}/${userId}/${Date.now()}.${ext}`, buffer, mimeType);
            savedImageKey = key;
            savedImageUrl = url;
          }
        } else if (rawDataUrl.startsWith("http")) {
          savedImageUrl = rawDataUrl;
        }
      } catch (e) {
        console.error("[willAuto] S3 저장 실패:", e);
      }

      // ── DB에 저장 ──
      // 사용자가 선택한 서류 유형을 강제 고정 (AI가 임의로 바꾸지 못하게)
      const validDocType = docTypeHint as typeof ASSET_DOC_TYPES[number];

      await db.insert(willAssetScans).values({
        userId,
        docType: validDocType,
        docTypeLabel: DOC_TYPE_LABELS[validDocType],
        issuer: ocrResult.issuer || null,
        ownerName: ocrResult.ownerName || null,
        assetName: ocrResult.assetName || null,
        assetCode: ocrResult.assetCode || null,
        amount: ocrResult.amount || null,
        unit: ocrResult.unit || null,
        referenceDate: ocrResult.referenceDate || null,
        location: ocrResult.location || null,
        area: ocrResult.area || null,
        beneficiary: ocrResult.beneficiary || null,
        additionalInfo: ocrResult.additionalInfo || null,
        confidence: ocrResult.confidence || "medium",
        imageKey: savedImageKey,
        imageUrl: savedImageUrl,
        estimatedValue: (() => { const v = Number(String(ocrResult.estimatedValue || "").replace(/[^0-9.]/g, "")); return isNaN(v) || v === 0 ? null : v; })(),
        status: "done",
        sortOrder: 0,
      });

      const newRows = await db.select().from(willAssetScans)
        .where(eq(willAssetScans.userId, userId))
        .orderBy(desc(willAssetScans.createdAt)).limit(1);

      return { success: true, data: { id: newRows[0]?.id || 0, ...ocrResult, imageUrl: savedImageUrl } };
    }),

  /**
   * 사용자의 자산증명서 스캔 목록 조회 (최신순)
   */
  listAssetScans: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (userRows.length === 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      const scans = await db.select().from(willAssetScans)
        .where(eq(willAssetScans.userId, userRows[0].id))
        .orderBy(desc(willAssetScans.createdAt));
      // imageKey가 있으면 presigned URL 생성 (배포 환경에서 /manus-storage/ 경로 대신 사용)
      const { storageGetSignedUrl } = await import('../storage.js');
      const scansWithUrl = await Promise.all(scans.map(async (scan) => {
        let previewUrl: string | null = scan.imageUrl ?? null;
        if (scan.imageKey) {
          try {
            previewUrl = await storageGetSignedUrl(scan.imageKey);
          } catch { /* fallback to imageUrl */ }
        }
        return { ...scan, previewUrl };
      }));
      return { success: true, scans: scansWithUrl };
    }),

  /**
   * 자산증명서 스캔 삭제
   */
  deleteAssetScan: protectedProcedure
    .input(z.object({ scanId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (userRows.length === 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      const scanRows = await db.select().from(willAssetScans).where(eq(willAssetScans.id, input.scanId)).limit(1);
      if (scanRows.length === 0 || scanRows[0].userId !== userRows[0].id)
        throw new TRPCError({ code: "FORBIDDEN", message: "삭제 권한이 없습니다." });
      await db.delete(willAssetScans).where(eq(willAssetScans.id, input.scanId));
      return { success: true };
    }),

  /**
   * 자산증명서 메모 및 추정가치 수정
   */
  updateAssetScanMemo: protectedProcedure
    .input(z.object({
      scanId: z.number(),
      userMemo: z.string().optional(),
      estimatedValue: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (userRows.length === 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      const scanRows = await db.select().from(willAssetScans).where(eq(willAssetScans.id, input.scanId)).limit(1);
      if (scanRows.length === 0 || scanRows[0].userId !== userRows[0].id)
        throw new TRPCError({ code: "FORBIDDEN", message: "수정 권한이 없습니다." });
      await db.update(willAssetScans)
        .set({
          userMemo: input.userMemo ?? scanRows[0].userMemo,
          estimatedValue: input.estimatedValue ?? scanRows[0].estimatedValue,
        })
        .where(eq(willAssetScans.id, input.scanId));
      return { success: true };
    }),

  /**
   * 주민등록등본 / 기본증명서 OCR 자동 추출 → 유언자 정보 업데이트
   * 업로드된 이미지/PDF에서 성명, 주민번호, 주소를 추출하여 users 테이블 업데이트
   */
  extractTestatorFromDoc: protectedProcedure
    .input(z.object({
      imageUrl: z.string().min(1),
      docType: z.enum(["resident_register", "basic_certificate"]).default("resident_register"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (userRows.length === 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      const userId = userRows[0].id;

      const docLabel = input.docType === "resident_register" ? "주민등록등본" : "기본증명서";
      const rawDataUrl = input.imageUrl;
      const mimeTypeMatch = rawDataUrl.match(/^data:([^;]+);base64,/);
      const fileMimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const isPdfFile = fileMimeType === "application/pdf";
      const isImageFile = fileMimeType.startsWith("image/");

      let ocrResult: {
        name: string | null;
        residentNumber: string | null;
        address: string | null;
        birthDate: string | null;
        confidence: string;
      } = { name: null, residentNumber: null, address: null, birthDate: null, confidence: "low" };

      try {
        let userContent: any[];
        if (isPdfFile) {
          userContent = [
            { type: "text", text: `이 ${docLabel} PDF에서 유언자 정보를 추출해주세요.` },
            { type: "file_url", file_url: { url: rawDataUrl, mime_type: "application/pdf" } },
          ];
        } else if (isImageFile) {
          userContent = [
            { type: "text", text: `이 ${docLabel} 이미지에서 유언자 정보를 추출해주세요.` },
            { type: "image_url", image_url: { url: rawDataUrl, detail: "high" } },
          ];
        } else {
          userContent = [{ type: "text", text: `${docLabel} 서류에서 유언자 정보를 추출해주세요.` }];
        }

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `당신은 한국 공문서 OCR 전문가입니다. ${docLabel}에서 유언자 정보를 정확히 추출하세요. 주민등록번호는 뒤 7자리를 *로 마스킹 (690812-*******). JSON만 반환.`,
            },
            { role: "user", content: userContent },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "testator_info",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  name: { type: ["string", "null"] },
                  residentNumber: { type: ["string", "null"] },
                  address: { type: ["string", "null"] },
                  birthDate: { type: ["string", "null"] },
                  confidence: { type: "string" },
                },
                required: ["name", "residentNumber", "address", "birthDate", "confidence"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        if (content) ocrResult = typeof content === "string" ? JSON.parse(content) : content;
      } catch (e) {
        console.error("[willAuto] 유언자 OCR 실패:", e);
      }

      // users 테이블 업데이트 (추출된 정보만)
      const updateData: Record<string, any> = {};
      if (ocrResult.name) updateData.name = ocrResult.name;
      if (ocrResult.residentNumber) updateData.residentNumberMasked = ocrResult.residentNumber;
      if (ocrResult.address) updateData.address = ocrResult.address;
      if (ocrResult.birthDate) updateData.birthDate = ocrResult.birthDate;

      if (Object.keys(updateData).length > 0) {
        await db.update(users).set(updateData).where(eq(users.id, userId));
      }

      return {
        success: true,
        extracted: ocrResult,
        updated: Object.keys(updateData),
      };
    }),

  /**
   * 로그인 사용자의 상속인 목록 조회 (유언장 생성용)
   */
  getHeirsForWill: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (userRows.length === 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });

      const heirRows = await db.select().from(heirs).where(eq(heirs.userId, userRows[0].id));
      return { success: true, heirs: heirRows };
    }),
});
