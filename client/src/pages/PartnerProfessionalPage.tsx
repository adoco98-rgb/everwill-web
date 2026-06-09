/**
 * 전문가 그룹 가입 페이지
 * 변호사, 세무사, 법무사 등 법률·세무 전문가 가입 폼
 * 자격 검증 정보 수집 + 가입비 $99 결제 연동
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, ArrowLeft, ArrowRight, CheckCircle, Upload, Globe, User, MapPin, Briefcase, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PhoneVerifyField, EmailVerifyField } from "@/components/PartnerVerifyFields";

// 전문 분야 목록
const SPECIALTIES = {
  ko: ["상속법", "부동산법", "세무", "가족법", "기업법", "이민법", "형사법", "국제법", "지적재산권", "기타"],
  en: ["Estate Planning", "Real Estate", "Tax Law", "Family Law", "Corporate Law", "Immigration", "Criminal Law", "International Law", "IP Law", "Other"],
  ja: ["相続法", "不動産法", "税務", "家族法", "企業法", "入管法", "刑事法", "国際法", "知的財産権", "その他"],
  zh: ["继承法", "房地产法", "税法", "家庭法", "公司法", "移民法", "刑法", "国际法", "知识产权", "其他"],
};

// 국가 목록
const COUNTRIES = [
  { code: "KR", name: { ko: "한국", en: "South Korea", ja: "韓国", zh: "韩国" } },
  { code: "US", name: { ko: "미국", en: "United States", ja: "アメリカ", zh: "美国" } },
  { code: "JP", name: { ko: "일본", en: "Japan", ja: "日本", zh: "日本" } },
  { code: "CN", name: { ko: "중국", en: "China", ja: "中国", zh: "中国" } },
  { code: "DE", name: { ko: "독일", en: "Germany", ja: "ドイツ", zh: "德国" } },
  { code: "ES", name: { ko: "스페인", en: "Spain", ja: "スペイン", zh: "西班牙" } },
  { code: "FR", name: { ko: "프랑스", en: "France", ja: "フランス", zh: "法国" } },
  { code: "GB", name: { ko: "영국", en: "United Kingdom", ja: "イギリス", zh: "英国" } },
  { code: "IN", name: { ko: "인도", en: "India", ja: "インド", zh: "印度" } },
  { code: "BR", name: { ko: "브라질", en: "Brazil", ja: "ブラジル", zh: "巴西" } },
  { code: "SA", name: { ko: "사우디아라비아", en: "Saudi Arabia", ja: "サウジアラビア", zh: "沙特阿拉伯" } },
  { code: "RU", name: { ko: "러시아", en: "Russia", ja: "ロシア", zh: "俄罗斯" } },
  { code: "AU", name: { ko: "호주", en: "Australia", ja: "オーストラリア", zh: "澳大利亚" } },
  { code: "CA", name: { ko: "캐나다", en: "Canada", ja: "カナダ", zh: "加拿大" } },
];

// 전문가 유형
const PRO_TYPES = {
  ko: ["변호사", "세무사", "법무사", "공인회계사", "공증인", "기타"],
  en: ["Attorney", "CPA/Tax Advisor", "Legal Scrivener", "Certified Accountant", "Notary", "Other"],
  ja: ["弁護士", "税理士", "司法書士", "公認会計士", "公証人", "その他"],
  zh: ["律师", "税务师", "法务师", "注册会计师", "公证人", "其他"],
};

export default function PartnerProfessionalPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const lang = (["ko", "en", "ja", "zh"].includes(language) ? language : "en") as "ko" | "en" | "ja" | "zh";
  const texts = proTexts[lang] || proTexts.en;

  const [step, setStep] = useState(1);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: 기본 정보
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    // Step 2: 전문가 정보
    proType: "",
    licenseNumber: "",
    specialties: [] as string[],
    yearsOfExperience: "",
    firmName: "",
    // Step 3: 활동 지역
    country: "",
    region: "",
    city: "",
    address: "",
    // Step 4: 프로필
    bio: "",
    profilePhoto: null as File | null,
    licenseDoc: null as File | null,
    // 약관 동의
    agreeTerms: false,
    agreePrivacy: false,
    agreePartner: false,
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSpecialty = (s: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s],
    }));
  };

  const handleSubmit = () => {
    // TODO: API 호출 + Stripe 결제 연동
    alert(texts.submitAlert);
    navigate("/partner");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12 pt-28">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate("/partner")}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F3864] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {texts.backToPartner}
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-[#1F3864]/10 rounded-xl flex items-center justify-center">
              <Scale className="w-7 h-7 text-[#1F3864]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{texts.title}</h1>
              <p className="text-[#6B7280]">{texts.subtitle}</p>
            </div>
          </div>
        </motion.div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-between mb-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= s ? 'bg-[#1F3864] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && <div className={`w-12 md:w-20 h-1 mx-1 ${step > s ? 'bg-[#1F3864]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: 기본 정보 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#C9A961]" />
              {texts.step1Title}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.nameLabel} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => updateField("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                  placeholder={texts.namePlaceholder}
                />
              </div>
              <EmailVerifyField
                email={formData.email}
                onEmailChange={v => updateField("email", v)}
                verified={emailVerified}
                onVerified={() => setEmailVerified(true)}
                label={texts.emailLabel}
                placeholder={texts.emailPlaceholder}
              />
              <PhoneVerifyField
                phone={formData.phone}
                onPhoneChange={v => updateField("phone", v)}
                verified={phoneVerified}
                onVerified={() => setPhoneVerified(true)}
                label={texts.phoneLabel}
                placeholder={texts.phonePlaceholder}
              />
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.passwordLabel} *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => updateField("password", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                  placeholder={texts.passwordPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.passwordConfirmLabel} *</label>
                <input
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={e => updateField("passwordConfirm", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                  placeholder={texts.passwordConfirmPlaceholder}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: 전문가 정보 */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#C9A961]" />
              {texts.step2Title}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.proTypeLabel} *</label>
                <select
                  value={formData.proType}
                  onChange={e => updateField("proType", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                >
                  <option value="">{texts.proTypeSelect}</option>
                  {(PRO_TYPES[lang] || PRO_TYPES.en).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.licenseLabel} *</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={e => updateField("licenseNumber", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                  placeholder={texts.licensePlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.specialtyLabel} *</label>
                <div className="flex flex-wrap gap-2">
                  {(SPECIALTIES[lang] || SPECIALTIES.en).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.specialties.includes(s)
                          ? 'bg-[#1F3864] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.experienceLabel}</label>
                <input
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={e => updateField("yearsOfExperience", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                  placeholder={texts.experiencePlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.firmLabel}</label>
                <input
                  type="text"
                  value={formData.firmName}
                  onChange={e => updateField("firmName", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                  placeholder={texts.firmPlaceholder}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: 활동 지역 */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C9A961]" />
              {texts.step3Title}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.countryLabel} *</label>
                <select
                  value={formData.country}
                  onChange={e => updateField("country", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                >
                  <option value="">{texts.countrySelect}</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name[lang] || c.name.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.regionLabel} *</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={e => updateField("region", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                  placeholder={texts.regionPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.cityLabel}</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => updateField("city", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                  placeholder={texts.cityPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.addressLabel}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => updateField("address", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none"
                  placeholder={texts.addressPlaceholder}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: 프로필 + 약관 동의 */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C9A961]" />
              {texts.step4Title}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.bioLabel}</label>
                <textarea
                  value={formData.bio}
                  onChange={e => updateField("bio", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none resize-none"
                  placeholder={texts.bioPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.photoLabel}</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#1F3864] transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{texts.photoUpload}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{texts.licenseDocLabel}</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#1F3864] transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{texts.licenseDocUpload}</p>
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="border-t pt-6 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={e => updateField("agreeTerms", e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1F3864] focus:ring-[#1F3864]"
                  />
                  <span className="text-sm text-[#1A1A1A]">{texts.agreeTerms} *</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreePrivacy}
                    onChange={e => updateField("agreePrivacy", e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1F3864] focus:ring-[#1F3864]"
                  />
                  <span className="text-sm text-[#1A1A1A]">{texts.agreePrivacy} *</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreePartner}
                    onChange={e => updateField("agreePartner", e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1F3864] focus:ring-[#1F3864]"
                  />
                  <span className="text-sm text-[#1A1A1A]">{texts.agreePartner} *</span>
                </label>
              </div>

              {/* 가입비 안내 */}
              <div className="bg-[#1F3864]/5 rounded-xl p-6 border border-[#1F3864]/10">
                <p className="text-sm text-[#6B7280] mb-2">{texts.feeNotice}</p>
                <p className="text-2xl font-bold text-green-600">{texts.freeTrialBadge}</p>
                <p className="text-sm text-[#6B7280] mt-2">{texts.freeTrialDesc}</p>
                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-700">{texts.commissionNotice}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/partner")}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {texts.prevBtn}
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!emailVerified || !phoneVerified)}
              title={step === 1 && (!emailVerified || !phoneVerified) ? "이메일과 전화번호 인증을 완료해주세요" : undefined}
              className="px-6 py-3 bg-[#1F3864] hover:bg-[#162b50] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center gap-2"
            >
              {texts.nextBtn}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!formData.agreeTerms || !formData.agreePrivacy || !formData.agreePartner}
              className="px-8 py-3 bg-[#C9A961] hover:bg-[#b8953a] disabled:bg-gray-300 disabled:cursor-not-allowed text-[#1F3864] font-bold rounded-xl transition-all flex items-center gap-2"
            >
              {texts.submitBtn}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ─── 다국어 텍스트 ───────────────────────────────────────────────
const proTexts: Record<string, any> = {
  ko: {
    backToPartner: "파트너센터로 돌아가기",
    title: "전문가 그룹 가입",
    subtitle: "변호사 · 세무사 · 법무사",
    step1Title: "기본 정보",
    step2Title: "전문가 정보",
    step3Title: "활동 지역",
    step4Title: "프로필 및 약관 동의",
    nameLabel: "이름 (실명)",
    namePlaceholder: "홍길동",
    emailLabel: "이메일",
    emailPlaceholder: "attorney@example.com",
    phoneLabel: "휴대폰 번호",
    phonePlaceholder: "+82 10-1234-5678",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "8자 이상 영문+숫자+특수문자",
    passwordConfirmLabel: "비밀번호 확인",
    passwordConfirmPlaceholder: "비밀번호를 다시 입력하세요",
    proTypeLabel: "전문가 유형",
    proTypeSelect: "유형을 선택하세요",
    licenseLabel: "자격증 번호",
    licensePlaceholder: "예: 대한변호사협회 제12345호",
    specialtyLabel: "전문 분야 (복수 선택 가능)",
    experienceLabel: "경력 (년)",
    experiencePlaceholder: "예: 15",
    firmLabel: "소속 사무소/법인",
    firmPlaceholder: "예: 김앤장 법률사무소",
    countryLabel: "활동 국가",
    countrySelect: "국가를 선택하세요",
    regionLabel: "지역 (주/도)",
    regionPlaceholder: "예: 서울특별시 / California",
    cityLabel: "도시",
    cityPlaceholder: "예: 강남구 / Los Angeles",
    addressLabel: "사무소 주소",
    addressPlaceholder: "상세 주소를 입력하세요",
    bioLabel: "자기소개 (고객에게 노출됩니다)",
    bioPlaceholder: "전문 분야, 경력, 강점 등을 자유롭게 작성하세요 (최대 500자)",
    photoLabel: "프로필 사진",
    photoUpload: "클릭하여 사진을 업로드하세요 (JPG, PNG, 최대 5MB)",
    licenseDocLabel: "자격증 사본 (심사용)",
    licenseDocUpload: "클릭하여 자격증 사본을 업로드하세요 (PDF, JPG)",
    agreeTerms: "EverWill 이용약관에 동의합니다",
    agreePrivacy: "개인정보 수집 및 이용에 동의합니다",
    agreePartner: "파트너 프로그램 약관에 동의합니다",
    feeNotice: "전문가 그룹 가입비",
    freeTrialBadge: "3개월 무료 체험",
    freeTrialDesc: "3개월간 무료로 활동 가능합니다. 이후 $99 결제 시 정식 파트너로 전환됩니다.",
    commissionNotice: "※ 수수료는 무료 기간에도 적립되지만, 가입비 결제 후에만 출금 가능합니다.",
    oneTime: "1회 결제",
    prevBtn: "이전",
    nextBtn: "다음",
    submitBtn: "무료 체험 시작하기",
    submitAlert: "가입 신청이 완료되었습니다. 자격 심사 후 승인 안내 이메일을 보내드립니다.",
  },
  en: {
    backToPartner: "Back to Partner Center",
    title: "Professional Group Registration",
    subtitle: "Attorney · CPA · Legal Professional",
    step1Title: "Basic Information",
    step2Title: "Professional Details",
    step3Title: "Practice Area",
    step4Title: "Profile & Agreements",
    nameLabel: "Full Name",
    namePlaceholder: "John Smith",
    emailLabel: "Email",
    emailPlaceholder: "attorney@example.com",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+1 (555) 123-4567",
    passwordLabel: "Password",
    passwordPlaceholder: "8+ characters with letters, numbers, symbols",
    passwordConfirmLabel: "Confirm Password",
    passwordConfirmPlaceholder: "Re-enter your password",
    proTypeLabel: "Professional Type",
    proTypeSelect: "Select your type",
    licenseLabel: "License/Bar Number",
    licensePlaceholder: "e.g., CA Bar #123456",
    specialtyLabel: "Specialties (select multiple)",
    experienceLabel: "Years of Experience",
    experiencePlaceholder: "e.g., 15",
    firmLabel: "Firm/Organization",
    firmPlaceholder: "e.g., Smith & Associates",
    countryLabel: "Country of Practice",
    countrySelect: "Select country",
    regionLabel: "State/Province",
    regionPlaceholder: "e.g., California",
    cityLabel: "City",
    cityPlaceholder: "e.g., Los Angeles",
    addressLabel: "Office Address",
    addressPlaceholder: "Enter your office address",
    bioLabel: "Professional Bio (visible to clients)",
    bioPlaceholder: "Describe your expertise, experience, and strengths (max 500 chars)",
    photoLabel: "Profile Photo",
    photoUpload: "Click to upload photo (JPG, PNG, max 5MB)",
    licenseDocLabel: "License Document (for verification)",
    licenseDocUpload: "Click to upload license copy (PDF, JPG)",
    agreeTerms: "I agree to EverWill Terms of Service",
    agreePrivacy: "I agree to Privacy Policy",
    agreePartner: "I agree to Partner Program Terms",
    feeNotice: "Professional Group Registration Fee",
    freeTrialBadge: "3 Months Free Trial",
    freeTrialDesc: "Start free for 3 months. Pay $99 to become an official partner afterward.",
    commissionNotice: "* Commissions are accrued during the free period, but can only be withdrawn after paying the registration fee.",
    oneTime: "one-time payment",
    prevBtn: "Previous",
    nextBtn: "Next",
    submitBtn: "Start Free Trial",
    submitAlert: "Registration submitted. You will receive an approval email after credential verification.",
  },
  ja: {
    backToPartner: "パートナーセンターに戻る",
    title: "専門家グループ登録",
    subtitle: "弁護士 · 税理士 · 司法書士",
    step1Title: "基本情報",
    step2Title: "専門家情報",
    step3Title: "活動地域",
    step4Title: "プロフィール・規約同意",
    nameLabel: "氏名（実名）",
    namePlaceholder: "山田太郎",
    emailLabel: "メールアドレス",
    emailPlaceholder: "attorney@example.com",
    phoneLabel: "電話番号",
    phonePlaceholder: "+81 90-1234-5678",
    passwordLabel: "パスワード",
    passwordPlaceholder: "8文字以上（英数字+記号）",
    passwordConfirmLabel: "パスワード確認",
    passwordConfirmPlaceholder: "パスワードを再入力",
    proTypeLabel: "専門家タイプ",
    proTypeSelect: "タイプを選択",
    licenseLabel: "資格番号",
    licensePlaceholder: "例：弁護士登録番号12345",
    specialtyLabel: "専門分野（複数選択可）",
    experienceLabel: "経験年数",
    experiencePlaceholder: "例：15",
    firmLabel: "所属事務所",
    firmPlaceholder: "例：山田法律事務所",
    countryLabel: "活動国",
    countrySelect: "国を選択",
    regionLabel: "地域（都道府県）",
    regionPlaceholder: "例：東京都",
    cityLabel: "市区町村",
    cityPlaceholder: "例：港区",
    addressLabel: "事務所住所",
    addressPlaceholder: "詳細住所を入力",
    bioLabel: "自己紹介（顧客に表示されます）",
    bioPlaceholder: "専門分野、経歴、強みなどを自由に記述（最大500文字）",
    photoLabel: "プロフィール写真",
    photoUpload: "クリックして写真をアップロード（JPG、PNG、最大5MB）",
    licenseDocLabel: "資格証コピー（審査用）",
    licenseDocUpload: "クリックして資格証をアップロード（PDF、JPG）",
    agreeTerms: "EverWill利用規約に同意します",
    agreePrivacy: "個人情報の収集・利用に同意します",
    agreePartner: "パートナープログラム規約に同意します",
    feeNotice: "専門家グループ入会費",
    freeTrialBadge: "3ヶ月無料体験",
    freeTrialDesc: "3ヶ月間無料で活動できます。その後$99のお支払いで正式パートナーになります。",
    commissionNotice: "※ 手数料は無料期間中も蓄積されますが、入会費お支払い後にのみ出金可能です。",
    oneTime: "1回払い",
    prevBtn: "戻る",
    nextBtn: "次へ",
    submitBtn: "無料体験を始める",
    submitAlert: "登録申請が完了しました。資格審査後、承認メールをお送りします。",
  },
  zh: {
    backToPartner: "返回合作伙伴中心",
    title: "专家组注册",
    subtitle: "律师 · 税务师 · 法务师",
    step1Title: "基本信息",
    step2Title: "专业信息",
    step3Title: "执业地区",
    step4Title: "个人简介与协议",
    nameLabel: "姓名（实名）",
    namePlaceholder: "张三",
    emailLabel: "邮箱",
    emailPlaceholder: "attorney@example.com",
    phoneLabel: "手机号码",
    phonePlaceholder: "+86 138-1234-5678",
    passwordLabel: "密码",
    passwordPlaceholder: "8位以上字母+数字+特殊字符",
    passwordConfirmLabel: "确认密码",
    passwordConfirmPlaceholder: "请重新输入密码",
    proTypeLabel: "专家类型",
    proTypeSelect: "请选择类型",
    licenseLabel: "执照编号",
    licensePlaceholder: "例：律师执业证号12345",
    specialtyLabel: "专业领域（可多选）",
    experienceLabel: "从业年限",
    experiencePlaceholder: "例：15",
    firmLabel: "所属事务所",
    firmPlaceholder: "例：金杜律师事务所",
    countryLabel: "执业国家",
    countrySelect: "请选择国家",
    regionLabel: "地区（省/州）",
    regionPlaceholder: "例：北京市 / California",
    cityLabel: "城市",
    cityPlaceholder: "例：朝阳区",
    addressLabel: "办公地址",
    addressPlaceholder: "请输入详细地址",
    bioLabel: "个人简介（将展示给客户）",
    bioPlaceholder: "描述您的专业领域、经历和优势（最多500字）",
    photoLabel: "头像照片",
    photoUpload: "点击上传照片（JPG、PNG，最大5MB）",
    licenseDocLabel: "执照副本（审核用）",
    licenseDocUpload: "点击上传执照副本（PDF、JPG）",
    agreeTerms: "同意EverWill服务条款",
    agreePrivacy: "同意隐私政策",
    agreePartner: "同意合作伙伴计划条款",
    feeNotice: "专家组注册费",
    freeTrialBadge: "3个月免费体验",
    freeTrialDesc: "3个月内免费活动。之后支付$99即可成为正式合作伙伴。",
    commissionNotice: "※ 佣金在免费期间也会累积，但仅在支付注册费后才可提现。",
    oneTime: "一次性支付",
    prevBtn: "上一步",
    nextBtn: "下一步",
    submitBtn: "开始免费体验",
    submitAlert: "注册申请已提交。资质审核后将发送审批邮件。",
  },
};
