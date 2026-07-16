/**
 * 2단계: 자산 등록
 * 문서 업로드 → AI 자동 인식 → 정보 자동 입력 → 사용자 확인/수정/저장
 * 고령 사용자 친화적 UX: 직접 입력 최소화, 큰 글씨, 명확한 안내
 */
import { useState, useRef } from "react";
import {
  ClipboardList, Plus, Trash2, CheckCircle2, Home, Banknote, Car, Package,
  Upload, ScanLine, Sparkles, Loader2, X, Camera, Eye, Edit3, FileText,
  TrendingUp, Shield, Bitcoin, Briefcase, PiggyBank, Gem,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
}

// ─── 자산 유형 메타 ───
const ASSET_TYPES = [
  { value: "real_estate" as const, label: "부동산", icon: Home, color: "#3B82F6", desc: "아파트, 토지, 상가" },
  { value: "bank" as const, label: "금융자산", icon: Banknote, color: "#10B981", desc: "예금, 적금, CMA" },
  { value: "stock" as const, label: "주식·펀드", icon: TrendingUp, color: "#8B5CF6", desc: "국내외 주식, ETF" },
  { value: "insurance" as const, label: "보험", icon: Shield, color: "#F97316", desc: "생명보험, 연금보험" },
  { value: "vehicle" as const, label: "차량", icon: Car, color: "#F59E0B", desc: "자동차, 오토바이" },
  { value: "crypto" as const, label: "가상자산", icon: Bitcoin, color: "#EAB308", desc: "비트코인, 이더리움" },
  { value: "business" as const, label: "사업체", icon: Briefcase, color: "#6366F1", desc: "법인 지분, 사업체" },
  { value: "pension" as const, label: "연금", icon: PiggyBank, color: "#14B8A6", desc: "국민연금, 퇴직연금" },
  { value: "artwork" as const, label: "귀금속", icon: Gem, color: "#EC4899", desc: "미술품, 금, 보석" },
  { value: "other" as const, label: "기타", icon: Package, color: "#6B7280", desc: "기타 재산" },
];

type AssetType = typeof ASSET_TYPES[number]["value"];

// ─── 서류 유형 ───
const DOC_TYPES = [
  { value: "bank_balance", label: "은행 잔액증명서", assetType: "bank" },
  { value: "real_estate_registry", label: "부동산 등기부등본", assetType: "real_estate" },
  { value: "stock_certificate", label: "주식보유증명서", assetType: "stock" },
  { value: "insurance_policy", label: "보험증권", assetType: "insurance" },
  { value: "pension_statement", label: "연금 수급확인서", assetType: "pension" },
  { value: "vehicle_registration", label: "자동차 등록증", assetType: "vehicle" },
  { value: "other", label: "기타 자산 서류", assetType: "other" },
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

// 숫자를 콤마 포함 문자열로
function toCommaString(raw: string): string {
  const num = raw.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString();
}

export default function Step2Assets({ onComplete }: Props) {
  // ── 상태 관리 ──
  const [mode, setMode] = useState<"list" | "scan" | "form">("list");
  const [scanDocType, setScanDocType] = useState("bank_balance");
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [form, setForm] = useState({
    type: "bank" as AssetType,
    name: "",
    description: "",
    estimatedValue: "",
    estimatedValueRaw: "",
    details: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── tRPC ──
  const { data: assets, refetch } = trpc.asset.listAssets.useQuery();
  const addMutation = trpc.asset.addAsset.useMutation({
    onSuccess: () => {
      toast.success("자산이 등록됐습니다!");
      refetch();
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.asset.deleteAsset.useMutation({
    onSuccess: () => { toast.success("삭제됐습니다."); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const scanMutation = trpc.willAuto.scanAndSaveAssetDocument.useMutation({
    onSuccess: (data) => {
      const d = data.data;
      setScanResult(d);
      // 자동 채움
      const assetType = mapDocTypeToAssetType(d.detectedDocType || scanDocType);
      const rawAmount = d.amount ? d.amount.replace(/[^0-9]/g, "") : "";
      setForm({
        type: assetType,
        name: d.assetName || d.issuer || "",
        description: [
          d.issuer ? `발급기관: ${d.issuer}` : "",
          d.location ? `소재지: ${d.location}` : "",
          d.assetCode ? `코드: ${d.assetCode}` : "",
          d.additionalInfo || "",
        ].filter(Boolean).join(" / "),
        estimatedValue: rawAmount ? Number(rawAmount).toLocaleString() : "",
        estimatedValueRaw: rawAmount,
        details: d.location || d.assetCode || "",
      });
      setMode("form");
      toast.success("서류 인식 완료! 아래 정보를 확인해주세요.");
    },
    onError: (err) => {
      toast.error(err.message || "서류 인식에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const resetForm = () => {
    setMode("list");
    setScanPreview(null);
    setScanResult(null);
    setForm({ type: "bank", name: "", description: "", estimatedValue: "", estimatedValueRaw: "", details: "" });
  };

  // ── 파일 선택 처리 ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 허용 파일 형식: 이미지, PDF, Word, Excel, HWP 등 모든 문서
    const allowedTypes = [
      "image/", "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/haansofthwp", "application/x-hwp",
      "text/plain",
    ];
    const isAllowed = allowedTypes.some((t) => file.type.startsWith(t)) || file.name.match(/\.(pdf|hwp|hwpx|doc|docx|xls|xlsx|txt)$/i);
    if (!isAllowed) { toast.error("지원하지 않는 파일 형식입니다. (이미지·PDF·Word·Excel·HWP 가능)"); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("파일 크기는 20MB 이하여야 합니다."); return; }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/");

    // PDF 또는 문서 파일: 파일 아이콘 미리보기 + 파일명 표시
    if (!isImage) {
      setScanPreview(`__file__:${file.name}`);
      setScanResult(null);
      // base64로 변환 후 서버 전송
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        scanMutation.mutate({ imageUrl: dataUrl, docTypeHint: scanDocType as any });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
      return;
    }

    // 이미지 파일: 기존 방식
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setScanPreview(dataUrl);
      setScanResult(null);
      scanMutation.mutate({ imageUrl: dataUrl, docTypeHint: scanDocType as any });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── 자산 저장 ──
  const handleSave = () => {
    if (!form.name) { toast.error("자산명을 확인해주세요."); return; }
    addMutation.mutate({
      type: form.type,
      name: form.name,
      description: form.description,
      estimatedValue: form.estimatedValueRaw ? Number(form.estimatedValueRaw) : undefined,
      details: form.details,
    });
  };

  const totalValue = assets?.reduce((sum, a) => sum + (a.estimatedValue || 0), 0) || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">2단계: 자산 등록</h3>
            <p className="text-white/70 text-sm">서류를 업로드하면 자동으로 정보가 입력됩니다</p>
          </div>
          {assets && assets.length > 0 && (
            <div className="ml-auto text-right">
              <div className="text-white font-bold text-xl">{assets.length}건</div>
              <div className="text-white/60 text-xs">등록 완료</div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ══════════ 목록 모드 ══════════ */}
        {mode === "list" && (
          <>
            {/* 총 자산 요약 */}
            {assets && assets.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-green-700 font-medium">총 등록 자산 추정가</span>
                <span className="text-lg font-bold text-green-700">
                  {totalValue > 0 ? `₩${totalValue.toLocaleString()}` : "미입력"}
                </span>
              </div>
            )}

            {/* 자산 목록 */}
            {assets && assets.length > 0 && (
              <div className="space-y-2">
                {assets.map((asset) => {
                  const typeInfo = ASSET_TYPES.find((t) => t.value === asset.type) || ASSET_TYPES[9];
                  const TypeIcon = typeInfo.icon;
                  return (
                    <div key={asset.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${typeInfo.color}15` }}>
                        <TypeIcon className="w-5 h-5" style={{ color: typeInfo.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{asset.name}</p>
                        <p className="text-xs text-gray-400">{typeInfo.label}{asset.estimatedValue ? ` · ₩${asset.estimatedValue.toLocaleString()}` : ""}</p>
                      </div>
                      <button
                        onClick={() => deleteMutation.mutate({ id: asset.id })}
                        className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 자산이 없을 때 안내 */}
            {(!assets || assets.length === 0) && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                  <ScanLine className="w-10 h-10 text-green-500" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">서류를 업로드하면 자동 등록됩니다</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  잔액증명서, 등기부등본, 자동차등록증 등<br />
                  서류 사진을 찍으면 AI가 자동으로 인식합니다
                </p>
              </div>
            )}

            {/* 등록 버튼 2개: 서류 스캔(메인) + 직접 입력(보조) */}
            <div className="space-y-3">
              <button
                onClick={() => setMode("scan")}
                className="w-full bg-gradient-to-r from-[#1F3864] to-[#2d4a7a] text-white py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg"
              >
                <ScanLine className="w-6 h-6" />
                서류 업로드로 자동 등록
              </button>
              <button
                onClick={() => { setMode("form"); setScanPreview(null); setScanResult(null); }}
                className="w-full border-2 border-dashed border-gray-200 text-gray-500 py-3.5 rounded-xl text-sm font-medium hover:border-[#1F3864] hover:text-[#1F3864] transition-all flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                직접 입력하기
              </button>
            </div>

            {/* 다음 단계 버튼 */}
            <button
              onClick={onComplete}
              disabled={!assets || assets.length === 0}
              className="w-full bg-[#1F3864] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#162d52] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 className="w-4 h-4" />
              자산 등록 완료 · 다음 단계로
            </button>
            {(!assets || assets.length === 0) && (
              <p className="text-xs text-gray-400 text-center">최소 1개 이상의 자산을 등록해야 다음 단계로 진행할 수 있습니다.</p>
            )}
          </>
        )}

        {/* ══════════ 스캔 모드 ══════════ */}
        {mode === "scan" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1F3864]" />
                <h4 className="font-bold text-[#1F3864] text-lg">서류 자동 인식</h4>
              </div>
              <button onClick={resetForm} className="text-sm text-gray-400 hover:text-gray-600">취소</button>
            </div>

            {/* 안내 */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">📋 이렇게 하세요</p>
              <ol className="space-y-1.5 text-sm text-blue-700">
                <li className="flex items-start gap-2"><span className="font-bold text-blue-500">1.</span> 아래에서 서류 종류를 선택하세요</li>
                <li className="flex items-start gap-2"><span className="font-bold text-blue-500">2.</span> 서류 사진을 찍거나 파일을 선택하세요</li>
                <li className="flex items-start gap-2"><span className="font-bold text-blue-500">3.</span> AI가 자동으로 내용을 읽어 입력합니다</li>
                <li className="flex items-start gap-2"><span className="font-bold text-blue-500">4.</span> 잘못된 부분만 수정하고 저장하세요</li>
              </ol>
            </div>

            {/* 서류 유형 선택 */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-3 block">어떤 서류를 업로드하시나요?</label>
              <div className="grid grid-cols-2 gap-2">
                {DOC_TYPES.map((dt) => (
                  <button
                    key={dt.value}
                    onClick={() => setScanDocType(dt.value)}
                    className={`px-3 py-3 rounded-xl text-sm font-semibold border transition-all text-left ${
                      scanDocType === dt.value
                        ? "bg-[#1F3864] text-white border-[#1F3864]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#1F3864]/30"
                    }`}
                  >
                    {dt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 파일 입력 (숨김) - 이미지·PDF·Word·Excel·HWP 모두 허용 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.hwp,.hwpx,.txt"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* PDF 안내 문구 */}
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <span className="text-base leading-none mt-0.5">💡</span>
              <div>
                <span className="font-semibold">PDF 업로드 안내</span>
                <span className="ml-1">텍스트가 있는 PDF(디지털 발급)는 AI가 자동 인식합니다.</span>
                <br />
                <span className="text-amber-700">카메라로 찍어 저장한 스캔 이미지 PDF는 인식 불가 → JPG 또는 PNG 이미지로 업로드해주세요.</span>
              </div>
            </div>

            {/* 미리보기 + AI 인식 중 */}
            {scanPreview ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  {scanPreview.startsWith("__file__:") ? (
                    <div className="w-full h-40 bg-gray-50 flex flex-col items-center justify-center gap-2">
                      <FileText className="w-12 h-12 text-[#1F3864]/60" />
                      <p className="text-sm font-semibold text-gray-700 px-4 text-center break-all">{scanPreview.replace("__file__:", "")}</p>
                      <p className="text-xs text-gray-400">문서 파일 업로드 완료</p>
                    </div>
                  ) : (
                    <img src={scanPreview} alt="업로드된 서류" className="w-full max-h-64 object-contain bg-gray-50" />
                  )}
                  {scanMutation.isPending && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-10 h-10 text-[#1F3864] animate-spin" />
                      <p className="text-base font-bold text-[#1F3864]">AI가 서류를 읽고 있습니다...</p>
                      <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
                    </div>
                  )}
                  {!scanMutation.isPending && (
                    <button
                      onClick={() => { setScanPreview(null); setScanResult(null); }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {!scanMutation.isPending && !scanResult && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-gray-200 text-gray-500 py-3 rounded-xl text-sm font-medium hover:border-[#1F3864] transition-all"
                  >
                    다른 사진으로 다시 시도
                  </button>
                )}
              </div>
            ) : (
              /* 업로드 영역 */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#1F3864]/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#1F3864]/60 hover:bg-[#1F3864]/3 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#1F3864]/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[#1F3864]" />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-gray-700">서류 파일을 업로드하세요</p>
                  <p className="text-sm text-gray-400 mt-1">이미지·PDF·Word·Excel·HWP 모두 가능</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1.5 bg-[#1F3864] text-white rounded-lg text-xs font-semibold">이미지 (JPG·PNG)</span>
                  <span className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold">PDF</span>
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold">Word</span>
                  <span className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-semibold">Excel</span>
                  <span className="px-3 py-1.5 bg-sky-50 text-sky-600 border border-sky-200 rounded-lg text-xs font-semibold">HWP</span>
                </div>
                <p className="text-xs text-gray-400">등기부등본·잔액증명서·보험증권 등 최대 20MB</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════ 폼 모드 (AI 인식 결과 확인 / 직접 입력) ══════════ */}
        {mode === "form" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#1F3864] text-lg">
                {scanResult ? "✅ 인식 결과 확인" : "자산 직접 입력"}
              </h4>
              <button onClick={resetForm} className="text-sm text-gray-400 hover:text-gray-600">취소</button>
            </div>

            {/* AI 인식 결과 안내 */}
            {scanResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-800 text-sm">AI 인식 완료!</span>
                </div>
                <p className="text-sm text-green-700">
                  아래 정보가 자동으로 입력되었습니다. <strong>잘못된 부분이 있으면 수정</strong>하고 저장해주세요.
                </p>
                {scanResult.confidence && (
                  <p className="text-xs text-green-600 mt-1">인식 신뢰도: {Math.round(scanResult.confidence * 100)}%</p>
                )}
              </div>
            )}

            {/* 미리보기 (스캔한 경우) */}
            {scanPreview && (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <img src={scanPreview} alt="업로드된 서류" className="w-full max-h-40 object-contain bg-gray-50" />
              </div>
            )}

            {/* 자산 유형 */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">자산 유형</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ASSET_TYPES.map((t) => {
                  const TIcon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setForm({ ...form, type: t.value })}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        form.type === t.value ? "border-[#1F3864] bg-[#1F3864]/5 text-[#1F3864]" : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <TIcon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 자산명 */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">자산명 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 국민은행 정기예금, 서울 강남구 아파트"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#1F3864] focus:ring-1 focus:ring-[#1F3864]/20"
              />
            </div>

            {/* 상세 정보 */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">상세 정보</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="발급기관, 소재지, 계좌번호 등"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#1F3864] focus:ring-1 focus:ring-[#1F3864]/20"
              />
            </div>

            {/* 추정 가치 */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">추정 가치 (원)</label>
              <input
                type="text"
                value={form.estimatedValue}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setForm({
                    ...form,
                    estimatedValue: raw ? Number(raw).toLocaleString() : "",
                    estimatedValueRaw: raw,
                  });
                }}
                placeholder="예: 50,000,000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#1F3864] focus:ring-1 focus:ring-[#1F3864]/20"
              />
              {form.estimatedValueRaw && Number(form.estimatedValueRaw) >= 100000000 && (
                <p className="text-xs text-gray-500 mt-1">
                  = 약 {(Number(form.estimatedValueRaw) / 100000000).toFixed(1)}억원
                </p>
              )}
            </div>

            {/* 비고 */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">비고 (선택)</label>
              <input
                type="text"
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="추가 메모"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#1F3864] focus:ring-1 focus:ring-[#1F3864]/20"
              />
            </div>

            {/* 저장 / 취소 버튼 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={resetForm}
                className="flex-1 border border-gray-200 text-gray-500 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={addMutation.isPending || !form.name}
                className="flex-1 bg-[#1F3864] text-white py-3.5 rounded-xl text-base font-bold disabled:opacity-50 hover:bg-[#162d52] transition-all flex items-center justify-center gap-2"
              >
                {addMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> 확인 · 저장</>
                )}
              </button>
            </div>

            {/* 추가 안내 */}
            {scanResult && (
              <p className="text-xs text-center text-gray-400">
                저장 후 다른 서류도 계속 업로드할 수 있습니다
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
