/**
 * ExpertsSection - 홈페이지 전문가 파트너 소개 섹션
 * - 상속 카드 섹션(HeirServiceSection) 바로 아래 배치
 * - 국가별 필터 + 전문분야 필터
 * - 카드 클릭 시 상세 모달 (경력·이력·소개 표시, 연락처 비공개)
 * - "상담 신청하기" 버튼으로 EverWill 통해서만 연결
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";

// 국가 코드 → 국기 + 이름
const COUNTRY_MAP: Record<string, { flag: string; name: string }> = {
  KR: { flag: "🇰🇷", name: "한국" },
  US: { flag: "🇺🇸", name: "미국" },
  JP: { flag: "🇯🇵", name: "일본" },
  CN: { flag: "🇨🇳", name: "중국" },
  DE: { flag: "🇩🇪", name: "독일" },
  FR: { flag: "🇫🇷", name: "프랑스" },
  ES: { flag: "🇪🇸", name: "스페인" },
  SA: { flag: "🇸🇦", name: "사우디" },
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
  notary: { icon: <FileText className="w-4 h-4" />, label: "공증인", color: "bg-purple-100 text-purple-700" },
};

// 언어 코드 → 이름
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
  specialty: "lawyer" | "tax" | "notary";
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

function ExpertCard({ expert, onClick }: { expert: Expert; onClick: () => void }) {
  const country = COUNTRY_MAP[expert.country] ?? { flag: "🌐", name: expert.country };
  const spec = SPECIALTY_CONFIG[expert.specialty];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#C9A961]/40 transition-all cursor-pointer group"
    >
      {/* 사진 + 이름 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          {expert.photoUrl ? (
            <img
              src={expert.photoUrl}
              alt={expert.name}
              className="w-14 h-14 rounded-full object-cover bg-gray-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=1F3864&color=fff&size=56`;
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#1F3864] flex items-center justify-center text-white font-bold text-lg">
              {expert.name.charAt(0)}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 text-base">{country.flag}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1F3864] text-base truncate group-hover:text-[#C9A961] transition-colors">
            {expert.name}
          </h3>
          {expert.firmName && (
            <p className="text-xs text-gray-500 truncate">{expert.firmName}</p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${spec.color}`}>
              {spec.icon} {spec.label}
            </span>
          </div>
        </div>
      </div>

      {/* 전문분야 */}
      {expert.subSpecialty && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{expert.subSpecialty}</p>
      )}

      {/* 정보 */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{country.name}{expert.city ? ` · ${expert.city}` : ""}</span>
        </div>
        {expert.yearsOfExperience != null && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>경력 {expert.yearsOfExperience}년</span>
          </div>
        )}
        {expert.languages && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Languages className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {expert.languages
                .split(",")
                .map((l) => LANG_MAP[l.trim()] ?? l.trim())
                .join(" · ")}
            </span>
          </div>
        )}
      </div>

      {/* 평점 + 상담 수 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          {expert.ratingAvg != null && (
            <>
              <StarRating rating={expert.ratingAvg} />
              <span className="text-xs text-gray-500">
                {expert.ratingAvg.toFixed(1)} ({expert.reviewCount ?? 0})
              </span>
            </>
          )}
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {(expert.consultCount ?? 0).toLocaleString()}건
        </span>
      </div>
    </div>
  );
}

function ExpertDetailModal({
  expert,
  open,
  onClose,
}: {
  expert: Expert | null;
  open: boolean;
  onClose: () => void;
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

        {/* 프로필 헤더 */}
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
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${spec.color}`}>
                {spec.icon} {spec.label}
              </span>
              <span className="text-sm text-gray-500">
                {country.flag} {country.name}{expert.city ? ` · ${expert.city}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* 평점 */}
        {expert.ratingAvg != null && (
          <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <StarRating rating={expert.ratingAvg} />
            <span className="text-sm font-medium text-[#1F3864]">{expert.ratingAvg.toFixed(1)}</span>
            <span className="text-sm text-gray-500">리뷰 {expert.reviewCount ?? 0}건</span>
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-500">상담 {(expert.consultCount ?? 0).toLocaleString()}건</span>
          </div>
        )}

        {/* 상세 정보 */}
        <div className="space-y-4">
          {/* 경력 */}
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

          {/* 전문분야 */}
          {expert.subSpecialty && (
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-1">전문 분야</p>
              <p className="text-sm text-gray-600">{expert.subSpecialty}</p>
            </div>
          )}

          {/* 자기소개 */}
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

        {/* 상담 신청 버튼 (연락처 비공개 - EverWill 통해서만) */}
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
              window.location.href = "/dashboard/find-expert";
            }}
          >
            상담 신청하기 <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ExpertsSection() {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<"all" | "lawyer" | "tax" | "notary">("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: countries } = trpc.expert.getCountries.useQuery();
  const { data, isLoading } = trpc.expert.list.useQuery({
    country: selectedCountry === "all" ? undefined : selectedCountry,
    specialty: selectedSpecialty,
    search: search || undefined,
    limit: 12,
    offset: 0,
  });

  const experts = data?.experts ?? [];
  const total = data?.total ?? 0;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <Badge className="bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/20 mb-4 px-4 py-1">
            EverWill 파트너 전문가 그룹
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-4">
            상속 전문가와 함께하세요
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            전 세계 EverWill 인증 파트너 변호사·세무사·공증인이 여러분의 상속을 도와드립니다.
            <br />
            국가와 지역에 맞는 전문가를 찾아보세요.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Users className="w-4 h-4 text-[#C9A961]" />
            <span className="text-sm text-gray-500">현재 {total}명의 파트너 전문가가 활동 중</span>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          {/* 검색 */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
              placeholder="이름, 전문분야, 도시 검색"
              className="pl-9"
            />
          </div>

          {/* 국가 필터 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCountry("all")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCountry === "all"
                  ? "bg-[#1F3864] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            {(countries ?? []).map((c) => {
              const info = COUNTRY_MAP[c];
              if (!info) return null;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCountry(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCountry === c
                      ? "bg-[#1F3864] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {info.flag} {info.name}
                </button>
              );
            })}
          </div>

          {/* 전문분야 필터 */}
          <div className="flex gap-2">
            {(["all", "lawyer", "tax", "notary"] as const).map((sp) => (
              <button
                key={sp}
                onClick={() => setSelectedSpecialty(sp)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedSpecialty === sp
                    ? "bg-[#C9A961] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {sp === "all" ? "전체" : SPECIALTY_CONFIG[sp].label}
              </button>
            ))}
          </div>
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
            {experts.map((expert) => (
              <ExpertCard
                key={expert.id}
                expert={expert as Expert}
                onClick={() => {
                  setSelectedExpert(expert as Expert);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* 파트너 가입 CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#1F3864] to-[#2a4a7f] rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">전문가이신가요?</h3>
          <p className="text-white/80 mb-5 text-sm">
            EverWill 파트너로 가입하면 전 세계 고객에게 프로필이 노출됩니다.
            <br />
            연 $99로 글로벌 상속 전문가로 활동하세요.
          </p>
          <Button
            onClick={() => (window.location.href = "/partner/expert")}
            className="bg-[#C9A961] hover:bg-[#C9A961]/90 text-white px-8"
          >
            파트너 신청하기 <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* 상세 모달 */}
      <ExpertDetailModal
        expert={selectedExpert}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
