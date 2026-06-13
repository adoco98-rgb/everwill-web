/**
 * 전문가 파트너 가입 페이지 (/partner/expert)
 * - 변호사·세무사·공증인 파트너 신청
 * - 연 $99 멤버십 (현재는 신청 접수 후 관리자 승인)
 * - 승인 후 홈페이지 + 대시보드에 프로필 노출
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Scale, Calculator, FileText, CheckCircle, Globe, Users, Star, ArrowRight } from "lucide-react";

const COUNTRY_LIST = [
  { code: "KR", label: "🇰🇷 대한민국" },
  { code: "US", label: "🇺🇸 미국" },
  { code: "JP", label: "🇯🇵 일본" },
  { code: "CN", label: "🇨🇳 중국" },
  { code: "DE", label: "🇩🇪 독일" },
  { code: "FR", label: "🇫🇷 프랑스" },
  { code: "ES", label: "🇪🇸 스페인" },
  { code: "SA", label: "🇸🇦 사우디아라비아" },
  { code: "IN", label: "🇮🇳 인도" },
  { code: "BR", label: "🇧🇷 브라질" },
  { code: "GB", label: "🇬🇧 영국" },
  { code: "AU", label: "🇦🇺 호주" },
  { code: "CA", label: "🇨🇦 캐나다" },
  { code: "SG", label: "🇸🇬 싱가포르" },
];

const SPECIALTY_ICONS: Record<string, React.ReactNode> = {
  lawyer: <Scale className="w-6 h-6" />,
  tax: <Calculator className="w-6 h-6" />,

};

const SPECIALTY_LABELS: Record<string, string> = {
  lawyer: "상속 전문 변호사",
  tax: "상속 전문 세무사",

};

export default function PartnerExpert() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<"intro" | "form" | "done">("intro");
  const [specialty, setSpecialty] = useState<"lawyer" | "tax">("lawyer");
  const [form, setForm] = useState({
    name: "",
    nameEn: "",
    subSpecialty: "",
    country: "KR",
    city: "",
    firmName: "",
    bio: "",
    bioEn: "",
    yearsOfExperience: 10,
    languages: "",
    email: user?.email || "",
    phone: "",
    website: "",
    licenseNumber: "",
  });

  const { data: myStatus } = trpc.expert.myStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const applyMutation = trpc.expert.applyPartner.useMutation({
    onSuccess: () => {
      setStep("done");
    },
    onError: (err) => {
      toast.error("신청 실패: " + err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    applyMutation.mutate({ ...form, specialty });
  };

  // 이미 신청한 경우
  if (myStatus) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#1F3864]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#1F3864]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F3864] mb-3">신청이 접수되었습니다</h2>
          <p className="text-gray-600 mb-4">
            현재 상태:{" "}
            <Badge
              className={
                myStatus.status === "active"
                  ? "bg-green-100 text-green-700"
                  : myStatus.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }
            >
              {myStatus.status === "active"
                ? "승인됨"
                : myStatus.status === "pending"
                ? "검토 중"
                : myStatus.status === "rejected"
                ? "반려됨"
                : "정지됨"}
            </Badge>
          </p>
          {myStatus.adminNote && (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">
              관리자 메모: {myStatus.adminNote}
            </p>
          )}
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F3864] mb-3">신청이 완료되었습니다!</h2>
          <p className="text-gray-600 mb-2">
            파트너 신청이 접수되었습니다. 영업일 기준 2-3일 내에 검토 후 결과를 이메일로 안내드립니다.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            승인 후 연 $99 파트너십 비용이 청구됩니다.
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        {/* 헤더 */}
        <div className="bg-[#1F3864] text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-[#C9A961] text-white mb-4 text-sm px-4 py-1">
              EverWill 파트너 프로그램
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              전문가 파트너로 함께하세요
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              상속 전문 변호사·세무사를 위한 글로벌 파트너십.
              <br />
              EverWill 플랫폼을 통해 전 세계 고객과 연결되세요.
            </p>
          </div>
        </div>

        {/* 혜택 */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-[#1F3864] text-center mb-10">파트너 혜택</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Globe className="w-8 h-8 text-[#C9A961]" />,
                title: "글로벌 노출",
                desc: "전 세계 EverWill 사용자에게 프로필이 노출됩니다. 국가·지역별 검색에서 상위 노출.",
              },
              {
                icon: <Users className="w-8 h-8 text-[#C9A961]" />,
                title: "검증된 고객 연결",
                desc: "유언 작성을 완료한 실제 상속 니즈가 있는 고객과 연결됩니다. 콜드 영업 불필요.",
              },
              {
                icon: <Star className="w-8 h-8 text-[#C9A961]" />,
                title: "신뢰 배지 부여",
                desc: "EverWill 인증 파트너 배지가 프로필에 표시됩니다. 고객 신뢰도 향상.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-[#1F3864]/5 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#1F3864] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* 전문분야 선택 */}
          <h2 className="text-2xl font-bold text-[#1F3864] text-center mb-6">전문분야 선택</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-10 max-w-xl mx-auto">
            {(["lawyer", "tax"] as const).map((sp) => (
              <button
                key={sp}
                onClick={() => {
                  setSpecialty(sp);
                  setStep("form");
                }}
                className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-[#C9A961] hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-[#1F3864]/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#C9A961]/10 transition-colors">
                  <span className="text-[#1F3864] group-hover:text-[#C9A961] transition-colors">
                    {SPECIALTY_ICONS[sp]}
                  </span>
                </div>
                <h3 className="font-bold text-[#1F3864] mb-1">{SPECIALTY_LABELS[sp]}</h3>
                <p className="text-sm text-gray-500">
                  {sp === "lawyer"
                    ? "상속 소송·집행 전문 변호사"
                    : sp === "tax"
                    ? "상속세·증여세 전문 세무사"
                    : ""
                    }
                </p>
                <div className="flex items-center gap-1 mt-3 text-[#C9A961] text-sm font-medium">
                  신청하기 <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          {/* 비용 안내 */}
          <div className="bg-[#1F3864]/5 rounded-2xl p-6 text-center">
            <p className="text-[#1F3864] font-bold text-lg mb-1">연 파트너십 비용: $99 USD</p>
            <p className="text-sm text-gray-600">
              승인 후 청구됩니다. 언제든지 해지 가능.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 신청 폼
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setStep("intro")}
          className="text-sm text-gray-500 hover:text-[#1F3864] mb-6 flex items-center gap-1"
        >
          ← 뒤로
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#1F3864]/5 rounded-xl flex items-center justify-center text-[#1F3864]">
              {SPECIALTY_ICONS[specialty]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1F3864]">
                {SPECIALTY_LABELS[specialty]} 파트너 신청
              </h2>
              <p className="text-sm text-gray-500">모든 정보는 관리자 검토 후 노출됩니다</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이름 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  이름 (한국어/현지어) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="홍길동"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  이름 (영문)
                </label>
                <Input
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  placeholder="Hong Gil-dong"
                />
              </div>
            </div>

            {/* 국가·도시 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  국가 <span className="text-red-500">*</span>
                </label>
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_LIST.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">도시</label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="서울"
                />
              </div>
            </div>

            {/* 소속 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">소속 (법무법인·세무법인·사무소)</label>
              <Input
                value={form.firmName}
                onChange={(e) => setForm({ ...form, firmName: e.target.value })}
                placeholder="법무법인 에버"
              />
            </div>

            {/* 전문분야 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">세부 전문분야</label>
              <Input
                value={form.subSpecialty}
                onChange={(e) => setForm({ ...form, subSpecialty: e.target.value })}
                placeholder="예: 상속 분쟁, 국제 상속, 상속세 절세"
              />
            </div>

            {/* 경력 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">경력 (년)</label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={form.yearsOfExperience}
                  onChange={(e) => setForm({ ...form, yearsOfExperience: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">사용 언어 (쉼표 구분)</label>
                <Input
                  value={form.languages}
                  onChange={(e) => setForm({ ...form, languages: e.target.value })}
                  placeholder="ko,en,ja"
                />
              </div>
            </div>

            {/* 자기소개 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                자기소개 (한국어/현지어) <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="학력, 경력, 전문 분야, 처리 사건 수 등을 간략히 소개해 주세요."
                rows={4}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">자기소개 (영문)</label>
              <Textarea
                value={form.bioEn}
                onChange={(e) => setForm({ ...form, bioEn: e.target.value })}
                placeholder="Brief introduction in English (optional)"
                rows={3}
              />
            </div>

            {/* 자격증 번호 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">자격증 번호 (선택)</label>
              <Input
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                placeholder="변호사 등록번호 또는 세무사 등록번호"
              />
            </div>

            {/* 연락처 (관리자만 볼 수 있음) */}
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm font-medium text-amber-800 mb-3">
                📌 연락처 정보 (관리자만 볼 수 있습니다. 고객에게는 공개되지 않습니다.)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@law.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">전화번호</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+82-10-0000-0000"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="text-sm font-medium text-gray-700 mb-1 block">웹사이트</label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://www.lawfirm.com"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={applyMutation.isPending || !isAuthenticated}
              className="w-full bg-[#1F3864] hover:bg-[#1F3864]/90 text-white py-3 text-base font-semibold"
            >
              {!isAuthenticated
                ? "로그인 후 신청 가능합니다"
                : applyMutation.isPending
                ? "신청 중..."
                : "파트너 신청하기"}
            </Button>

            {!isAuthenticated && (
              <p className="text-center text-sm text-gray-500">
                <a href={getLoginUrl()} className="text-[#C9A961] underline">
                  로그인
                </a>
                하고 파트너 신청을 완료하세요.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
