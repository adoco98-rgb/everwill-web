/**
 * Step 1: 유언자 기본 정보
 * - 로그인 사용자 프로필 자동 채움
 * - 거주 구가 선택으로 주소 검색 방식 자동 전환 (한국: 카카오, 해외: Google Places)
 * - 주민등록번호 자동 하이픈
 * - 전화번호 국가코드 선택
 */
import { useState, useEffect } from "react";
import type { StepProps } from "./StepProps";
import AIGuide from "../AIGuide";
import GlobalAddressSearch from "../GlobalAddressSearch";
import PhoneInput from "../PhoneInput";
import { formatRRN, PHONE_CODE_TO_ISO } from "@/lib/formatUtils";
import { trpc } from "@/lib/trpc";
import { Sparkles } from "lucide-react";

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
    </div>
  );
}
