/**
 * FindExpert - 대시보드 전문가 찾기 페이지 (/dashboard/find-expert)
 * - 로그인 사용자 전용
 * - 국가·도시·전문분야·언어 필터
 * - 카드 클릭 → 상세 모달 (경력·이력·소개, 연락처 비공개)
 * - "상담 신청하기" → 문의 폼으로 연결
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Scale,
  Calculator,
  FileText,
  Star,
  MapPin,
  Clock,
  Languages,
  MessageSquare,
  ChevronRight,
  Search,
  Users,
  ArrowLeft,
  Send,
} from "lucide-react";
import { toast } from "sonner";

// 국가 코드 → 국기 + 이름
const COUNTRY_MAP: Record<string, { flag: string; name: string }> = {
  KR: { flag: "🇰🇷", name: "대한민국" },
  US: { flag: "🇺🇸", name: "미국" },
  JP: { flag: "🇯🇵", name: "일본" },
  CN: { flag: "🇨🇳", name: "중국" },
  DE: { flag: "🇩🇪", name: "독일" },
  FR: { flag: "🇫🇷", name: "프랑스" },
  ES: { flag: "🇪🇸", name: "스페인" },
  SA: { flag: "🇸🇦", name: "사우디아라비아" },
  IN: { flag: "🇮🇳", name: "인도" },
  BR: { flag: "🇧🇷", name: "브라질" },
  GB: { flag: "🇬🇧", name: "영국" },
  AU: { flag: "🇦🇺", name: "호주" },
  CA: { flag: "🇨🇦", name: "캐나다" },
  SG: { flag: "🇸🇬", name: "싱가포르" },
};

const SPECIALTY_CONFIG = {
  lawyer: { icon: <Scale className="w-4 h-4" />, label: "변호사", color: "bg-blue-100 text-blue-700" },
  tax: { icon: <Calculator className="w-4 h-4" />, label: "세무사", color: "bg-green-100 text-green-700" },

};

const LANG_MAP: Record<string, string> = {
  ko: "한국어", en: "English", ja: "日本語", zh: "中文",
  de: "Deutsch", fr: "Français", es: "Español", ar: "العربية",
  hi: "हिन्दी", pt: "Português", ru: "Русский", gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ", ta: "தமிழ்", te: "తెలుగు", bn: "বাংলা",
  mr: "मराठी", ur: "اردو",
};

type Expert = {
  id: number;
  name: string;
  nameEn: string | null;
  specialty: "lawyer" | "tax";
  subSpecialty: string | null;
  country: string;
  city: string | null;
  firmName: string | null;
  bio: string | null;
  bioEn: string | null;
  yearsOfExperience: number | null;
  languages: string | null;
  photoUrl: string | null;
  ratingAvg: number | null;
  reviewCount: number | null;
  consultCount: number | null;
  isSample: number | null;
  createdAt: Date | null;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "fill-[#C9A961] text-[#C9A961]" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

// 상담 신청 모달 (자기소개서 포함)
function ConsultModal({
  expert,
  open,
  onClose,
}: {
  expert: Expert | null;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    consultType: "inheritance" as "inheritance" | "will" | "tax" | "dispute" | "other",
    selfIntro: "",
    assetScale: "unknown" as "under_100m" | "100m_500m" | "500m_1b" | "over_1b" | "unknown",
    urgency: "normal" as "normal" | "urgent",
  });

  // 사용자 정보 자동 채움
  useState(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        applicantName: user.name ?? "",
        applicantEmail: user.email ?? "",
      }));
    }
  });

  const submitMutation = trpc.consultation.submit.useMutation({
    onSuccess: () => {
      toast.success("상담 신청이 접수되었습니다! EverWill 운영팀이 전문가에게 전달합니다.");
      setForm({ applicantName: "", applicantEmail: "", applicantPhone: "", consultType: "inheritance", selfIntro: "", assetScale: "unknown", urgency: "normal" });
      onClose();
    },
    onError: (err) => toast.error("신청 실패: " + err.message),
  });

  if (!expert) return null;

  const CONSULT_TYPES = [
    { value: "inheritance", label: "상속 전반" },
    { value: "will", label: "유언장 작성" },
    { value: "tax", label: "상속세·증여세" },
    { value: "dispute", label: "상속 분쟁" },
    { value: "other", label: "기타" },
  ];

  const ASSET_SCALES = [
    { value: "unknown", label: "모름 / 비공개" },
    { value: "under_100m", label: "1억 미만" },
    { value: "100m_500m", label: "1억 ~ 5억" },
    { value: "500m_1b", label: "5억 ~ 10억" },
    { value: "over_1b", label: "10억 이상" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1F3864]">상담 신청서</DialogTitle>
        </DialogHeader>

        {/* 전문가 정보 */}
        <div className="flex items-center gap-3 p-3 bg-[#1F3864]/5 rounded-xl mb-2">
          <div className="w-10 h-10 rounded-full bg-[#1F3864] flex items-center justify-center text-white font-bold flex-shrink-0">
            {expert.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-[#1F3864] text-sm">{expert.name}</p>
            <p className="text-xs text-gray-500">
              {SPECIALTY_CONFIG[expert.specialty].label} · {COUNTRY_MAP[expert.country]?.name ?? expert.country}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* 신청자 이름 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">성함 <span className="text-red-500">*</span></label>
            <Input
              value={form.applicantName}
              onChange={(e) => setForm((f) => ({ ...f, applicantName: e.target.value }))}
              placeholder="홍길동"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 이메일 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">이메일</label>
              <Input
                value={form.applicantEmail}
                onChange={(e) => setForm((f) => ({ ...f, applicantEmail: e.target.value }))}
                placeholder="example@email.com"
                type="email"
              />
            </div>
            {/* 전화번호 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">연락처</label>
              <Input
                value={form.applicantPhone}
                onChange={(e) => setForm((f) => ({ ...f, applicantPhone: e.target.value }))}
                placeholder="010-0000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 상담 유형 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">상담 유형 <span className="text-red-500">*</span></label>
              <Select value={form.consultType} onValueChange={(v) => setForm((f) => ({ ...f, consultType: v as typeof f.consultType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONSULT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* 자산 규모 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">자산 규모 (선택)</label>
              <Select value={form.assetScale} onValueChange={(v) => setForm((f) => ({ ...f, assetScale: v as typeof f.assetScale }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSET_SCALES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 자기소개 및 상담 내용 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              자기소개 및 상담 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.selfIntro}
              onChange={(e) => setForm((f) => ({ ...f, selfIntro: e.target.value }))}
              placeholder={`간단한 자기소개와 상담하고 싶은 내용을 작성해 주세요.\n\n예)\n- 거주 국가: 한국\n- 자산 현황: 서울 아파트 1채, 미국 주식 계좌\n- 상담 내용: 자녀 2명에게 균등 상속 방법 및 절세 방안 문의`}
              rows={6}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20"
            />
            <p className="text-xs text-gray-400 mt-1">{form.selfIntro.length} / 2000자</p>
          </div>

          {/* 긴급 여부 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">긴급 상담</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, urgency: f.urgency === "urgent" ? "normal" : "urgent" }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.urgency === "urgent" ? "bg-red-500" : "bg-gray-200"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.urgency === "urgent" ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
            {form.urgency === "urgent" && (
              <span className="text-xs text-red-500 font-medium">긴급 처리 요청</span>
            )}
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 mt-2">
          📌 상담 신청 후 EverWill 운영팀이 전문가에게 전달합니다. 영업일 기준 1-2일 내 연락드립니다.
          <br />연락처는 EverWill을 통해서만 안전하게 전달됩니다.
        </div>

        <Button
          onClick={() => {
            if (!form.applicantName.trim()) return toast.error("성함을 입력해 주세요.");
            if (!form.selfIntro.trim() || form.selfIntro.length < 10) return toast.error("상담 내용을 10자 이상 입력해 주세요.");
            submitMutation.mutate({
              expertId: expert.id,
              applicantName: form.applicantName,
              applicantEmail: form.applicantEmail || undefined,
              applicantPhone: form.applicantPhone || undefined,
              consultType: form.consultType,
              selfIntro: form.selfIntro,
              assetScale: form.assetScale,
              urgency: form.urgency,
            });
          }}
          disabled={submitMutation.isPending}
          className="w-full bg-[#1F3864] hover:bg-[#1F3864]/90 text-white mt-2"
        >
          <Send className="w-4 h-4 mr-2" />
          {submitMutation.isPending ? "신청 중..." : "상담 신청서 제출"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// 전문가 상세 모달
function ExpertDetailModal({
  expert,
  open,
  onClose,
  onConsult,
}: {
  expert: Expert | null;
  open: boolean;
  onClose: () => void;
  onConsult: () => void;
}) {
  if (!expert) return null;
  const country = COUNTRY_MAP[expert.country] ?? { flag: "🌐", name: expert.country };
  const spec = SPECIALTY_CONFIG[expert.specialty];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1F3864]">전문가 상세 프로필</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
          {expert.photoUrl ? (
            <img
              src={expert.photoUrl}
              alt={expert.name}
              className="w-20 h-20 rounded-full object-cover bg-gray-100 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=1F3864&color=fff&size=80`;
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#1F3864] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {expert.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-[#1F3864]">{expert.name}</h3>
            {expert.nameEn && <p className="text-sm text-gray-500">{expert.nameEn}</p>}
            {expert.firmName && <p className="text-sm text-gray-600 mt-0.5">{expert.firmName}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${spec.color}`}>
                {spec.icon} {spec.label}
              </span>
              <span className="text-sm text-gray-500">
                {country.flag} {country.name}{expert.city ? ` · ${expert.city}` : ""}
              </span>
            </div>
          </div>
        </div>

        {expert.ratingAvg != null && (
          <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <StarRating rating={expert.ratingAvg} />
            <span className="text-sm font-medium text-[#1F3864]">{expert.ratingAvg.toFixed(1)}</span>
            <span className="text-sm text-gray-500">리뷰 {expert.reviewCount ?? 0}건</span>
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-500">상담 {(expert.consultCount ?? 0).toLocaleString()}건</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {expert.yearsOfExperience != null && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">경력</p>
                <p className="font-bold text-[#1F3864]">{expert.yearsOfExperience}년</p>
              </div>
            )}
            {expert.languages && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">사용 언어</p>
                <p className="font-medium text-[#1F3864] text-sm">
                  {expert.languages
                    .split(",")
                    .map((l) => LANG_MAP[l.trim()] ?? l.trim())
                    .join(", ")}
                </p>
              </div>
            )}
          </div>

          {expert.subSpecialty && (
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-1">전문 분야</p>
              <p className="text-sm text-gray-600">{expert.subSpecialty}</p>
            </div>
          )}

          {expert.bio && (
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-1">소개 및 이력</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{expert.bio}</p>
            </div>
          )}
          {expert.bioEn && (
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-1">Introduction (English)</p>
              <p className="text-sm text-gray-600 leading-relaxed">{expert.bioEn}</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="bg-[#1F3864]/5 rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-500 text-center">
              📌 전문가 연락처는 개인정보 보호를 위해 비공개입니다.
              <br />
              EverWill을 통해 안전하게 상담을 신청하세요.
            </p>
          </div>
          <Button
            className="w-full bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
            onClick={() => {
              onClose();
              onConsult();
            }}
          >
            상담 신청하기 <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FindExpert() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<"all" | "lawyer" | "tax">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [consultTarget, setConsultTarget] = useState<Expert | null>(null);

  const LIMIT = 12;

  const { data: countries } = trpc.expert.getCountries.useQuery();
  const { data, isLoading } = trpc.expert.list.useQuery({
    country: selectedCountry === "all" ? undefined : selectedCountry,
    specialty: selectedSpecialty,
    search: search || undefined,
    limit: LIMIT,
    offset: page * LIMIT,
  });

  const experts = data?.experts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-[#1F3864] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-gray-600">로그인 후 전문가 찾기를 이용할 수 있습니다.</p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
        >
          로그인하기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-[#1F3864] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#1F3864]">전문가 찾기</h1>
            <p className="text-xs text-gray-500">나에게 맞는 상속 전문가를 찾아보세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 통계 배너 */}
        <div className="bg-gradient-to-r from-[#1F3864] to-[#2a4a7f] rounded-2xl p-5 mb-6 text-white flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">현재 활동 중인 파트너 전문가</p>
            <p className="text-3xl font-bold">{total.toLocaleString()}명</p>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{(countries ?? []).length}</p>
              <p className="text-white/70 text-xs">국가</p>
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-white/70 text-xs">전문분야</p>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-3 items-center">
            {/* 검색 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearch(searchInput);
                    setPage(0);
                  }
                }}
                placeholder="이름, 전문분야, 도시 검색..."
                className="pl-9"
              />
            </div>

            {/* 국가 */}
            <Select
              value={selectedCountry}
              onValueChange={(v) => {
                setSelectedCountry(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="국가 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌐 전체 국가</SelectItem>
                {(countries ?? []).map((c) => {
                  const info = COUNTRY_MAP[c];
                  return (
                    <SelectItem key={c} value={c}>
                      {info ? `${info.flag} ${info.name}` : c}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* 전문분야 */}
            <Select
              value={selectedSpecialty}
              onValueChange={(v) => {
                setSelectedSpecialty(v as "all" | "lawyer" | "tax");
                setPage(0);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="전문분야" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="lawyer">⚖️ 변호사</SelectItem>
                <SelectItem value="tax">🧮 세무사</SelectItem>

              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setSearch(searchInput);
                setPage(0);
              }}
              className="bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
            >
              검색
            </Button>
          </div>
        </div>

        {/* 결과 카운트 */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            총 <span className="font-semibold text-[#1F3864]">{total}</span>명의 전문가
          </p>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(0);
              }}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              검색 초기화
            </button>
          )}
        </div>

        {/* 카드 그리드 */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>해당 조건의 전문가가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {experts.map((expert) => {
              const country = COUNTRY_MAP[expert.country] ?? { flag: "🌐", name: expert.country };
              const spec = SPECIALTY_CONFIG[expert.specialty];
              return (
                <div
                  key={expert.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#C9A961]/40 transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedExpert(expert as Expert);
                    setDetailOpen(true);
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      {expert.photoUrl ? (
                        <img
                          src={expert.photoUrl}
                          alt={expert.name}
                          className="w-12 h-12 rounded-full object-cover bg-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=1F3864&color=fff&size=48`;
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#1F3864] flex items-center justify-center text-white font-bold">
                          {expert.name.charAt(0)}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 text-sm">{country.flag}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1F3864] text-sm truncate group-hover:text-[#C9A961] transition-colors">
                        {expert.name}
                      </h3>
                      {expert.firmName && (
                        <p className="text-xs text-gray-400 truncate">{expert.firmName}</p>
                      )}
                      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium mt-1 ${spec.color}`}>
                        {spec.icon} {spec.label}
                      </span>
                    </div>
                  </div>

                  {expert.subSpecialty && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{expert.subSpecialty}</p>
                  )}

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {country.name}{expert.city ? ` · ${expert.city}` : ""}
                    </div>
                    {expert.yearsOfExperience != null && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        경력 {expert.yearsOfExperience}년
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    {expert.ratingAvg != null && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#C9A961] text-[#C9A961]" />
                        <span className="text-xs text-gray-500">{expert.ratingAvg.toFixed(1)}</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="text-xs h-7 bg-[#1F3864] hover:bg-[#1F3864]/90 text-white px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConsultTarget(expert as Expert);
                        setConsultOpen(true);
                      }}
                    >
                      상담 신청
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </Button>
            <span className="text-sm text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        )}

        {/* 파트너 가입 CTA */}
        <div className="mt-10 bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
          <p className="text-[#1F3864] font-semibold mb-1">전문가이신가요?</p>
          <p className="text-sm text-gray-500 mb-3">
            EverWill 파트너로 가입하면 전 세계 고객에게 프로필이 노출됩니다.
          </p>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/partner/expert")}
            className="border-[#1F3864] text-[#1F3864] hover:bg-[#1F3864] hover:text-white"
          >
            파트너 신청하기 <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* 상세 모달 */}
      <ExpertDetailModal
        expert={selectedExpert}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onConsult={() => {
          setConsultTarget(selectedExpert);
          setConsultOpen(true);
        }}
      />

      {/* 상담 신청 모달 */}
      <ConsultModal
        expert={consultTarget}
        open={consultOpen}
        onClose={() => setConsultOpen(false)}
      />
    </div>
  );
}
