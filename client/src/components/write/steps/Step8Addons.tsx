import { Video, PenLine, Check, Info, Scale } from "lucide-react";
import type { StepProps } from "./StepProps";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Step8Addons({ will, update }: StepProps) {
  const { t, language } = useLanguage();
  const isKo = language === "ko";

  // 추가 인증 설명 텍스트 (번역 파일 연동)
  const s = t.services;

  return (
    <div className="space-y-5">
      {/* 추가 인증 개념 안내 배너 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-800 text-sm font-semibold mb-1">
            {isKo ? "기본 가입만으로도 법적 효력이 있습니다" : (s.s2AdditionalAuth || "Optional Additional Certification")}
          </p>
          <p className="text-blue-700 text-xs leading-relaxed">
            {isKo
              ? "에버윌 기본 가입 + eKYC 전자 인증만으로 법적 효력 있는 유언장이 완성됩니다. 아래 추가 인증 서비스는 더 높은 수준의 법적 확실성을 원하시는 분들을 위한 선택적 옵션입니다."
              : (language === "ja"
                ? "EverWillの基本会員登録とeKYC電子認証だけで、法的効力のある遺言書が完成します。以下の追加認証サービスは、より高い法的確実性をお求めの方のための任意オプションです。"
                : language === "zh"
                ? "仅凭EverWill基础会员注册和eKYC电子认证，即可完成具有法律效力的遗嘱。以下附加认证服务是为希望获得更高法律确定性的用户提供的可选选项。"
                : language === "ar"
                ? "التسجيل الأساسي في EverWill مع التوثيق الإلكتروني eKYC وحده يُنشئ وصية ذات صلاحية قانونية كاملة. خدمات التوثيق الإضافية أدناه خيارات اختيارية لمن يرغب في مستوى أعلى من اليقين القانوني."
                : "EverWill basic membership + eKYC electronic certification alone creates a legally valid will. The additional certification services below are optional for those seeking an even higher level of legal certainty."
              )
            }
          </p>
        </div>
      </div>

      <p className="text-gray-500 text-sm">
        {isKo ? "선택 사항입니다. 나중에 추가할 수도 있습니다." : "Optional. You can add these later as well."}
      </p>

      {/* 영상 유언장 */}
      <div
        onClick={() => update({ hasVideoWill: !will.hasVideoWill })}
        className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
          will.hasVideoWill
            ? "border-[#1F3864] bg-[#1F3864]/4"
            : "border-gray-200 bg-white hover:border-[#1F3864]/30"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-[#1F3864]">{s.s2Title || (isKo ? "영상 유언장" : "Video Will")}</h4>
              <p className="text-gray-400 text-sm">{isKo ? "법적 녹음 유언 + 가족 감성 메시지" : "Legal recorded will + emotional family messages"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-600 font-bold">{isKo ? "+₩29,000" : "+$29"}</span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              will.hasVideoWill ? "bg-[#1F3864] border-[#1F3864]" : "border-gray-300"
            }`}>
              {will.hasVideoWill && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 ml-16">
          {(isKo
            ? ["AI 낭독 스크립트 자동 생성", "녹화 중 실시간 가이드", "블록체인 해시 기록", '"손녀 성인 되는 날" 등 공개 타이밍 설정', "평생 보관"]
            : [s.s8Detail1, s.s8Detail2, s.s8Detail3, s.s8Detail5, s.s8Detail6]
          ).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
              <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />{f}
            </li>
          ))}
        </ul>

        {/* 추가 인증 법적 근거 설명 */}
        <div className="mt-4 ml-16 bg-purple-50 border border-purple-100 rounded-lg p-3 flex items-start gap-2">
          <Scale className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-purple-700 text-xs font-semibold mb-0.5">
              {s.s2AdditionalAuth || (isKo ? "추가 인증 서비스" : "Optional Additional Certification")}
            </p>
            <p className="text-purple-600 text-xs leading-relaxed">
              {s.s2LegalNote || (isKo ? "기본 가입만으로도 법적 효력이 있는 유언장이 완성됩니다. 영상 유언장은 이를 더욱 확고히 하는 선택적 추가 인증입니다." : "Basic membership already creates a legally valid will. Video Will is an optional add-on for stronger legal certainty.")}
            </p>
            <p className="text-purple-500 text-[11px] mt-1 leading-relaxed">
              {s.s2LegalBase || ""}
            </p>
          </div>
        </div>
      </div>

      {/* 자필 유언장 스캔 */}
      <div
        onClick={() => update({ hasHandwrittenScan: !will.hasHandwrittenScan })}
        className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
          will.hasHandwrittenScan
            ? "border-[#1F3864] bg-[#1F3864]/4"
            : "border-gray-200 bg-white hover:border-[#1F3864]/30"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <PenLine className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-[#1F3864]">{s.s3Title || (isKo ? "자필 유언장 스캔 인증" : "Handwritten Will Scan")}</h4>
              <p className="text-gray-400 text-sm">{isKo ? "자필 원본 업로드 + AI 형식 검증" : "Upload photo → AI format validation"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-600 font-bold">{isKo ? "+₩19,000" : "+$19"}</span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              will.hasHandwrittenScan ? "bg-[#1F3864] border-[#1F3864]" : "border-gray-300"
            }`}>
              {will.hasHandwrittenScan && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 ml-16">
          {(isKo
            ? ["자필 여부·날짜·서명·날인 자동 체크", "위조 탐지 알고리즘", "블록체인 무결성 기록", "원본 위치 추적"]
            : [s.s9Detail3, s.s9Detail4, s.s9Detail5, s.s9Detail6]
          ).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
              <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />{f}
            </li>
          ))}
        </ul>

        {/* 추가 인증 법적 근거 설명 */}
        <div className="mt-4 ml-16 bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-2">
          <Scale className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-700 text-xs font-semibold mb-0.5">
              {s.s3AdditionalAuth || (isKo ? "추가 인증 서비스" : "Optional Additional Certification")}
            </p>
            <p className="text-amber-600 text-xs leading-relaxed">
              {s.s3LegalNote || (isKo ? "기본 가입만으로도 법적 효력이 있는 유언장이 완성됩니다. 자필 유언 스캔은 이를 더욱 확고히 하는 선택적 추가 인증입니다." : "Basic membership already creates a legally valid will. Handwritten Will Scan is an optional add-on for stronger legal certainty.")}
            </p>
            <p className="text-amber-500 text-[11px] mt-1 leading-relaxed">
              {s.s3LegalBase || ""}
            </p>
          </div>
        </div>
      </div>

      {/* 합계 */}
      {(will.hasVideoWill || will.hasHandwrittenScan) && (
        <div className="bg-[#1F3864] rounded-xl p-4 flex items-center justify-between">
          <span className="text-white/70 text-sm">
            {isKo ? "전자 인증 ₩49,000" : "Certification $39"}
            {will.hasVideoWill && (isKo ? " + 영상 ₩29,000" : " + Video $29")}
            {will.hasHandwrittenScan && (isKo ? " + 자필 ₩19,000" : " + Scan $19")}
          </span>
          <span className="text-[#C9A961] font-bold text-lg">
            {isKo
              ? `₩${(49000 + (will.hasVideoWill ? 29000 : 0) + (will.hasHandwrittenScan ? 19000 : 0)).toLocaleString()}`
              : `$${39 + (will.hasVideoWill ? 29 : 0) + (will.hasHandwrittenScan ? 19 : 0)}`
            }
          </span>
        </div>
      )}
    </div>
  );
}
