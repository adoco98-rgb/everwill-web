/**
 * 신분증 스캔 OCR 라우터
 * - 신분증/여권 이미지 업로드 → AI 이미지 분석 → 이름/번호/생년월일 자동 추출
 * - 지원 서류: 주민등록증, 운전면허증, 여권, 각국 국가신분증
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

/**
 * 국가별 신분증 번호 형식 정보
 */
const ID_NUMBER_FORMATS: Record<string, { name: string; format: string }> = {
  KR: { name: "주민등록번호", format: "000000-0000000" },
  JP: { name: "マイナンバー", format: "000000000000" },
  CN: { name: "居民身份证号", format: "000000000000000000" },
  US: { name: "SSN", format: "000-00-0000" },
  GB: { name: "NI Number", format: "AA 000000 A" },
  DE: { name: "Steueridentifikationsnummer", format: "00000000000" },
  SA: { name: "National ID", format: "0000000000" },
  AE: { name: "Emirates ID", format: "000-0000-0000000-0" },
  FR: { name: "Numéro de Sécurité Sociale", format: "0 00 00 00 000 000 00" },
  BR: { name: "CPF", format: "000.000.000-00" },
  IN: { name: "Aadhaar Number", format: "0000 0000 0000" },
};

export const idScanRouter = router({
  /**
   * 신분증 이미지 OCR 분석
   * - 이미지 URL을 받아 AI로 분석 후 이름/번호/생년월일 반환
   */
  scanId: publicProcedure
    .input(z.object({
      imageUrl: z.string().refine(
        (v) => v.startsWith('http') || v.startsWith('data:image/'),
        { message: '올바른 이미지 URL 또는 data URL을 입력해주세요' }
      ),
      docType: z.enum(["id_card", "passport", "driver_license", "auto"]).default("auto"),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert OCR system for identity documents. Extract information from the provided identity document image.
              
              IMPORTANT RULES:
              1. Extract ONLY clearly visible text - do not guess or infer
              2. For ID numbers, preserve exact format including dashes and spaces
              3. For dates, convert to YYYY-MM-DD format
              4. Detect the document type and country automatically
              5. If information is not clearly visible, return null for that field
              6. Return structured JSON only`,
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: input.imageUrl,
                    detail: "high",
                  },
                },
                {
                  type: "text",
                  text: `Analyze this identity document and extract the following information. Return ONLY valid JSON with no additional text:
                  {
                    "docType": "id_card|passport|driver_license|residence_card|other",
                    "country": "ISO 2-letter country code (e.g., KR, US, JP)",
                    "name": "Full name as shown on document",
                    "nameLocal": "Name in local script if different from Latin",
                    "idNumber": "ID/passport number with original formatting",
                    "idNumberType": "Type of ID number (e.g., 주민등록번호, SSN, Passport No.)",
                    "birthDate": "Date of birth in YYYY-MM-DD format",
                    "expiryDate": "Expiry date in YYYY-MM-DD format if applicable",
                    "nationality": "Nationality as shown on document",
                    "gender": "M or F if shown",
                    "confidence": "high|medium|low - overall confidence in extraction accuracy"
                  }`,
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "id_scan_result",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  docType: { type: "string" },
                  country: { type: ["string", "null"] },
                  name: { type: ["string", "null"] },
                  nameLocal: { type: ["string", "null"] },
                  idNumber: { type: ["string", "null"] },
                  idNumberType: { type: ["string", "null"] },
                  birthDate: { type: ["string", "null"] },
                  expiryDate: { type: ["string", "null"] },
                  nationality: { type: ["string", "null"] },
                  gender: { type: ["string", "null"] },
                  confidence: { type: "string" },
                },
                required: ["docType", "country", "name", "nameLocal", "idNumber", "idNumberType", "birthDate", "expiryDate", "nationality", "gender", "confidence"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "신분증 분석에 실패했습니다. 다시 시도해주세요.",
          });
        }

        const result = typeof content === "string" ? JSON.parse(content) : content;

        // 국가별 신분증 번호 형식 정보 추가
        const countryCode = result.country?.toUpperCase();
        const idFormat = countryCode ? ID_NUMBER_FORMATS[countryCode] : null;

        return {
          success: true,
          data: {
            ...result,
            idNumberFormat: idFormat?.format || null,
            idNumberLabel: idFormat?.name || result.idNumberType || "신분증 번호",
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[idScan] OCR 분석 오류:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "신분증 분석 중 오류가 발생했습니다. 이미지를 다시 확인해주세요.",
        });
      }
    }),
});
