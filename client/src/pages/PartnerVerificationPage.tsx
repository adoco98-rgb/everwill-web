/**
 * 파트너 본인 인증 페이지
 * 통장 사본, 사업자등록증/개인 신분증 업로드 및 정보 입력
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Upload, CheckCircle, CreditCard, Building2, User, FileText, Camera, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TEXTS: Record<string, any> = {
  ko: {
    title: "본인 인증 및 서류 제출",
    subtitle: "수수료 정산 및 자격 확인을 위해 아래 서류를 제출해주세요.",
    back: "파트너센터로 돌아가기",
    step1: "신분증 정보",
    step1Desc: "본인 확인을 위한 신분증 정보를 입력하고 사본을 업로드해주세요.",
    step2: "사업자 정보 (선택)",
    step2Desc: "사업자인 경우 사업자등록증을 업로드해주세요. 개인은 건너뛰기 가능합니다.",
    step3: "통장 사본",
    step3Desc: "수수료 정산을 위한 통장 사본을 업로드해주세요.",
    idType: "신분증 유형",
    idTypes: ["여권", "운전면허증", "주민등록증", "외국인등록증", "기타 정부 발급 ID"],
    idNumber: "신분증 번호",
    idName: "신분증 상의 이름",
    idBirth: "생년월일",
    idCountry: "발급 국가",
    idUpload: "신분증 사본 업로드",
    idUploadDesc: "앞면 사진을 선명하게 촬영하여 업로드해주세요. (JPG, PNG, PDF)",
    bizName: "사업자명 (상호)",
    bizNumber: "사업자등록번호",
    bizType: "업종/업태",
    bizUpload: "사업자등록증 업로드",
    bizUploadDesc: "사업자등록증 사본을 업로드해주세요. (JPG, PNG, PDF)",
    bankName: "은행명",
    bankAccount: "계좌번호",
    bankHolder: "예금주",
    bankUpload: "통장 사본 업로드",
    bankUploadDesc: "계좌번호와 예금주가 보이는 통장 사본을 업로드해주세요. (JPG, PNG, PDF)",
    banks: ["국민은행", "신한은행", "우리은행", "하나은행", "농협", "기업은행", "카카오뱅크", "토스뱅크", "SC제일은행", "씨티은행", "Bank of America", "Chase", "Wells Fargo", "Citibank", "HSBC", "기타"],
    submit: "인증 서류 제출",
    submitting: "제출 중...",
    success: "서류가 성공적으로 제출되었습니다. 검토 후 승인 알림을 보내드립니다.",
    skipBiz: "사업자 아님 (건너뛰기)",
    dragDrop: "파일을 드래그하거나 클릭하여 업로드",
    fileLimit: "최대 10MB, JPG/PNG/PDF",
    uploaded: "업로드 완료",
    required: "필수",
    optional: "선택",
    notice: "제출된 서류는 인증 목적으로만 사용되며, 암호화하여 안전하게 보관됩니다.",
  },
  en: {
    title: "Identity Verification & Document Submission",
    subtitle: "Please submit the following documents for commission settlement and qualification verification.",
    back: "Back to Partner Center",
    step1: "ID Information",
    step1Desc: "Enter your ID information and upload a copy for identity verification.",
    step2: "Business Information (Optional)",
    step2Desc: "If you are a business owner, please upload your business registration. Individuals may skip.",
    step3: "Bank Account Copy",
    step3Desc: "Upload a bank statement or passbook copy for commission settlement.",
    idType: "ID Type",
    idTypes: ["Passport", "Driver's License", "National ID", "Residence Card", "Other Government ID"],
    idNumber: "ID Number",
    idName: "Name on ID",
    idBirth: "Date of Birth",
    idCountry: "Issuing Country",
    idUpload: "Upload ID Copy",
    idUploadDesc: "Upload a clear photo of the front side. (JPG, PNG, PDF)",
    bizName: "Business Name",
    bizNumber: "Business Registration Number",
    bizType: "Business Type/Category",
    bizUpload: "Upload Business Registration",
    bizUploadDesc: "Upload a copy of your business registration certificate. (JPG, PNG, PDF)",
    bankName: "Bank Name",
    bankAccount: "Account Number",
    bankHolder: "Account Holder Name",
    bankUpload: "Upload Bank Statement",
    bankUploadDesc: "Upload a bank statement showing account number and holder name. (JPG, PNG, PDF)",
    banks: ["Bank of America", "Chase", "Wells Fargo", "Citibank", "HSBC", "TD Bank", "US Bank", "PNC", "Capital One", "Goldman Sachs", "Other"],
    submit: "Submit Verification Documents",
    submitting: "Submitting...",
    success: "Documents submitted successfully. You will be notified once the review is complete.",
    skipBiz: "Not a business (Skip)",
    dragDrop: "Drag & drop or click to upload",
    fileLimit: "Max 10MB, JPG/PNG/PDF",
    uploaded: "Uploaded",
    required: "Required",
    optional: "Optional",
    notice: "Submitted documents are used solely for verification purposes and are stored securely with encryption.",
  },
  ja: {
    title: "本人確認・書類提出",
    subtitle: "手数料精算および資格確認のため、以下の書類をご提出ください。",
    back: "パートナーセンターに戻る",
    step1: "身分証明書情報",
    step1Desc: "本人確認のため、身分証明書情報を入力し、コピーをアップロードしてください。",
    step2: "事業者情報（任意）",
    step2Desc: "事業者の場合は事業者登録証をアップロードしてください。個人はスキップ可能です。",
    step3: "通帳コピー",
    step3Desc: "手数料精算のための通帳コピーをアップロードしてください。",
    idType: "身分証明書の種類",
    idTypes: ["パスポート", "運転免許証", "マイナンバーカード", "在留カード", "その他政府発行ID"],
    idNumber: "身分証番号",
    idName: "身分証記載の氏名",
    idBirth: "生年月日",
    idCountry: "発行国",
    idUpload: "身分証コピーのアップロード",
    idUploadDesc: "表面の鮮明な写真をアップロードしてください。（JPG, PNG, PDF）",
    bizName: "事業者名（屋号）",
    bizNumber: "事業者登録番号",
    bizType: "業種/業態",
    bizUpload: "事業者登録証のアップロード",
    bizUploadDesc: "事業者登録証のコピーをアップロードしてください。（JPG, PNG, PDF）",
    bankName: "銀行名",
    bankAccount: "口座番号",
    bankHolder: "口座名義人",
    bankUpload: "通帳コピーのアップロード",
    bankUploadDesc: "口座番号と名義人が見える通帳コピーをアップロードしてください。（JPG, PNG, PDF）",
    banks: ["三菱UFJ銀行", "三井住友銀行", "みずほ銀行", "りそな銀行", "ゆうちょ銀行", "楽天銀行", "PayPay銀行", "SBI新生銀行", "その他"],
    submit: "認証書類を提出",
    submitting: "提出中...",
    success: "書類が正常に提出されました。審査完了後に通知いたします。",
    skipBiz: "事業者ではない（スキップ）",
    dragDrop: "ドラッグ＆ドロップまたはクリックしてアップロード",
    fileLimit: "最大10MB、JPG/PNG/PDF",
    uploaded: "アップロード完了",
    required: "必須",
    optional: "任意",
    notice: "提出された書類は認証目的のみに使用され、暗号化して安全に保管されます。",
  },
  zh: {
    title: "身份验证与文件提交",
    subtitle: "请提交以下文件以进行佣金结算和资格验证。",
    back: "返回合作伙伴中心",
    step1: "身份证信息",
    step1Desc: "输入您的身份证信息并上传副本以进行身份验证。",
    step2: "企业信息（可选）",
    step2Desc: "如果您是企业主，请上传营业执照。个人可跳过。",
    step3: "银行账户副本",
    step3Desc: "上传银行对账单或存折副本以进行佣金结算。",
    idType: "证件类型",
    idTypes: ["护照", "驾驶证", "身份证", "居留证", "其他政府颁发证件"],
    idNumber: "证件号码",
    idName: "证件上的姓名",
    idBirth: "出生日期",
    idCountry: "签发国家",
    idUpload: "上传证件副本",
    idUploadDesc: "上传正面清晰照片。（JPG, PNG, PDF）",
    bizName: "企业名称",
    bizNumber: "营业执照号码",
    bizType: "行业/类别",
    bizUpload: "上传营业执照",
    bizUploadDesc: "上传营业执照副本。（JPG, PNG, PDF）",
    bankName: "银行名称",
    bankAccount: "账号",
    bankHolder: "户名",
    bankUpload: "上传银行对账单",
    bankUploadDesc: "上传显示账号和户名的银行对账单。（JPG, PNG, PDF）",
    banks: ["中国工商银行", "中国建设银行", "中国农业银行", "中国银行", "招商银行", "交通银行", "支付宝", "微信支付", "其他"],
    submit: "提交验证文件",
    submitting: "提交中...",
    success: "文件提交成功。审核完成后将通知您。",
    skipBiz: "非企业（跳过）",
    dragDrop: "拖放或点击上传",
    fileLimit: "最大10MB，JPG/PNG/PDF",
    uploaded: "已上传",
    required: "必填",
    optional: "可选",
    notice: "提交的文件仅用于验证目的，并以加密方式安全存储。",
  }
};

// 파일 업로드 컴포넌트
function FileUploadBox({ label, desc, uploaded, onUpload, texts }: any) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}</label>
      <p className="text-xs text-[#6B7280] mb-3">{desc}</p>
      <div
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".jpg,.jpeg,.png,.pdf";
          input.onchange = (e: any) => {
            if (e.target.files[0]) onUpload(e.target.files[0].name);
          };
          input.click();
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          uploaded ? "border-green-400 bg-green-50" : "border-[#C9A961]/40 hover:border-[#C9A961] hover:bg-[#C9A961]/5"
        }`}
      >
        {uploaded ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{texts.uploaded}: {uploaded}</span>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-[#C9A961] mx-auto mb-2" />
            <p className="text-sm text-[#6B7280]">{texts.dragDrop}</p>
            <p className="text-xs text-[#6B7280] mt-1">{texts.fileLimit}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PartnerVerificationPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const texts = TEXTS[language] || TEXTS.ko;

  const [formData, setFormData] = useState({
    idType: "",
    idNumber: "",
    idName: "",
    idBirth: "",
    idCountry: "",
    bizName: "",
    bizNumber: "",
    bizType: "",
    bankName: "",
    bankAccount: "",
    bankHolder: "",
  });
  const [idFile, setIdFile] = useState<string | null>(null);
  const [bizFile, setBizFile] = useState<string | null>(null);
  const [bankFile, setBankFile] = useState<string | null>(null);
  const [skipBiz, setSkipBiz] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">{texts.success}</h2>
          <button
            onClick={() => navigate("/partner")}
            className="mt-6 px-6 py-3 bg-[#1F3864] text-white rounded-xl hover:bg-[#162b50] transition-all"
          >
            {texts.back}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate("/partner")}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F3864] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {texts.back}
        </button>

        {/* 타이틀 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold text-[#1F3864] mb-3">{texts.title}</h1>
          <p className="text-[#6B7280]">{texts.subtitle}</p>
        </motion.div>

        {/* Step 1: 신분증 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-sm border mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#1F3864] rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{texts.step1}</h2>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{texts.required}</span>
          </div>
          <p className="text-[#6B7280] text-sm mb-6 ml-11">{texts.step1Desc}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.idType}</label>
              <select
                value={formData.idType}
                onChange={(e) => handleChange("idType", e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
              >
                <option value="">--</option>
                {texts.idTypes.map((t: string) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.idNumber}</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleChange("idNumber", e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.idName}</label>
              <input
                type="text"
                value={formData.idName}
                onChange={(e) => handleChange("idName", e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.idBirth}</label>
              <input
                type="date"
                value={formData.idBirth}
                onChange={(e) => handleChange("idBirth", e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.idCountry}</label>
              <input
                type="text"
                value={formData.idCountry}
                onChange={(e) => handleChange("idCountry", e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
              />
            </div>
          </div>

          <FileUploadBox
            label={texts.idUpload}
            desc={texts.idUploadDesc}
            uploaded={idFile}
            onUpload={setIdFile}
            texts={texts}
          />
        </motion.section>

        {/* Step 2: 사업자 정보 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-sm border mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#C9A961] rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{texts.step2}</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{texts.optional}</span>
          </div>
          <p className="text-[#6B7280] text-sm mb-4 ml-11">{texts.step2Desc}</p>

          <label className="flex items-center gap-2 mb-6 ml-11 cursor-pointer">
            <input
              type="checkbox"
              checked={skipBiz}
              onChange={(e) => setSkipBiz(e.target.checked)}
              className="w-4 h-4 text-[#C9A961] rounded"
            />
            <span className="text-sm text-[#6B7280]">{texts.skipBiz}</span>
          </label>

          {!skipBiz && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.bizName}</label>
                  <input
                    type="text"
                    value={formData.bizName}
                    onChange={(e) => handleChange("bizName", e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.bizNumber}</label>
                  <input
                    type="text"
                    value={formData.bizNumber}
                    onChange={(e) => handleChange("bizNumber", e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.bizType}</label>
                  <input
                    type="text"
                    value={formData.bizType}
                    onChange={(e) => handleChange("bizType", e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
                  />
                </div>
              </div>
              <FileUploadBox
                label={texts.bizUpload}
                desc={texts.bizUploadDesc}
                uploaded={bizFile}
                onUpload={setBizFile}
                texts={texts}
              />
            </>
          )}
        </motion.section>

        {/* Step 3: 통장 사본 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-sm border mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#1F3864] rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{texts.step3}</h2>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{texts.required}</span>
          </div>
          <p className="text-[#6B7280] text-sm mb-6 ml-11">{texts.step3Desc}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.bankName}</label>
              <select
                value={formData.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
              >
                <option value="">--</option>
                {texts.banks.map((b: string) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.bankAccount}</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => handleChange("bankAccount", e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
                placeholder="000-0000-0000-00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{texts.bankHolder}</label>
              <input
                type="text"
                value={formData.bankHolder}
                onChange={(e) => handleChange("bankHolder", e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#C9A961] focus:border-transparent"
              />
            </div>
          </div>

          <FileUploadBox
            label={texts.bankUpload}
            desc={texts.bankUploadDesc}
            uploaded={bankFile}
            onUpload={setBankFile}
            texts={texts}
          />
        </motion.section>

        {/* 안내 문구 */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700">{texts.notice}</p>
        </div>

        {/* 제출 버튼 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-[#1F3864] hover:bg-[#162b50] text-white font-bold rounded-xl transition-all disabled:opacity-50 text-lg"
        >
          {submitting ? texts.submitting : texts.submit}
        </motion.button>
      </div>
      <Footer />
    </div>
  );
}
