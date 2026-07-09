/**
 * Step 1: 유언자 기본 정보
 * - 로그인 사용자 프로필 자동 채움
 * - 거주 구가 선택으로 주소 검색 방식 자동 전환 (한국: 카카오, 해외: Google Places)
 * - 주민등록번호 자동 하이픈
 * - 전화번호 국가코드 선택
 */
import { useState, useEffect, useRef } from "react";
import type { StepProps } from "./StepProps";
import AIGuide from "../AIGuide";
import GlobalAddressSearch from "../GlobalAddressSearch";
import PhoneInput from "../PhoneInput";
import { formatRRN, PHONE_CODE_TO_ISO } from "@/lib/formatUtils";
import { trpc } from "@/lib/trpc";
import { Sparkles, Upload, CheckCircle2, X, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// 국가 목록 (ISO 코드 + 한국어 이름)
const COUNTRIES = [
  { code: "KR", label: "🇰🇷 대한민국" },
  { code: "US", label: "🇺🇸 미국" },
  { code: "JP", label: "🇯🇵 일본" },
  { code: "CN", label: "🇨🇳 중국" },
  { code: "HK", label: "🇭🇰 홍콩" },
  { code: "TW", label: "🇹🇼 대만" },
  { code: "GB", label: "🇬🇧 영국" },
  { code: "DE", label: "🇩🇪 독일" },
  { code: "FR", label: "🇫🇷 프랑스" },
  { code: "ES", label: "🇪🇸 스페인" },
  { code: "AU", label: "🇦🇺 호주" },
  { code: "CA", label: "🇨🇦 캐나다" },
  { code: "SA", label: "🇸🇦 사우디" },
  { code: "AE", label: "🇦🇪 UAE" },
  { code: "IN", label: "🇮🇳 인도" },
  { code: "BR", label: "🇧🇷 브라질" },
];

export default function Step1Testator({ will, update }: StepProps) {
  const [countryCode, setCountryCode] = useState<string>("KR");
  const [phoneCode, setPhoneCode] = useState<string>("+82");
  const [autoFilled, setAutoFilled] = useState(false);

  // 로그인 사용자 정보 가져오기
  const { data: me } = trpc.auth.me.useQuery();

  // 프로필 자동 채움: 유언자 이름이 비어있을 때만 실행
  useEffect(() => {
    if (!me || autoFilled) return;
    if (will.testatorName && will.testatorName.trim() !== "") return; // 이미 입력된 경우 스킵

    const updates: Partial<typeof will> = {};
    let didFill = false;

    if (me.name && !will.testatorName) {
      updates.testatorName = me.name;
      didFill = true;
    }
    if ((me as any).phone && !will.testatorPhone) {
      updates.testatorPhone = (me as any).phone;
      const matchedCode = Object.entries(PHONE_CODE_TO_ISO).find(([, iso]) => iso === ((me as any).country || "KR"));
      if (matchedCode) setPhoneCode(matchedCode[0]);
      didFill = true;
    }
    if ((me as any).address && !will.testatorAddress) {
      updates.testatorAddress = (me as any).address;
      didFill = true;
    }
    if ((me as any).country) {
      setCountryCode((me as any).country);
    }
    // 작성일 자동 설정
    if (!will.writtenDate) {
      updates.writtenDate = new Date().toISOString().slice(0, 10);
      didFill = true;
    }

    if (Object.keys(updates).length > 0) {
      update(updates);
    }
    if (didFill) setAutoFilled(true);
  }, [me]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRRN = (val: string) => {
    update({ testatorRRN: formatRRN(val) });
  };

  const phoneNumberOnly = will.testatorPhone
    ? will.testatorPhone.replace(/^\+\d+\s?/, "")
    : "";

  return (
    <div className="space-y-5">
      {/* 자동 채움 안내 배너 */}
      {autoFilled && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>회원님의 프로필 정보를 자동으로 채워드렸습니다. 확인 후 수정해 주세요.</span>
        </div>
      )}

      {/* AI 안내 말풍선 */}
      <AIGuide
        question="안녕하세요! 먼저 유언자 본인의 정보를 확인할게요. 성함과 주민등록번호를 입력해 주세요."
        description="유언장은 반드시 유언자 본인이 작성해야 법적 효력이 있습니다. 입력하신 정보는 E2E 암호화로 안전하게 보관되며, 유언장 인증 시 본인 확인에 사용됩니다."
        examples={[
          "성명: 홍길동 / 주민등록번호: 550101-1234567 / 주소: 서울특별시 강남구 테헤란로 123, 101동 1001호",
          "해외 거주자: 영문 이름도 함께 입력 가능합니다 (예: Hong Gil-dong)",
        ]}
        tips={[
          "주민등록번호는 유언장 법적 효력 확인에 필수입니다. 여권번호로 대체 가능합니다.",
          "주소는 현재 실제 거주지를 입력해 주세요. 등록 주소와 다를 경우 둘 다 기재하면 좋습니다.",
          "작성일은 오늘 날짜로 자동 설정됩니다. 실제 서명 날짜와 일치해야 합니다.",
        ]}
        warning="주민등록번호는 반드시 정확하게 입력해야 합니다. 오류 시 유언장 인증이 거부될 수 있습니다."
      />

      {/* 법적 근거 */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>민법 제1066조</strong> — 자필증서 유언은 유언자가 전문·연월일·주소·성명을 자필로 기재하고 날인해야 합니다.
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
            성명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={will.testatorName}
            onChange={(e) => update({ testatorName: e.target.value })}
            placeholder="홍길동"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
            주민등록번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={will.testatorRRN}
            onChange={(e) => handleRRN(e.target.value)}
            placeholder="000000-0000000"
            maxLength={14}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
          />
          <p className="text-xs text-gray-400 mt-1">E2E 암호화로 안전하게 보관됩니다</p>
        </div>
      </div>

      {/* 거주 국가 선택 */}
      <div>
        <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
          거주 국가 <span className="text-red-500">*</span>
        </label>
        <select
          value={countryCode}
          onChange={(e) => {
            setCountryCode(e.target.value);
            update({ testatorAddress: "" });
            const matchedPhone = Object.entries(PHONE_CODE_TO_ISO).find(([, iso]) => iso === e.target.value);
            if (matchedPhone) setPhoneCode(matchedPhone[0]);
          }}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] transition-all"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* 주소 - 모든 국가 자동검색 */}
      <GlobalAddressSearch
        label="주소"
        required
        value={will.testatorAddress}
        onChange={(address) => update({ testatorAddress: address })}
        countryCode={countryCode}
        placeholder={countryCode === "KR" ? "주소 검색 버튼을 눌러주세요" : "Start typing your address..."}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">연락처</label>
          <PhoneInput
            countryCode={phoneCode}
            phone={phoneNumberOnly}
            onCountryCodeChange={(code) => {
              setPhoneCode(code);
              update({ testatorPhone: `${code} ${phoneNumberOnly}` });
            }}
            onPhoneChange={(phone) => update({ testatorPhone: `${phoneCode} ${phone}` })}
            placeholder={countryCode === "KR" ? "010-0000-0000" : "Phone number"}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
            작성일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={will.writtenDate}
            onChange={(e) => update({ writtenDate: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
          />
        </div>
      </div>

      {/* 건강증명서 선택 업로드 */}
      <HealthCertUpload will={will} update={update} />
    </div>
  );
}

/** 건강증명서 업로드 컴포넌트 */
function HealthCertUpload({ will, update }: Pick<StepProps, "will" | "update">) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const uploadMutation = trpc.will.uploadFile.useMutation();

  // 발급일이 1개월 이내인지 검증
  const isWithinOneMonth = (dateStr: string) => {
    if (!dateStr) return true;
    const issued = new Date(dateStr);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return issued >= oneMonthAgo;
  };

  const dateValid = isWithinOneMonth(will.healthCertDate);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 형식 검증
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("이미지(JPG/PNG/WEBP) 또는 PDF만 업로드 가능합니다.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setUploading(true);
    try {
      // Base64로 변환 후 업로드
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadMutation.mutateAsync({
        fileName: `health-cert-${Date.now()}-${file.name}`,
        fileData: base64,
        mimeType: file.type,
      });
      update({ healthCertUrl: result.url });
      toast.success("건강증명서가 업로드되었습니다.");
    } catch {
      toast.error("업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border border-dashed border-[#C9A961]/50 rounded-2xl p-5 bg-[#C9A961]/5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 bg-[#C9A961]/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-[#C9A961]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#1F3864]">건강증명서 업로드</h4>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">선택</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">보건소 발급 건강증명서 업로드 시 유언 분쟁 시 의사능력 입증에 활용됩니다. (발급 1개월 이내)</p>
        </div>
      </div>

      {/* 발급일 입력 */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-600 mb-1">발급일</label>
        <input
          type="date"
          value={will.healthCertDate}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => update({ healthCertDate: e.target.value })}
          className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none transition-all ${
            will.healthCertDate && !dateValid
              ? "border-red-400 bg-red-50 focus:border-red-400"
              : "border-gray-200 focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10"
          }`}
        />
        {will.healthCertDate && !dateValid && (
          <div className="flex items-center gap-1.5 mt-1.5 text-red-500">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-xs">발급일이 1개월을 초과했습니다. 최신 발급서를 업로드해주세요.</span>
          </div>
        )}
      </div>

      {/* 파일 업로드 */}
      {will.healthCertUrl ? (
        <div className="flex items-center justify-between bg-white border border-[#C9A961]/30 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-700">건강증명서 업로드 완료</span>
          </div>
          <button
            type="button"
            onClick={() => update({ healthCertUrl: "", healthCertDate: "" })}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 border border-[#C9A961]/40 rounded-xl px-4 py-3 text-sm text-[#C9A961] hover:bg-[#C9A961]/10 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />
              업로드 중...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              파일 선택 (JPG / PNG / PDF, 최대 10MB)
            </>
          )}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
