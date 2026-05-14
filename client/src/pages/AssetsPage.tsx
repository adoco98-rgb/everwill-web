/**
 * 재산 등록 관리 페이지 (/assets)
 * 회원가입 후 자산과 상속자를 등록하면 유언장 작성 시 자동으로 불러와짐
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Building2, Landmark, TrendingUp, Shield, Bitcoin,
  Car, Briefcase, PiggyBank, Gem, Package,
  Plus, Trash2, Edit3, Users, ChevronRight,
  Home, ArrowLeft, CheckCircle2, AlertCircle,
  ScanLine, FileText, Eye, Loader2,
} from "lucide-react";
import { Link } from "wouter";

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
  estimatedValue: "",
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

export default function AssetsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<"assets" | "heirs" | "scans">("assets");
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showHeirForm, setShowHeirForm] = useState(false);
  const [assetForm, setAssetForm] = useState(emptyAssetForm);
  const [heirForm, setHeirForm] = useState(emptyHeirForm);

  const utils = trpc.useUtils();

  // ── 재산 쿼리 ──
  const { data: assetList = [], isLoading: assetsLoading } = trpc.asset.listAssets.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: heirList = [], isLoading: heirsLoading } = trpc.asset.listHeirs.useQuery(
    undefined, { enabled: isAuthenticated }
  );

  // ── 자산증명서 스캔 ──
  const { data: scanData, isLoading: scansLoading, refetch: refetchScans } = trpc.willAuto.listAssetScans.useQuery(
    undefined, { enabled: isAuthenticated && tab === "scans" }
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
          <Link href="/write">
            <button className="btn-gold px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              유언장 작성하기
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
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
            {/* 재산 추가 버튼 */}
            <button
              onClick={() => setShowAssetForm(!showAssetForm)}
              className="w-full bg-white border-2 border-dashed border-[#C9A961]/40 rounded-2xl p-4 flex items-center justify-center gap-3 text-[#C9A961] font-semibold hover:border-[#C9A961] hover:bg-[#C9A961]/5 transition-all mb-4"
            >
              <Plus className="w-5 h-5" />
              재산 추가하기
            </button>

            {/* 재산 추가 폼 */}
            {showAssetForm && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <h3 className="font-bold text-[#1F3864] mb-4">새 재산 등록</h3>

                {/* 자산 유형 선택 */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">자산 유형</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(Object.entries(ASSET_TYPE_META) as [AssetType, typeof ASSET_TYPE_META[AssetType]][]).map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => setAssetForm(f => ({ ...f, type: key }))}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all ${
                          assetForm.type === key
                            ? "border-[#1F3864] bg-[#1F3864] text-white"
                            : `${meta.color} border`
                        }`}
                      >
                        <meta.icon className="w-4 h-4" />
                        {meta.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">자산명 *</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder={`예: ${ASSET_TYPE_META[assetForm.type].desc}`}
                      value={assetForm.name}
                      onChange={e => setAssetForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">예상 가치 (원)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder="예: 500000000"
                      value={assetForm.estimatedValue}
                      onChange={e => setAssetForm(f => ({ ...f, estimatedValue: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">국가</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      value={assetForm.country}
                      onChange={e => setAssetForm(f => ({ ...f, country: e.target.value }))}
                    >
                      <option value="KR">🇰🇷 한국</option>
                      <option value="US">🇺🇸 미국</option>
                      <option value="JP">🇯🇵 일본</option>
                      <option value="CN">🇨🇳 중국</option>
                      <option value="OTHER">기타</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">메모</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder="은행명, 계좌 메모 등 (선택)"
                      value={assetForm.description}
                      onChange={e => setAssetForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => addAsset.mutate({
                      type: assetForm.type,
                      name: assetForm.name,
                      description: assetForm.description || undefined,
                      estimatedValue: assetForm.estimatedValue ? Number(assetForm.estimatedValue) : undefined,
                      currency: assetForm.currency,
                      country: assetForm.country,
                    })}
                    disabled={!assetForm.name || addAsset.isPending}
                    className="btn-gold px-6 py-2 rounded-full text-sm font-bold disabled:opacity-50"
                  >
                    {addAsset.isPending ? "등록 중..." : "등록하기"}
                  </button>
                  <button
                    onClick={() => setShowAssetForm(false)}
                    className="px-6 py-2 rounded-full text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 재산 목록 */}
            {assetsLoading ? (
              <div className="text-center py-12 text-gray-400">불러오는 중...</div>
            ) : assetList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">아직 등록된 재산이 없습니다</p>
                <p className="text-gray-300 text-xs mt-1">위 버튼을 눌러 재산을 추가하세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assetList.map((asset) => {
                  const meta = ASSET_TYPE_META[asset.type as AssetType] ?? ASSET_TYPE_META.other;
                  return (
                    <div key={asset.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${meta.color}`}>
                        <meta.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#1F3864] text-sm truncate">{asset.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{meta.label}</span>
                          {asset.country && asset.country !== "KR" && <span>· {asset.country}</span>}
                          {asset.description && <span>· {asset.description}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {asset.estimatedValue ? (
                          <div className="font-bold text-[#C9A961] text-sm">
                            {asset.estimatedValue >= 100000000
                              ? `${(asset.estimatedValue / 100000000).toFixed(1)}억`
                              : `${(asset.estimatedValue / 10000).toFixed(0)}만원`}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-300">가치 미입력</div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteAsset.mutate({ id: asset.id })}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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
          <h3 className="text-white font-bold text-lg mb-2">재산 등록 완료 후 유언장을 작성하세요</h3>
          <p className="text-white/60 text-sm mb-4">
            등록된 재산과 상속자가 유언장 작성 시 자동으로 불러와집니다.
          </p>
          <Link href="/write">
            <button className="btn-gold px-8 py-3 rounded-full font-bold">
              AI 유언장 작성 시작 →
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
