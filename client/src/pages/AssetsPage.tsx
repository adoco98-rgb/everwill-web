/**
 * 재산 등록 관리 페이지 (/assets)
 * 회원가입 후 자산과 상속자를 등록하면 유언장 작성 시 자동으로 불러와짐
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Building2, Landmark, TrendingUp, Shield, Bitcoin,
  Car, Briefcase, PiggyBank, Gem, Package,
  Plus, Trash2, Edit3, Users, ChevronRight,
  ArrowLeft, CheckCircle2, AlertCircle,
  ScanLine, FileText, Eye, Loader2, Upload, Sparkles, X,
  Camera,
} from "lucide-react";
import { useRef } from "react";
import { Link } from "wouter";
import { HelpTooltip } from "@/components/HelpTooltip";
import { GradeGate } from "@/components/GradeGate";

// ─── 국가별 화폐 단위 매핑 ───
const COUNTRY_CURRENCY: Record<string, { code: string; symbol: string; locale: string; name: string }> = {
  KR: { code: "KRW", symbol: "₩", locale: "ko-KR", name: "원" },
  US: { code: "USD", symbol: "$", locale: "en-US", name: "USD" },
  JP: { code: "JPY", symbol: "¥", locale: "ja-JP", name: "엔" },
  CN: { code: "CNY", symbol: "¥", locale: "zh-CN", name: "위안" },
  DE: { code: "EUR", symbol: "€", locale: "de-DE", name: "유로" },
  FR: { code: "EUR", symbol: "€", locale: "fr-FR", name: "유로" },
  GB: { code: "GBP", symbol: "£", locale: "en-GB", name: "파운드" },
  AU: { code: "AUD", symbol: "A$", locale: "en-AU", name: "호주달러" },
  CA: { code: "CAD", symbol: "C$", locale: "en-CA", name: "캐나다달러" },
  SG: { code: "SGD", symbol: "S$", locale: "en-SG", name: "싱가포르달러" },
  HK: { code: "HKD", symbol: "HK$", locale: "zh-HK", name: "홍콩달러" },
  TW: { code: "TWD", symbol: "NT$", locale: "zh-TW", name: "대만달러" },
  SA: { code: "SAR", symbol: "﷼", locale: "ar-SA", name: "사우디리얄" },
  AE: { code: "AED", symbol: "د.إ", locale: "ar-AE", name: "UAE디르함" },
  IN: { code: "INR", symbol: "₹", locale: "hi-IN", name: "루피" },
  BR: { code: "BRL", symbol: "R$", locale: "pt-BR", name: "헤알" },
  MX: { code: "MXN", symbol: "$", locale: "es-MX", name: "페소" },
  RU: { code: "RUB", symbol: "₽", locale: "ru-RU", name: "루블" },
  OTHER: { code: "USD", symbol: "$", locale: "en-US", name: "USD" },
};

// 숫자를 각국 화폐 형식으로 포맷 (콤마 포함)
function formatCurrency(value: number | null | undefined, countryCode: string): string {
  if (!value) return "";
  const curr = COUNTRY_CURRENCY[countryCode] ?? COUNTRY_CURRENCY.OTHER;
  try {
    return new Intl.NumberFormat(curr.locale, {
      style: "currency",
      currency: curr.code,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${curr.symbol}${value.toLocaleString()}`;
  }
}

// 입력 문자열에서 숫자만 추출 후 콤마 포함 문자열 반환
function toCommaString(raw: string): string {
  const num = raw.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString();
}

// 콤마 문자열 → 순수 숫자 문자열
function fromCommaString(val: string): string {
  return val.replace(/[^0-9]/g, "");
}

// ─── 자산 유형 메타 ───
const ASSET_TYPE_META = {
  real_estate: { label: "부동산", icon: Building2, color: "bg-blue-50 text-blue-600 border-blue-200", desc: "아파트, 토지, 상가, 건물" },
  bank:        { label: "예금·적금", icon: Landmark, color: "bg-green-50 text-green-600 border-green-200", desc: "은행 통장, 적금, CMA" },
  stock:       { label: "주식·펀드", icon: TrendingUp, color: "bg-purple-50 text-purple-600 border-purple-200", desc: "국내외 주식, 펀드, ETF" },
  insurance:   { label: "보험", icon: Shield, color: "bg-orange-50 text-orange-600 border-orange-200", desc: "생명보험, 연금보험" },
  crypto:      { label: "가상자산", icon: Bitcoin, color: "bg-yellow-50 text-yellow-600 border-yellow-200", desc: "비트코인, 이더리움 등" },
  vehicle:     { label: "차량", icon: Car, color: "bg-red-50 text-red-600 border-red-200", desc: "자동차, 오토바이, 선박" },
  business:    { label: "사업체·지분", icon: Briefcase, color: "bg-indigo-50 text-indigo-600 border-indigo-200", desc: "법인 지분, 사업체" },
  pension:     { label: "연금", icon: PiggyBank, color: "bg-teal-50 text-teal-600 border-teal-200", desc: "국민연금, 퇴직연금, 개인연금" },
  artwork:     { label: "예술품·귀금속", icon: Gem, color: "bg-pink-50 text-pink-600 border-pink-200", desc: "미술품, 금, 보석" },
  other:       { label: "기타", icon: Package, color: "bg-gray-50 text-gray-600 border-gray-200", desc: "기타 재산" },
} as const;

const RELATIONSHIP_LABELS = {
  spouse: "배우자", child: "자녀", parent: "부모",
  sibling: "형제자매", grandchild: "손자녀", other: "기타",
};

type AssetType = keyof typeof ASSET_TYPE_META;
type RelType = keyof typeof RELATIONSHIP_LABELS;

// ─── 빈 폼 초기값 ───
const emptyAssetForm = {
  type: "bank" as AssetType,
  name: "",
  description: "",
  estimatedValue: "",       // 켄마 포함 표시용 (UI)
  estimatedValueRaw: "",   // 순수 숫자 (DB 저장용)
  currency: "KRW",
  country: "KR",
};

const emptyHeirForm = {
  nameKo: "",
  nameEn: "",
  relationship: "child" as RelType,
  birthDate: "",
  phone: "",
  email: "",
  country: "KR",
  address: "",
  sharePercent: 0,
};

// ─── 자산 문서 유형 ───
const ASSET_DOC_TYPES = [
  { value: "bank_balance",          label: "은행 잔액증명서" },
  { value: "real_estate_registry",  label: "부동산 등기부등본" },
  { value: "stock_certificate",     label: "주식보유증명서" },
  { value: "insurance_policy",      label: "보험증권" },
  { value: "pension_statement",     label: "연금 수급 확인서" },
  { value: "vehicle_registration",  label: "자동차 등록증" },
  { value: "other",                 label: "기타 자산 서류" },
];

// ─── 기타 자산 서류 예시 안내 ───
const OTHER_DOC_EXAMPLES = [
  "사업자등록증 (법인/개인사업체 지분)",
  "예·적금 증서",
  "채권·펀드 보유 확인서",
  "암호화폐(가상자산) 보유 내역",
  "골프·콘도 회원권 증서",
  "귀금속·미술품 감정서",
  "대여금·차용증 (빌려준 돈)",
  "지식재산권 (특허·상표) 등록증",
  "기타 재산적 가치가 있는 모든 서류",
];

// 스캔 결과 → 자산 유형 매핑
function mapDocTypeToAssetType(docType: string): AssetType {
  if (docType.includes("real_estate")) return "real_estate";
  if (docType.includes("bank")) return "bank";
  if (docType.includes("stock")) return "stock";
  if (docType.includes("insurance")) return "insurance";
  if (docType.includes("pension")) return "pension";
  if (docType.includes("vehicle")) return "vehicle";
  if (docType.includes("business")) return "business";
  return "other";
}

export default function AssetsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<"assets" | "heirs" | "scans">("assets");
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showHeirForm, setShowHeirForm] = useState(false);
  const [assetForm, setAssetForm] = useState(emptyAssetForm);
  const [heirForm, setHeirForm] = useState(emptyHeirForm);

  // ── 자산 스캔 OCR 상태 ──
  const [scanDocType, setScanDocType] = useState("bank_balance");
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [showScanPanel, setShowScanPanel] = useState(false);
    const scanFileInputRef = useRef<HTMLInputElement>(null);

  // ── 임시저장: 자산 폼 상태 복원 ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("everwill_asset_form_draft");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.assetForm) setAssetForm(data.assetForm);
        if (data.scanDocType) setScanDocType(data.scanDocType);
        if (data.showAssetForm) setShowAssetForm(true);
      }
    } catch { /* 무시 */ }
  }, []);

  // 임시저장: 자산 폼 변경 시 자동 저장
  useEffect(() => {
    if (assetForm.name || assetForm.estimatedValueRaw) {
      try {
        localStorage.setItem("everwill_asset_form_draft", JSON.stringify({
          assetForm,
          scanDocType,
          showAssetForm,
        }));
      } catch { /* 무시 */ }
    }
  }, [assetForm, scanDocType, showAssetForm]);

  const utils = trpc.useUtils();

  // ── 자산 스캔 OCR 뮤테이션 ──
  const assetScanMutation = trpc.willAuto.scanAndSaveAssetDocument.useMutation({
    onSuccess: (data) => {
      const d = data.data;
      setScanResult(d);
      // DB 목록 즉시 갱신 → 카드 아래에 바로 표시
      refetchScans();
      toast.success(`✅ ${d.docTypeLabel || '서류'} 등록 완료! 아래에서 내역을 확인하세요.`);
    },
    onError: (err) => {
      toast.error(err.message || "자산 서류 인식에 실패했습니다. 다시 시도해 주세요.");
    },
  });

  // ── 스캔 파일 처리 (이미지·PDF·Word·Excel·HWP 모두) ──
  function handleScanImageSelect(file: File) {
    const allowedTypes = [
      "image/", "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/haansofthwp", "application/x-hwp",
      "text/plain",
    ];
    const isAllowed = allowedTypes.some((t) => file.type.startsWith(t)) || /\.(pdf|hwp|hwpx|doc|docx|xls|xlsx|txt)$/i.test(file.name);
    if (!isAllowed) { toast.error("지원하지 않는 파일 형식입니다. (이미지·PDF·Word·Excel·HWP 가능)"); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("파일 크기는 20MB 이하여야 합니다."); return; }
    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // 이미지가 아닌 문서는 파일아이콘 미리보기
      setScanPreview(isImage ? dataUrl : `__file__:${file.name}`);
      setScanResult(null);
      assetScanMutation.mutate({ imageUrl: dataUrl, docTypeHint: scanDocType as any });
    };
    reader.readAsDataURL(file);
  }

  // ── 재산 쿼리 ──
  const { data: assetList = [], isLoading: assetsLoading } = trpc.asset.listAssets.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: heirList = [], isLoading: heirsLoading } = trpc.asset.listHeirs.useQuery(
    undefined, { enabled: isAuthenticated }
  );

  // ── 자산증명서 스캔 ──
  const { data: scanData, isLoading: scansLoading, refetch: refetchScans } = trpc.willAuto.listAssetScans.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const scanList = (scanData?.scans || []) as any[];
  const deleteScanMutation = trpc.willAuto.deleteAssetScan.useMutation({
    onSuccess: () => { toast.success("삭제되었습니다."); refetchScans(); },
    onError: (err) => toast.error(err.message || "삭제 실패"),
  });
  const [editingScanId, setEditingScanId] = useState<number | null>(null);
  const [editMemo, setEditMemo] = useState("");
  const [editValue, setEditValue] = useState("");
  const updateScanMutation = trpc.willAuto.updateAssetScanMemo.useMutation({
    onSuccess: () => { toast.success("수정되었습니다."); setEditingScanId(null); refetchScans(); },
    onError: (err) => toast.error(err.message || "수정 실패"),
  });
  const [expandedScanId, setExpandedScanId] = useState<number | null>(null);

  // ── 재산 뮤테이션 ──
  const addAsset = trpc.asset.addAsset.useMutation({
    onSuccess: () => {
      utils.asset.listAssets.invalidate();
      setShowAssetForm(false);
      setAssetForm(emptyAssetForm);
      toast.success("재산이 등록됐습니다");
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteAsset = trpc.asset.deleteAsset.useMutation({
    onSuccess: () => { utils.asset.listAssets.invalidate(); toast.success("삭제됐습니다"); },
  });

  // ── 상속자 뮤테이션 ──
  const addHeir = trpc.asset.addHeir.useMutation({
    onSuccess: () => {
      utils.asset.listHeirs.invalidate();
      setShowHeirForm(false);
      setHeirForm(emptyHeirForm);
      toast.success("상속자가 등록됐습니다");
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteHeir = trpc.asset.deleteHeir.useMutation({
    onSuccess: () => { utils.asset.listHeirs.invalidate(); toast.success("삭제됐습니다"); },
  });

  // ── 총 자산 합계 ──
  const totalValue = assetList.reduce((sum, a) => sum + (a.estimatedValue ?? 0), 0);
  const shareTotal = heirList.reduce((sum, h) => sum + (h.sharePercent ?? 0), 0);

  // ── 로그인 필요 ──
  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-[#C9A961] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1F3864] mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-500 mb-6">재산 등록은 회원 전용 서비스입니다.</p>
          <a href="/login" className="btn-gold px-6 py-3 rounded-full font-bold">
            로그인 / 회원가입
          </a>
        </div>
      </div>
    );
  }

  return (
    <GradeGate requiredGrade="silver" featureName="재산 등록" description="재산 등록 및 상속인 관리는 실버 이상 회원만 이용할 수 있습니다." mode="block">
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ── 상단 헤더 ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-gray-500 hover:text-[#1F3864] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">홈으로</span>
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-[#1F3864] text-lg">내 재산 관리</h1>
            <p className="text-xs text-gray-400">유언장 작성 시 자동으로 불러와집니다</p>
          </div>

        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── 요약 카드 ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-[#1F3864]">{assetList.length}</div>
            <div className="text-sm text-gray-400 mt-1">등록된 자산</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-[#C9A961]">
              {totalValue > 0 ? `${(totalValue / 100000000).toFixed(1)}억` : "미입력"}
            </div>
            <div className="text-sm text-gray-400 mt-1">총 예상 자산</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-[#1F3864]">{heirList.length}</div>
              {shareTotal === 100 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {shareTotal > 0 && shareTotal !== 100 && <AlertCircle className="w-5 h-5 text-orange-400" />}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              상속자 {shareTotal > 0 ? `(지분 합계 ${shareTotal}%)` : ""}
            </div>
          </div>
        </div>

        {/* ── 탭 ── */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 flex-wrap">
          {(["assets", "heirs", "scans"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? "bg-white text-[#1F3864] shadow-sm" : "text-gray-500"
              }`}
            >
              {t === "assets" ? "💰 내 재산" : t === "heirs" ? "👨‍👩‍👧 상속자" : "📄 자산증명서"}
            </button>
          ))}
        </div>

        {/* ══════════════ 재산 탭 ══════════════ */}
        {tab === "assets" && (
          <div>
            {/* ── 서류 등록 목록 (항상 표시) ── */}
            <div className="bg-white rounded-2xl border border-[#1F3864]/10 shadow-sm p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1F3864]" />
                  <h3 className="font-bold text-[#1F3864] text-sm">서류 등록 목록</h3>
                  <span className="text-xs text-gray-400">— 서류를 업로드하면 AI가 자동으로 자산 정보를 인식합니다</span>
                </div>

              </div>

              {/* PDF 업로드 안내 문구 */}
              <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <span className="text-base leading-none mt-0.5">💡</span>
                <div>
                  <span className="font-semibold">PDF 업로드 안내</span>
                  <span className="ml-1">텍스트가 있는 PDF(디지털 발급)는 AI가 자동 인식합니다.</span>
                  <br />
                  <span className="text-amber-700">카메라로 찍어 저장한 스캔 이미지 PDF는 인식 불가 → JPG 또는 PNG 이미지로 업로드해주세요.</span>
                </div>
              </div>

              {/* 서류 유형 카드 그리드 - 클릭하면 즉시 파일 선택사다 열림 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ASSET_DOC_TYPES.map((dt) => {
                  const fileInputId = `scan-input-${dt.value}`;
                  const isThisActive = scanDocType === dt.value;
                  const isPending = isThisActive && assetScanMutation.isPending;
                  // DB에 저장된 해당 서류 타입의 스캔 목록
                  const savedScans = scanList.filter((s: any) => s.docType === dt.value);
                  const hasSaved = savedScans.length > 0;
                  return (
                    <div key={dt.value} className="flex flex-col">
                      {/* 카드 전체를 클릭하면 파일 선택사다 열림 */}
                      <label
                        htmlFor={fileInputId}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                          isPending ? "border-[#1F3864] bg-[#1F3864]/5 cursor-wait" :
                          hasSaved ? "border-green-400 bg-green-50" :
                          "border-gray-100 bg-gray-50 hover:border-[#1F3864]/50 hover:bg-[#1F3864]/5"
                        }`}
                      >
                        {/* 아이콘 */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          hasSaved ? "bg-green-100" : "bg-[#1F3864]/10"
                        }`}>
                          {isPending ? (
                            <Loader2 className="w-4 h-4 text-[#1F3864] animate-spin" />
                          ) : hasSaved ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#1F3864]" />
                          )}
                        </div>
                        {/* 서류명 */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${
                            hasSaved ? "text-green-700" : "text-gray-800"
                          }`}>{dt.label}</p>
                          {isPending && <p className="text-xs text-[#1F3864] mt-0.5">AI 분석 중...</p>}
                          {!isPending && hasSaved && (
                            <p className="text-xs text-green-600 mt-0.5">
                              ✓ {savedScans.length}건 등록됨 — 클릭하여 추가 업로드
                            </p>
                          )}
                          {!isPending && !hasSaved && (
                            <p className="text-xs text-gray-400 mt-0.5">클릭하여 업로드</p>
                          )}
                        </div>
                        {/* 우측 아이콘 */}
                        {!isPending && (
                          <Upload className={`w-4 h-4 flex-shrink-0 ${
                            hasSaved ? "text-green-500" : "text-gray-400"
                          }`} />
                        )}
                      </label>
                      {/* 파일 입력 */}
                      <input
                        id={fileInputId}
                        type="file"
                        accept="image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.hwp,.hwpx,.txt"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            setScanDocType(dt.value);
                            setScanPreview(null);
                            setScanResult(null);
                            Array.from(files).forEach((f) => handleScanImageSelect(f));
                          }
                          e.target.value = "";
                        }}
                      />
                      {/* DB 저장된 내역 — 카드 바로 아래에 항상 표시 */}
                      {hasSaved && savedScans.map((scan: any) => (
                        <div key={scan.id} className="mt-1 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800">
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                            {scan.issuer && <p>발급기관: <strong>{scan.issuer}</strong></p>}
                            {scan.assetName && <p>자산명: <strong>{scan.assetName}</strong></p>}
                            {scan.amount && <p>금액: <strong className="text-[#C9A961]">{Number(String(scan.amount).replace(/[^0-9]/g, "") || 0).toLocaleString()}원</strong></p>}
                            {scan.location && <p className="col-span-2">소재지: <strong>{scan.location}</strong></p>}
                            {scan.referenceDate && <p>발급일: {scan.referenceDate}</p>}
                            {scan.ownerName && <p>소유자: {scan.ownerName}</p>}
                            {scan.area && <p>면적: {scan.area}</p>}
                            {scan.userMemo && <p className="col-span-2 text-blue-700">메모: {scan.userMemo}</p>}
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className={`font-semibold ${
                              scan.confidence === "high" ? "text-green-700" :
                              scan.confidence === "medium" ? "text-yellow-600" : "text-red-600"
                            }`}>신뢰도: {scan.confidence === "high" ? "높음" : scan.confidence === "medium" ? "보통" : "낮음"}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => { e.preventDefault(); setEditingScanId(editingScanId === scan.id ? null : scan.id); setEditMemo(scan.userMemo || ""); setEditValue(scan.estimatedValue ? String(scan.estimatedValue) : ""); }}
                                className="px-2 py-0.5 rounded text-xs bg-white border border-gray-200 text-gray-500 hover:text-blue-500"
                              >수정</button>
                              <button
                                onClick={(e) => { e.preventDefault(); if (window.confirm("삭제하시겠습니까?")) deleteScanMutation.mutate({ scanId: scan.id }); }}
                                className="px-2 py-0.5 rounded text-xs bg-white border border-gray-200 text-gray-500 hover:text-red-500"
                              >삭제</button>
                            </div>
                          </div>
                          {/* 수정 폼 */}
                          {editingScanId === scan.id && (
                            <div className="mt-2 p-2 bg-white rounded-lg space-y-2">
                              <input value={editMemo} onChange={(e) => setEditMemo(e.target.value)} placeholder="메모" className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#1F3864]" />
                              <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder="추정가치 (원)" className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#1F3864]" />
                              <div className="flex gap-1">
                                <button onClick={(e) => { e.preventDefault(); setEditingScanId(null); }} className="flex-1 py-1 rounded border border-gray-200 text-xs text-gray-500">닫기</button>
                                <button onClick={(e) => { e.preventDefault(); updateScanMutation.mutate({ scanId: scan.id, userMemo: editMemo, estimatedValue: editValue ? Number(editValue) : undefined }); }} disabled={updateScanMutation.isPending} className="flex-1 py-1 rounded bg-[#1F3864] text-white text-xs disabled:opacity-50">{updateScanMutation.isPending ? "저장중" : "저장"}</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>


          </div>
        )}

        {/* ══════════════ 자산증명서 스캔 탭 ══════════════ */}
        {tab === "scans" && (
          <div>
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
              <ScanLine className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">자산증명서 스캔 보관함</p>
                <p className="text-xs text-green-600 mt-0.5">유언장 작성 시 스캔한 서류가 자동으로 연동됩니다. 여러 장의 등기부등본도 모두 저장됩니다.</p>
              </div>
            </div>
            {scansLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#1F3864] animate-spin" />
              </div>
            ) : scanList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <ScanLine className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">스캔된 자산증명서가 없습니다.</p>
                <p className="text-gray-300 text-xs mt-1">유언장 작성 시 2단계에서 업로드하세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-semibold">전체 {scanList.length}건 저장됨</p>
                {scanList.map((scan: any) => (
                  <div key={scan.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1F3864]/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-[#1F3864]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-[#1F3864]">{scan.docTypeLabel || scan.docType}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              scan.confidence === "high" ? "bg-green-100 text-green-700" :
                              scan.confidence === "medium" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {scan.confidence === "high" ? "높음" : scan.confidence === "medium" ? "보통" : "낙음"} 신뢰도
                            </span>
                          </div>
                          {scan.issuer && <p className="text-xs text-gray-500 mt-0.5">{scan.issuer}</p>}
                          {scan.assetName && <p className="text-xs text-gray-600 mt-0.5 font-medium">{scan.assetName}</p>}
                          {scan.amount && (
                            <p className="text-sm font-bold text-[#C9A961] mt-1">
                              {Number(scan.amount).toLocaleString()}{scan.unit || "원"}
                            </p>
                          )}
                          {scan.location && <p className="text-xs text-gray-400 mt-0.5">소재지: {scan.location}</p>}
                          {scan.referenceDate && <p className="text-xs text-gray-400">발급일: {scan.referenceDate}</p>}
                          {scan.userMemo && <p className="text-xs text-blue-600 mt-0.5">메모: {scan.userMemo}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setExpandedScanId(expandedScanId === scan.id ? null : scan.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1F3864] hover:bg-[#1F3864]/5 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => {
                            setEditingScanId(scan.id);
                            setEditMemo(scan.userMemo || "");
                            setEditValue(scan.estimatedValue ? String(scan.estimatedValue) : "");
                          }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => {
                            if (window.confirm("이 자산증명서를 삭제하시겠습니까?"))
                              deleteScanMutation.mutate({ scanId: scan.id });
                          }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {/* 메모 수정 폼 */}
                      {editingScanId === scan.id && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-2">
                          <div>
                            <label className="text-xs font-semibold text-gray-600">메모</label>
                            <input value={editMemo} onChange={(e) => setEditMemo(e.target.value)}
                              placeholder="자유롭게 메모를 입력하세요"
                              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1F3864]" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600">수동 입력 추정가치 (원)</label>
                            <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                              placeholder="예: 150000000"
                              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1F3864]" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingScanId(null)}
                              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 font-semibold">장닫기</button>
                            <button onClick={() => updateScanMutation.mutate({
                              scanId: scan.id,
                              userMemo: editMemo,
                              estimatedValue: editValue ? Number(editValue) : undefined,
                            })} disabled={updateScanMutation.isPending}
                              className="flex-1 py-2 rounded-lg bg-[#1F3864] text-white text-sm font-semibold disabled:opacity-50">
                              {updateScanMutation.isPending ? "저장 중..." : "저장"}
                            </button>
                          </div>
                        </div>
                      )}
                      {/* 상세 펼치기 */}
                      {expandedScanId === scan.id && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-1">
                          {scan.ownerName && <p><span className="font-semibold">소유자:</span> {scan.ownerName}</p>}
                          {scan.assetCode && <p><span className="font-semibold">자산코드:</span> {scan.assetCode}</p>}
                          {scan.area && <p><span className="font-semibold">면적:</span> {scan.area}</p>}
                          {scan.beneficiary && <p><span className="font-semibold">수익자:</span> {scan.beneficiary}</p>}
                          {scan.additionalInfo && <p><span className="font-semibold">추가정보:</span> {scan.additionalInfo}</p>}
                          {scan.imageUrl && (
                            <a href={scan.imageUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#1F3864] font-semibold hover:underline mt-1">
                              <Eye className="w-3.5 h-3.5" />원본 이미지 보기
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ══════════════ 상속자 탭 ══════════════ */}
        {tab === "heirs" && (
          <div>
            {/* 지분 경고 */}
            {shareTotal > 0 && shareTotal !== 100 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-orange-700 text-sm">
                  상속 지분 합계가 <strong>{shareTotal}%</strong>입니다. 합계가 100%가 되도록 조정해주세요.
                </p>
              </div>
            )}
            {shareTotal === 100 && heirList.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm">상속 지분 합계 100% — 완료됐습니다.</p>
              </div>
            )}

            {/* 상속자 추가 버튼 */}
            <button
              onClick={() => setShowHeirForm(!showHeirForm)}
              className="w-full bg-white border-2 border-dashed border-[#C9A961]/40 rounded-2xl p-4 flex items-center justify-center gap-3 text-[#C9A961] font-semibold hover:border-[#C9A961] hover:bg-[#C9A961]/5 transition-all mb-4"
            >
              <Plus className="w-5 h-5" />
              상속자 추가하기
            </button>

            {/* 상속자 추가 폼 */}
            {showHeirForm && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <h3 className="font-bold text-[#1F3864] mb-4">새 상속자 등록</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">이름 (한국어) *</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder="예: 홍길동"
                      value={heirForm.nameKo}
                      onChange={e => setHeirForm(f => ({ ...f, nameKo: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">이름 (영문)</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder="예: Hong Gildong"
                      value={heirForm.nameEn}
                      onChange={e => setHeirForm(f => ({ ...f, nameEn: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">관계 *</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      value={heirForm.relationship}
                      onChange={e => setHeirForm(f => ({ ...f, relationship: e.target.value as RelType }))}
                    >
                      {(Object.entries(RELATIONSHIP_LABELS) as [RelType, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">상속 지분 (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder="예: 50"
                      value={heirForm.sharePercent || ""}
                      onChange={e => setHeirForm(f => ({ ...f, sharePercent: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">생년월일</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      value={heirForm.birthDate}
                      onChange={e => setHeirForm(f => ({ ...f, birthDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">휴대폰</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder="+82-10-0000-0000"
                      value={heirForm.phone}
                      onChange={e => setHeirForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">이메일</label>
                    <input
                      type="email"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder="example@email.com"
                      value={heirForm.email}
                      onChange={e => setHeirForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">거주 국가</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      value={heirForm.country}
                      onChange={e => setHeirForm(f => ({ ...f, country: e.target.value }))}
                    >
                      <option value="KR">🇰🇷 한국</option>
                      <option value="US">🇺🇸 미국</option>
                      <option value="JP">🇯🇵 일본</option>
                      <option value="CN">🇨🇳 중국</option>
                      <option value="OTHER">기타</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => addHeir.mutate({
                      nameKo: heirForm.nameKo,
                      nameEn: heirForm.nameEn || undefined,
                      relationship: heirForm.relationship,
                      birthDate: heirForm.birthDate || undefined,
                      phone: heirForm.phone || undefined,
                      email: heirForm.email || undefined,
                      country: heirForm.country,
                      address: heirForm.address || undefined,
                      sharePercent: heirForm.sharePercent,
                    })}
                    disabled={!heirForm.nameKo || addHeir.isPending}
                    className="btn-gold px-6 py-2 rounded-full text-sm font-bold disabled:opacity-50"
                  >
                    {addHeir.isPending ? "등록 중..." : "등록하기"}
                  </button>
                  <button
                    onClick={() => setShowHeirForm(false)}
                    className="px-6 py-2 rounded-full text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 상속자 목록 */}
            {heirsLoading ? (
              <div className="text-center py-12 text-gray-400">불러오는 중...</div>
            ) : heirList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">아직 등록된 상속자가 없습니다</p>
                <p className="text-gray-300 text-xs mt-1">위 버튼을 눌러 상속자를 추가하세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {heirList.map((heir) => (
                  <div key={heir.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1F3864]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#1F3864] font-bold text-sm">{heir.nameKo.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1F3864] text-sm">{heir.nameKo}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>{RELATIONSHIP_LABELS[heir.relationship as RelType]}</span>
                        {heir.phone && <span>· {heir.phone}</span>}
                        {heir.country && heir.country !== "KR" && <span>· {heir.country}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`font-bold text-sm ${heir.sharePercent ? "text-[#C9A961]" : "text-gray-300"}`}>
                        {heir.sharePercent ? `${heir.sharePercent}%` : "지분 미설정"}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHeir.mutate({ id: heir.id })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 하단 CTA ── */}
        <div className="mt-10 bg-[#1F3864] rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold text-lg mb-2">재산 등록이 완료되었나요?</h3>
          <p className="text-white/60 text-sm mb-4">
            다음 단계로 상속자를 등록해주세요.
          </p>
          <Link href="/dashboard/heirs">
            <button className="btn-gold px-8 py-3 rounded-full font-bold">
              상속자 등록하기 →
            </button>
          </Link>
        </div>

      </div>
    </div>
    </GradeGate>
  );
}
