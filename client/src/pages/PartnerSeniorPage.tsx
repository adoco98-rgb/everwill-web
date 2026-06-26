/**
 * 시니어 그룹 가입 페이지
 * 만 65세 이상 시니어 파트너 — 직접 홍보·지인 추천 특화
 * 가입비 VIP ₩199,000 (1회), 연 등록비 없음
 * 수수료 시작: 20% (헬퍼 기본 15%보다 높은 우대 시작)
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, ArrowRight, CheckCircle, Upload, User, MapPin, Globe, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PhoneVerifyField, EmailVerifyField } from "@/components/PartnerVerifyFields";

// 시니어 활동 유형
const SENIOR_TYPES = {
  ko: [
    // 의료·돌봄 경험
    "전직 간호사·의료인", "요양보호사·돌봄 경험자",
    // 종교·지역사회
    "종교 지도자 (목사·신부·스님 등)", "마을 이장·반장", "경로당 회장·임원",
    // 전문직 은퇴
    "은퇴 변호사·세무사", "은퇴 교사·교수", "은퇴 공무원",
    // 사회활동
    "노인복지관 자원봉사자", "시니어 클럽 회원", "동창회·향우회 임원",
    // 가족·지인 네트워크
    "자녀·손자녀 네트워크 보유", "지인 네트워크 활발",
    // 기타
    "기타"
  ],
  en: [
    "Retired Nurse / Medical Professional", "Caregiver / Care Experience",
    "Religious Leader (Pastor, Priest, Monk, etc.)", "Community Leader", "Senior Center Officer",
    "Retired Attorney / CPA", "Retired Teacher / Professor", "Retired Government Official",
    "Senior Welfare Center Volunteer", "Senior Club Member", "Alumni / Community Association Officer",
    "Family & Friends Network", "Active Social Network",
    "Other"
  ],
  ja: [
    "元看護師・医療従事者", "介護士・介護経験者",
    "宗教指導者（牧師・神父・僧侶など）", "地域リーダー", "老人クラブ役員",
    "元弁護士・税理士", "元教師・教授", "元公務員",
    "高齢者福祉センターボランティア", "シニアクラブ会員", "同窓会・郷友会役員",
    "家族・知人ネットワーク", "活発な社会ネットワーク",
    "その他"
  ],
  zh: [
    "退休护士/医疗人员", "护理员/护理经验者",
    "宗教领袖（牧师、神父、僧侣等）", "社区领导", "老年中心负责人",
    "退休律师/税务师", "退休教师/教授", "退休公务员",
    "老年福利中心志愿者", "老年俱乐部成员", "同学会/同乡会负责人",
    "家人朋友网络", "活跃社交网络",
    "其他"
  ],
};

const COUNTRIES = [
  { code: "KR", name: { ko: "한국", en: "South Korea", ja: "韓国", zh: "韩国" } },
  { code: "US", name: { ko: "미국", en: "United States", ja: "アメリカ", zh: "美国" } },
  { code: "JP", name: { ko: "일본", en: "Japan", ja: "日本", zh: "日本" } },
  { code: "CN", name: { ko: "중국", en: "China", ja: "中国", zh: "中国" } },
  { code: "DE", name: { ko: "독일", en: "Germany", ja: "ドイツ", zh: "德国" } },
  { code: "ES", name: { ko: "스페인", en: "Spain", ja: "スペイン", zh: "西班牙" } },
  { code: "FR", name: { ko: "프랑스", en: "France", ja: "フランス", zh: "法国" } },
  { code: "GB", name: { ko: "영국", en: "United Kingdom", ja: "イギリス", zh: "英国" } },
  { code: "AU", name: { ko: "호주", en: "Australia", ja: "オーストラリア", zh: "澳大利亚" } },
  { code: "CA", name: { ko: "캐나다", en: "Canada", ja: "カナダ", zh: "加拿大" } },
];

export default function PartnerSeniorPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const lang = (["ko", "en", "ja", "zh"].includes(language) ? language : "ko") as "ko" | "en" | "ja" | "zh";
  const texts = seniorTexts[lang] || seniorTexts.ko;

  const [step, setStep] = useState(1);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthYear: "",
    country: "KR",
    region: "",
    seniorType: "",
    networkSize: "",
    motivation: "",
    idFile: null as File | null,
    bankFile: null as File | null,
    referralCode: "",
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });

  const update = (field: string, value: unknown) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // 나이 검증 (만 65세 이상)
  const currentYear = new Date().getFullYear();
  const birthYearNum = parseInt(formData.birthYear);
  const age = formData.birthYear ? currentYear - birthYearNum : 0;
  const isAgeValid = age >= 65;

  const canNext1 =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.birthYear.trim() &&
    isAgeValid &&
    emailVerified &&
    phoneVerified;

  const canNext2 =
    formData.country &&
    formData.seniorType &&
    formData.networkSize;

  const canSubmit =
    formData.idFile &&
    formData.bankFile &&
    formData.agreeTerms &&
    formData.agreePrivacy;

  const handleFileChange = (field: "idFile" | "bankFile") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      update(field, file);
    };

  const handleSubmit = () => {
    alert(texts.submitSuccess);
    navigate("/partner/home");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#2D5016] via-[#3a6b1e] to-[#1a3a0a] py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #C9A961 0%, transparent 60%), radial-gradient(circle at 70% 30%, #fff 0%, transparent 50%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C9A961]/20 border border-[#C9A961]/40 text-[#C9A961] rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              {texts.heroBadge}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              {texts.heroTitle1}
              <br />
              <span className="text-[#C9A961]">{texts.heroTitle2}</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              {texts.heroSubtitle}
            </p>
            {/* 시니어 우대 배지 */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full text-[#C9A961] text-sm font-semibold">
                ✦ {texts.badge1}
              </span>
              <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm">
                ✦ {texts.badge2}
              </span>
              <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm">
                ✦ {texts.badge3}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 수수료 구조 요약 */}
      <section className="py-12 px-6 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#1A1A1A] text-center mb-6">{texts.commissionTitle}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#2D5016] text-white">
                  <th className="px-4 py-3 text-left rounded-tl-lg">{texts.colCumulative}</th>
                  <th className="px-4 py-3 text-center">{texts.colRate}</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">{texts.colNote}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { range: texts.tier1Range, rate: "20%", note: texts.tier1Note, highlight: true },
                  { range: texts.tier2Range, rate: "25%", note: "", highlight: false },
                  { range: texts.tier3Range, rate: "30%", note: "", highlight: false },
                  { range: texts.tier4Range, rate: "35%", note: "", highlight: false },
                  { range: texts.tier5Range, rate: "40%", note: texts.tier5Note, highlight: false },
                ].map((row, i) => (
                  <tr key={i} className={row.highlight ? "bg-[#C9A961]/10 font-semibold" : "border-b border-gray-100"}>
                    <td className="px-4 py-3 text-[#1A1A1A]">{row.range}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-lg ${row.highlight ? "text-[#2D5016]" : "text-[#1F3864]"}`}>{row.rate}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-[#6B7280] text-xs">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#6B7280] mt-3 text-center">{texts.commissionNote}</p>
        </div>
      </section>

      {/* 가입 폼 */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* 스텝 인디케이터 */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s ? "bg-[#2D5016] text-white shadow-lg" :
                  step > s ? "bg-[#C9A961] text-white" :
                  "bg-gray-200 text-gray-500"
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className={`w-16 h-1 rounded-full ${step > s ? "bg-[#C9A961]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            {/* STEP 1: 기본 정보 */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#2D5016]/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-[#2D5016]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A]">{texts.step1Title}</h3>
                    <p className="text-sm text-[#6B7280]">{texts.step1Subtitle}</p>
                  </div>
                </div>

                {/* 이름 */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{texts.labelName} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => update("name", e.target.value)}
                    placeholder={texts.placeholderName}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D5016] transition-colors"
                  />
                </div>

                {/* 출생연도 (만 65세 이상 검증) */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{texts.labelBirthYear} <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={formData.birthYear}
                    onChange={e => update("birthYear", e.target.value)}
                    placeholder={texts.placeholderBirthYear}
                    min="1900"
                    max={currentYear - 65}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-colors ${
                      formData.birthYear && !isAgeValid
                        ? "border-red-400 bg-red-50"
                        : formData.birthYear && isAgeValid
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 focus:border-[#2D5016]"
                    }`}
                  />
                  {formData.birthYear && !isAgeValid && (
                    <p className="text-red-500 text-xs mt-1">{texts.ageError}</p>
                  )}
                  {formData.birthYear && isAgeValid && (
                    <p className="text-green-600 text-xs mt-1">{texts.ageOk.replace("{age}", String(age))}</p>
                  )}
                </div>

                {/* 이메일 인증 */}
                <EmailVerifyField
                  email={formData.email}
                  onEmailChange={(v: string) => update("email", v)}
                  onVerified={() => setEmailVerified(true)}
                  verified={emailVerified}
                />

                {/* 휴대폰 인증 */}
                <PhoneVerifyField
                  phone={formData.phone}
                  onPhoneChange={(v: string) => update("phone", v)}
                  onVerified={() => setPhoneVerified(true)}
                  verified={phoneVerified}
                />

                <button
                  onClick={() => setStep(2)}
                  disabled={!canNext1}
                  className="w-full py-4 bg-[#2D5016] hover:bg-[#3a6b1e] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {texts.nextBtn} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: 활동 정보 */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#2D5016]/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#2D5016]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A]">{texts.step2Title}</h3>
                    <p className="text-sm text-[#6B7280]">{texts.step2Subtitle}</p>
                  </div>
                </div>

                {/* 국가 */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{texts.labelCountry} <span className="text-red-500">*</span></label>
                  <select
                    value={formData.country}
                    onChange={e => update("country", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D5016] bg-white"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name[lang]}</option>
                    ))}
                  </select>
                </div>

                {/* 지역 */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{texts.labelRegion}</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={e => update("region", e.target.value)}
                    placeholder={texts.placeholderRegion}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D5016] transition-colors"
                  />
                </div>

                {/* 활동 유형 */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.labelSeniorType} <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {SENIOR_TYPES[lang].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => update("seniorType", type)}
                        className={`px-3 py-2 rounded-lg text-sm text-left transition-all border ${
                          formData.seniorType === type
                            ? "bg-[#2D5016] text-white border-[#2D5016]"
                            : "bg-white text-[#1A1A1A] border-gray-200 hover:border-[#2D5016]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 예상 네트워크 규모 */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.labelNetworkSize} <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {texts.networkOptions.map((opt: string) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => update("networkSize", opt)}
                        className={`px-3 py-2.5 rounded-lg text-sm transition-all border ${
                          formData.networkSize === opt
                            ? "bg-[#2D5016] text-white border-[#2D5016]"
                            : "bg-white text-[#1A1A1A] border-gray-200 hover:border-[#2D5016]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 지원 동기 */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{texts.labelMotivation}</label>
                  <textarea
                    value={formData.motivation}
                    onChange={e => update("motivation", e.target.value)}
                    placeholder={texts.placeholderMotivation}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D5016] transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 border border-gray-200 text-[#6B7280] font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> {texts.prevBtn}
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canNext2}
                    className="flex-1 py-4 bg-[#2D5016] hover:bg-[#3a6b1e] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {texts.nextBtn} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: 서류 제출 및 약관 */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#2D5016]/10 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#2D5016]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A]">{texts.step3Title}</h3>
                    <p className="text-sm text-[#6B7280]">{texts.step3Subtitle}</p>
                  </div>
                </div>

                {/* VIP 가입비 안내 */}
                <div className="bg-[#2D5016]/5 border border-[#2D5016]/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-[#C9A961] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">{texts.vipFeeTitle}</p>
                      <p className="text-[#6B7280] text-xs mt-1">{texts.vipFeeDesc}</p>
                    </div>
                  </div>
                </div>

                {/* 신분증 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{texts.labelIdFile} <span className="text-red-500">*</span></label>
                  <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    formData.idFile ? "border-[#2D5016] bg-[#2D5016]/5" : "border-gray-300 hover:border-[#2D5016]"
                  }`}>
                    <Upload className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-sm text-[#6B7280]">
                      {formData.idFile ? formData.idFile.name : texts.uploadPlaceholder}
                    </span>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange("idFile")} className="hidden" />
                  </label>
                </div>

                {/* 통장 사본 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{texts.labelBankFile} <span className="text-red-500">*</span></label>
                  <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    formData.bankFile ? "border-[#2D5016] bg-[#2D5016]/5" : "border-gray-300 hover:border-[#2D5016]"
                  }`}>
                    <Upload className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-sm text-[#6B7280]">
                      {formData.bankFile ? formData.bankFile.name : texts.uploadPlaceholder}
                    </span>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange("bankFile")} className="hidden" />
                  </label>
                </div>

                {/* 추천인 코드 */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{texts.labelReferral}</label>
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={e => update("referralCode", e.target.value.toUpperCase())}
                    placeholder={texts.placeholderReferral}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D5016] transition-colors font-mono"
                  />
                </div>

                {/* 약관 동의 */}
                <div className="space-y-3 pt-2">
                  {[
                    { field: "agreeTerms", label: texts.agreeTerms, required: true },
                    { field: "agreePrivacy", label: texts.agreePrivacy, required: true },
                    { field: "agreeMarketing", label: texts.agreeMarketing, required: false },
                  ].map(item => (
                    <label key={item.field} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData as any)[item.field]}
                        onChange={e => update(item.field, e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#2D5016]"
                      />
                      <span className="text-sm text-[#1A1A1A]">
                        {item.label}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 border border-gray-200 text-[#6B7280] font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> {texts.prevBtn}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="flex-1 py-4 bg-[#2D5016] hover:bg-[#3a6b1e] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {texts.submitBtn}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── 다국어 텍스트 ───────────────────────────────────────────────
const seniorTexts: Record<string, any> = {
  ko: {
    heroBadge: "EverWill 시니어 파트너 프로그램 (만 65세 이상)",
    heroTitle1: "당신의 경험과 인맥이",
    heroTitle2: "소중한 수입이 됩니다",
    heroSubtitle: "자격증 없이 지인에게 직접 설명하고 도와주는 것만으로 수수료를 받으세요. 한국과 전 세계 시니어를 위한 새로운 일자리입니다.",
    badge1: "시작 수수료 20% 우대",
    badge2: "자격증 불필요",
    badge3: "직접 홍보 가능",
    commissionTitle: "시니어 그룹 수수료 구조 (누적 매출 기준 · 세전)",
    colCumulative: "누적 매출",
    colRate: "수수료율",
    colNote: "비고",
    tier1Range: "기본 (시작)",
    tier1Note: "시니어 우대 시작",
    tier2Range: "500만원 이상",
    tier3Range: "2,000만원 이상",
    tier4Range: "5,000만원 이상",
    tier5Range: "1억원 이상",
    tier5Note: "최고 등급",
    commissionNote: "※ 누적 매출 기준 · 세전 금액 · 판매 발생 시 수수료 지급 · 월 1회 정산",
    step1Title: "기본 정보 입력",
    step1Subtitle: "만 65세 이상만 가입 가능합니다",
    step2Title: "활동 정보 입력",
    step2Subtitle: "활동 지역과 유형을 알려주세요",
    step3Title: "서류 제출 및 약관 동의",
    step3Subtitle: "가입 완료 후 1-2일 내 승인됩니다",
    labelName: "성명",
    placeholderName: "홍길동",
    labelBirthYear: "출생연도 (만 65세 이상)",
    placeholderBirthYear: "예: 1955",
    ageError: "시니어 파트너는 만 65세 이상만 가입 가능합니다",
    ageOk: "만 {age}세 — 가입 가능합니다 ✓",
    labelCountry: "활동 국가",
    labelRegion: "활동 지역 (시/도)",
    placeholderRegion: "예: 서울시 강남구",
    labelSeniorType: "활동 유형 선택",
    labelNetworkSize: "예상 지인 네트워크 규모",
    networkOptions: ["10명 미만", "10~30명", "30~100명", "100명 이상"],
    labelMotivation: "지원 동기 (선택)",
    placeholderMotivation: "EverWill 파트너에 지원하신 이유를 간단히 적어주세요",
    vipFeeTitle: "VIP 가입비: ₩199,000 (1회, 연 등록비 없음)",
    vipFeeDesc: "승인 완료 후 VIP 가입 결제 링크를 이메일로 발송합니다. 결제 완료 즉시 추천 링크가 발급됩니다.",
    labelIdFile: "신분증 사본 (주민등록증 또는 여권)",
    labelBankFile: "통장 사본",
    uploadPlaceholder: "클릭하여 파일 선택 (JPG, PNG, PDF)",
    labelReferral: "추천인 코드 (선택)",
    placeholderReferral: "추천인 코드 입력",
    agreeTerms: "이용약관에 동의합니다",
    agreePrivacy: "개인정보 처리방침에 동의합니다",
    agreeMarketing: "마케팅 정보 수신에 동의합니다 (선택)",
    nextBtn: "다음",
    prevBtn: "이전",
    submitBtn: "가입 신청 완료",
    submitSuccess: "가입 신청이 완료되었습니다! 1-2일 내 이메일로 승인 결과를 안내해 드립니다.",
  },
  en: {
    heroBadge: "EverWill Senior Partner Program (Age 65+)",
    heroTitle1: "Your Experience & Network",
    heroTitle2: "Becomes Your Income",
    heroSubtitle: "No license required. Simply share EverWill with friends and family — and earn commission. A new opportunity for seniors worldwide.",
    badge1: "Start at 20% Commission",
    badge2: "No License Required",
    badge3: "Direct Referral Welcome",
    commissionTitle: "Senior Group Commission Structure (Cumulative Sales · Pre-tax)",
    colCumulative: "Cumulative Sales",
    colRate: "Commission",
    colNote: "Note",
    tier1Range: "Base (Start)",
    tier1Note: "Senior Preferred Rate",
    tier2Range: "$3,800+",
    tier3Range: "$15,000+",
    tier4Range: "$38,000+",
    tier5Range: "$77,000+",
    tier5Note: "Top Tier",
    commissionNote: "※ Based on cumulative sales · Pre-tax · Commission paid per sale · Monthly settlement",
    step1Title: "Basic Information",
    step1Subtitle: "Only available for age 65 and above",
    step2Title: "Activity Information",
    step2Subtitle: "Tell us about your region and activity type",
    step3Title: "Documents & Agreement",
    step3Subtitle: "Approval within 1-2 business days",
    labelName: "Full Name",
    placeholderName: "John Smith",
    labelBirthYear: "Birth Year (Age 65+)",
    placeholderBirthYear: "e.g. 1955",
    ageError: "Senior Partner program is only available for age 65 and above",
    ageOk: "Age {age} — Eligible ✓",
    labelCountry: "Country of Activity",
    labelRegion: "Region / City",
    placeholderRegion: "e.g. Los Angeles, CA",
    labelSeniorType: "Activity Type",
    labelNetworkSize: "Estimated Network Size",
    networkOptions: ["Under 10", "10–30", "30–100", "100+"],
    labelMotivation: "Motivation (Optional)",
    placeholderMotivation: "Briefly describe why you want to join EverWill as a partner",
    vipFeeTitle: "VIP Membership: $149 USD (one-time, no annual fee)",
    vipFeeDesc: "After approval, a payment link will be sent to your email. Your referral link will be issued immediately upon payment.",
    labelIdFile: "ID Copy (Passport or National ID)",
    labelBankFile: "Bank Account Copy",
    uploadPlaceholder: "Click to select file (JPG, PNG, PDF)",
    labelReferral: "Referral Code (Optional)",
    placeholderReferral: "Enter referral code",
    agreeTerms: "I agree to the Terms of Service",
    agreePrivacy: "I agree to the Privacy Policy",
    agreeMarketing: "I agree to receive marketing information (Optional)",
    nextBtn: "Next",
    prevBtn: "Back",
    submitBtn: "Submit Application",
    submitSuccess: "Application submitted! You will receive an approval email within 1-2 business days.",
  },
  ja: {
    heroBadge: "EverWill シニアパートナープログラム（65歳以上）",
    heroTitle1: "あなたの経験と人脈が",
    heroTitle2: "収入になります",
    heroSubtitle: "資格不要。知人に直接説明してご紹介するだけで手数料が得られます。世界中のシニアのための新しい仕事です。",
    badge1: "開始手数料20%優遇",
    badge2: "資格不要",
    badge3: "直接紹介歓迎",
    commissionTitle: "シニアグループ手数料構造（累計売上基準・税引前）",
    colCumulative: "累計売上",
    colRate: "手数料率",
    colNote: "備考",
    tier1Range: "基本（開始）",
    tier1Note: "シニア優遇スタート",
    tier2Range: "50万円以上",
    tier3Range: "200万円以上",
    tier4Range: "500万円以上",
    tier5Range: "1,000万円以上",
    tier5Note: "最高等級",
    commissionNote: "※ 累計売上基準・税引前・販売発生時に手数料支払・月1回精算",
    step1Title: "基本情報入力",
    step1Subtitle: "65歳以上の方のみご参加いただけます",
    step2Title: "活動情報入力",
    step2Subtitle: "活動地域と種類をお知らせください",
    step3Title: "書類提出・規約同意",
    step3Subtitle: "申請後1〜2営業日以内に承認されます",
    labelName: "氏名",
    placeholderName: "山田太郎",
    labelBirthYear: "生年（65歳以上）",
    placeholderBirthYear: "例：1955",
    ageError: "シニアパートナーは65歳以上の方のみご参加いただけます",
    ageOk: "{age}歳 — ご参加いただけます ✓",
    labelCountry: "活動国",
    labelRegion: "活動地域（都道府県・市区町村）",
    placeholderRegion: "例：東京都渋谷区",
    labelSeniorType: "活動タイプを選択",
    labelNetworkSize: "予想知人ネットワーク規模",
    networkOptions: ["10名未満", "10〜30名", "30〜100名", "100名以上"],
    labelMotivation: "志望動機（任意）",
    placeholderMotivation: "EverWillパートナーに応募した理由を簡単にご記入ください",
    vipFeeTitle: "VIP入会費：¥22,000（1回のみ、年会費なし）",
    vipFeeDesc: "承認後、メールで決済リンクをお送りします。決済完了後すぐに紹介リンクが発行されます。",
    labelIdFile: "身分証明書コピー（パスポートまたはマイナンバーカード）",
    labelBankFile: "通帳コピー",
    uploadPlaceholder: "クリックしてファイルを選択（JPG、PNG、PDF）",
    labelReferral: "紹介コード（任意）",
    placeholderReferral: "紹介コードを入力",
    agreeTerms: "利用規約に同意します",
    agreePrivacy: "プライバシーポリシーに同意します",
    agreeMarketing: "マーケティング情報の受信に同意します（任意）",
    nextBtn: "次へ",
    prevBtn: "戻る",
    submitBtn: "申請を完了する",
    submitSuccess: "申請が完了しました！1〜2営業日以内にメールで承認結果をお知らせします。",
  },
  zh: {
    heroBadge: "EverWill 老年合作伙伴计划（65岁以上）",
    heroTitle1: "您的经验与人脉",
    heroTitle2: "将成为您的收入",
    heroSubtitle: "无需资质。只需向亲友直接介绍即可获得佣金。这是为全球老年人创造的新就业机会。",
    badge1: "起始佣金20%优待",
    badge2: "无需资质",
    badge3: "欢迎直接推荐",
    commissionTitle: "老年组佣金结构（累计销售额基准·税前）",
    colCumulative: "累计销售额",
    colRate: "佣金率",
    colNote: "备注",
    tier1Range: "基础（起始）",
    tier1Note: "老年优待起始",
    tier2Range: "5,000元以上",
    tier3Range: "20,000元以上",
    tier4Range: "50,000元以上",
    tier5Range: "100,000元以上",
    tier5Note: "最高等级",
    commissionNote: "※ 累计销售额基准·税前金额·销售发生时支付佣金·每月结算一次",
    step1Title: "填写基本信息",
    step1Subtitle: "仅限65岁及以上人士参与",
    step2Title: "填写活动信息",
    step2Subtitle: "请告知您的活动地区和类型",
    step3Title: "提交文件及同意条款",
    step3Subtitle: "申请后1-2个工作日内完成审批",
    labelName: "姓名",
    placeholderName: "张三",
    labelBirthYear: "出生年份（65岁以上）",
    placeholderBirthYear: "例：1955",
    ageError: "老年合作伙伴计划仅限65岁及以上人士参与",
    ageOk: "{age}岁 — 符合资格 ✓",
    labelCountry: "活动国家",
    labelRegion: "活动地区（省/市）",
    placeholderRegion: "例：北京市朝阳区",
    labelSeniorType: "选择活动类型",
    labelNetworkSize: "预计人脉网络规模",
    networkOptions: ["10人以下", "10~30人", "30~100人", "100人以上"],
    labelMotivation: "申请动机（选填）",
    placeholderMotivation: "请简述您申请加入EverWill合作伙伴的原因",
    vipFeeTitle: "VIP会员费：¥1,050（一次性，无年费）",
    vipFeeDesc: "审批通过后，将通过邮件发送付款链接。付款完成后立即发放推荐链接。",
    labelIdFile: "身份证复印件（护照或身份证）",
    labelBankFile: "银行账户复印件",
    uploadPlaceholder: "点击选择文件（JPG、PNG、PDF）",
    labelReferral: "推荐码（选填）",
    placeholderReferral: "输入推荐码",
    agreeTerms: "我同意服务条款",
    agreePrivacy: "我同意隐私政策",
    agreeMarketing: "我同意接收营销信息（选填）",
    nextBtn: "下一步",
    prevBtn: "上一步",
    submitBtn: "提交申请",
    submitSuccess: "申请已提交！将在1-2个工作日内通过邮件通知审批结果。",
  },
};
