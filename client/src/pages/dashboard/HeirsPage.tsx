import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Users, Plus, Trash2, Edit2, Save, X, Phone, MapPin,
  User, Crown, MessageSquare, ChevronDown, ChevronUp,
  Heart, Building2
} from "lucide-react";

/**
 * 상속자 등록 페이지
 * - 제1상속자부터 순서대로 등록
 * - 자산 분배 비율(%) 또는 금액(₩) 입력
 * - 제1상속자 SMS 알림 동의
 */

// 관계 목록
const RELATIONSHIP_LABELS: Record<string, string> = {
  spouse: "배우자",
  child: "자녀",
  parent: "부모",
  sibling: "형제자매",
  grandchild: "손자녀",
  other: "기타",
};

type Heir = {
  id: number;
  userId: number;
  priority: number;
  nameKo: string;
  nameEn: string | null;
  relationship: string;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  address: string | null;
  shareType: string | null;
  sharePercent: number | null;
  shareAmount: number | null;
  smsConsent: number | null;
  smsSent: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type HeirFormData = {
  nameKo: string;
  nameEn: string;
  relationship: string;
  birthDate: string;
  phone: string;
  email: string;
  country: string;
  address: string;
  shareType: "percent" | "amount";
  sharePercent: number;
  shareAmount: number;
  smsConsent: number;
};

const defaultForm: HeirFormData = {
  nameKo: "",
  nameEn: "",
  relationship: "child",
  birthDate: "",
  phone: "",
  email: "",
  country: "KR",
  address: "",
  shareType: "percent",
  sharePercent: 0,
  shareAmount: 0,
  smsConsent: 0,
};

export default function HeirsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<HeirFormData>(defaultForm);
  const [editForm, setEditForm] = useState<HeirFormData>(defaultForm);

  const { data: heirs = [], refetch } = trpc.heirs.getMyHeirs.useQuery();

  const addMutation = trpc.heirs.addHeir.useMutation({
    onSuccess: () => {
      toast.success("상속자가 등록되었습니다.");
      setShowAddForm(false);
      setForm(defaultForm);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.heirs.updateHeir.useMutation({
    onSuccess: () => {
      toast.success("상속자 정보가 수정되었습니다.");
      setEditingId(null);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.heirs.deleteHeir.useMutation({
    onSuccess: () => {
      toast.success("상속자가 삭제되었습니다.");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAdd = () => {
    if (!form.nameKo.trim()) return toast.error("이름을 입력해주세요");
    if (!form.relationship) return toast.error("관계를 선택해주세요");
    addMutation.mutate({
      ...form,
      relationship: form.relationship as "spouse" | "child" | "parent" | "sibling" | "grandchild" | "other",
      sharePercent: Number(form.sharePercent),
      shareAmount: Number(form.shareAmount),
    });
  };

  const handleEdit = (heir: Heir) => {
    setEditingId(heir.id);
    setEditForm({
      nameKo: heir.nameKo,
      nameEn: heir.nameEn ?? "",
      relationship: heir.relationship,
      birthDate: heir.birthDate ?? "",
      phone: heir.phone ?? "",
      email: heir.email ?? "",
      country: heir.country ?? "KR",
      address: heir.address ?? "",
      shareType: (heir.shareType as "percent" | "amount") ?? "percent",
      sharePercent: heir.sharePercent ?? 0,
      shareAmount: heir.shareAmount ?? 0,
      smsConsent: heir.smsConsent ?? 0,
    });
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({
      id,
      ...editForm,
      relationship: editForm.relationship as "spouse" | "child" | "parent" | "sibling" | "grandchild" | "other",
      sharePercent: Number(editForm.sharePercent),
      shareAmount: Number(editForm.shareAmount),
    });
  };

  // 총 분배 비율 계산
  const totalPercent = heirs
    .filter((h) => h.shareType === "percent")
    .reduce((sum, h) => sum + (h.sharePercent ?? 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864] flex items-center gap-2">
            <Users className="w-6 h-6" />
            상속자 등록
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            제1상속자부터 순서대로 등록하세요. 유언 완료 후 자동으로 알림이 발송됩니다.
          </p>
        </div>
        <Button
          onClick={() => { setShowAddForm(true); setEditingId(null); }}
          className="bg-[#1F3864] hover:bg-[#162a4e] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          상속자 추가
        </Button>
      </div>

      {/* 분배 현황 요약 */}
      {heirs.length > 0 && (
        <div className="bg-[#1F3864]/5 border border-[#1F3864]/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="text-sm text-[#1F3864] font-medium">
            총 {heirs.length}명 등록됨
          </div>
          <div className="text-sm">
            비율 분배 합계:{" "}
            <span className={totalPercent > 100 ? "text-red-500 font-bold" : totalPercent === 100 ? "text-green-600 font-bold" : "text-[#C9A961] font-bold"}>
              {totalPercent}%
            </span>
            {totalPercent > 100 && <span className="text-red-500 ml-1">(100% 초과!)</span>}
            {totalPercent === 100 && <span className="text-green-600 ml-1">✓ 완료</span>}
          </div>
        </div>
      )}

      {/* 상속자 목록 */}
      <div className="space-y-4 mb-6">
        {heirs.length === 0 && !showAddForm && (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">아직 등록된 상속자가 없습니다.</p>
            <p className="text-xs mt-1">상속자 추가 버튼을 클릭하여 등록하세요.</p>
          </div>
        )}

        {(heirs as Heir[]).map((heir) => (
          <Card key={heir.id} className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {heir.priority === 1 && (
                    <Crown className="w-4 h-4 text-[#C9A961]" />
                  )}
                  <Badge
                    variant="outline"
                    className={heir.priority === 1 ? "border-[#C9A961] text-[#C9A961]" : "border-gray-300 text-gray-500"}
                  >
                    제{heir.priority}상속자
                  </Badge>
                  <CardTitle className="text-base font-semibold text-[#1F3864]">
                    {heir.nameKo}
                    {heir.nameEn && <span className="text-gray-400 text-sm ml-1">({heir.nameEn})</span>}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {RELATIONSHIP_LABELS[heir.relationship] ?? heir.relationship}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(heir)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-[#1F3864]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate({ id: heir.id })}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {editingId === heir.id ? (
                <HeirForm
                  form={editForm}
                  setForm={setEditForm}
                  isFirst={heir.priority === 1}
                  onSave={() => handleUpdate(heir.id)}
                  onCancel={() => setEditingId(null)}
                  isSaving={updateMutation.isPending}
                  isEdit
                />
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                  {heir.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {heir.phone}
                    </div>
                  )}
                  {heir.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {heir.address}
                    </div>
                  )}
                  {heir.birthDate && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {heir.birthDate}
                    </div>
                  )}
                  <div className="flex items-center gap-1 font-medium text-[#1F3864]">
                    {heir.shareType === "percent"
                      ? `분배 비율: ${heir.sharePercent}%`
                      : `분배 금액: ₩${(heir.shareAmount ?? 0).toLocaleString()}`}
                  </div>
                  {heir.priority === 1 && (
                    <div className="flex items-center gap-1 col-span-2">
                      <MessageSquare className="w-3 h-3" />
                      <span className={heir.smsConsent ? "text-green-600" : "text-gray-400"}>
                        SMS 알림: {heir.smsConsent ? "동의" : "미동의"}
                        {heir.smsSent ? " (발송완료)" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 상속자 추가 폼 */}
      {showAddForm && (
        <Card className="border-2 border-[#C9A961]/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-base text-[#1F3864] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              새 상속자 등록 (제{heirs.length + 1}상속자)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HeirForm
              form={form}
              setForm={setForm}
              isFirst={heirs.length === 0}
              onSave={handleAdd}
              onCancel={() => { setShowAddForm(false); setForm(defaultForm); }}
              isSaving={addMutation.isPending}
            />
          </CardContent>
        </Card>
      )}
      {/* ── 사회기부 유언 섹션 ── */}
      <CharitySection />
    </div>
  );
}

/** 상속자 입력 폼 컴포넌트 */
function HeirForm({
  form,
  setForm,
  isFirst,
  onSave,
  onCancel,
  isSaving,
  isEdit = false,
}: {
  form: HeirFormData;
  setForm: (f: HeirFormData) => void;
  isFirst: boolean;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEdit?: boolean;
}) {
  const update = (key: keyof HeirFormData, value: string | number) =>
    setForm({ ...form, [key]: value });

  return (
    <div className="space-y-4">
      {/* 이름 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium text-gray-600 mb-1 block">이름 (한국어) *</Label>
          <Input
            placeholder="홍길동"
            value={form.nameKo}
            onChange={(e) => update("nameKo", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600 mb-1 block">이름 (영문)</Label>
          <Input
            placeholder="Hong Gil-dong"
            value={form.nameEn}
            onChange={(e) => update("nameEn", e.target.value)}
          />
        </div>
      </div>

      {/* 관계 + 생년월일 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium text-gray-600 mb-1 block">유언자와의 관계 *</Label>
          <Select value={form.relationship} onValueChange={(v) => update("relationship", v)}>
            <SelectTrigger>
              <SelectValue placeholder="관계 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spouse">배우자</SelectItem>
              <SelectItem value="child">자녀</SelectItem>
              <SelectItem value="parent">부모</SelectItem>
              <SelectItem value="sibling">형제자매</SelectItem>
              <SelectItem value="grandchild">손자녀</SelectItem>
              <SelectItem value="other">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600 mb-1 block">생년월일</Label>
          <Input
            type="date"
            value={form.birthDate}
            onChange={(e) => update("birthDate", e.target.value)}
          />
        </div>
      </div>

      {/* 전화번호 + 이메일 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium text-gray-600 mb-1 block">휴대폰 번호</Label>
          <Input
            placeholder="01012345678"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600 mb-1 block">이메일</Label>
          <Input
            type="email"
            placeholder="heir@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>

      {/* 주소 */}
      <div>
        <Label className="text-xs font-medium text-gray-600 mb-1 block">주소</Label>
        <Input
          placeholder="서울시 강남구 테헤란로 123"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </div>

      {/* 자산 분배 */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-3">
        <Label className="text-xs font-semibold text-gray-700 block">자산 분배 방식</Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => update("shareType", "percent")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
              form.shareType === "percent"
                ? "bg-[#1F3864] text-white border-[#1F3864]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#1F3864]"
            }`}
          >
            비율 (%)
          </button>
          <button
            type="button"
            onClick={() => update("shareType", "amount")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
              form.shareType === "amount"
                ? "bg-[#1F3864] text-white border-[#1F3864]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#1F3864]"
            }`}
          >
            금액 (₩)
          </button>
        </div>
        {form.shareType === "percent" ? (
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">분배 비율 (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="0"
              value={form.sharePercent}
              onChange={(e) => update("sharePercent", Number(e.target.value))}
            />
          </div>
        ) : (
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">분배 금액 (원)</Label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={form.shareAmount}
              onChange={(e) => update("shareAmount", Number(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* 제1상속자 SMS 동의 */}
      {isFirst && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-blue-800">SMS 알림 동의</p>
              <p className="text-xs text-blue-600 mt-0.5">
                동의 시 제1상속자에게 EverWill 가입 사실을 문자로 알립니다.
                유언 작성이 완료되면 유언 사실도 문자로 알림이 발송됩니다.
              </p>
            </div>
            <Switch
              checked={form.smsConsent === 1}
              onCheckedChange={(checked) => update("smsConsent", checked ? 1 : 0)}
            />
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="flex-1 bg-[#1F3864] hover:bg-[#162a4e] text-white gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "저장 중..." : isEdit ? "수정 저장" : "등록"}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 gap-2"
        >
          <X className="w-4 h-4" />
          취소
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 사회기부 유언 섹션 컴포넌트
// ─────────────────────────────────────────────

/** 기부 분야 정의 */
const CHARITY_CATEGORIES = [
  { key: "education",   label: "교육",          emoji: "📚", desc: "장학금·학교 설립·교육 기자재 지원" },
  { key: "children",    label: "아동·청소년",    emoji: "👶", desc: "결식아동·보육원·청소년 자립 지원" },
  { key: "elderly",     label: "노인복지",       emoji: "👴", desc: "독거노인·요양·치매 케어" },
  { key: "disabled",    label: "장애인",         emoji: "♿", desc: "재활·자립 생활·보조기기 지원" },
  { key: "medical",     label: "의료·보건",      emoji: "🏥", desc: "희귀질환·저소득층 의료비·백신 지원" },
  { key: "environment", label: "환경·기후",      emoji: "🌿", desc: "탄소중립·해양 정화·산림 보호" },
  { key: "culture",     label: "문화·예술",      emoji: "🎨", desc: "문화 소외 계층·예술 지원·문화재 보존" },
  { key: "science",     label: "과학·기술",      emoji: "🔬", desc: "이공계 인재 육성·R&D 지원" },
  { key: "animal",      label: "동물복지",       emoji: "🐾", desc: "유기동물 보호·동물 학대 방지" },
  { key: "disaster",    label: "재난·긴급구호",  emoji: "🆘", desc: "자연재해·전쟁 피해 긴급 지원" },
  { key: "religion",    label: "종교·사회봉사",  emoji: "🙏", desc: "종교 기관 운영·봉사 활동" },
  { key: "other",       label: "기타 (직접 입력)", emoji: "✏️", desc: "단체명을 직접 입력해주세요" },
] as const;

type CharityCategory = typeof CHARITY_CATEGORIES[number]["key"];

/** 금액 포맷 (입력 중 콤마 표시) */
function formatAmount(val: string): string {
  const num = val.replace(/[^0-9]/g, "");
  return num ? Number(num).toLocaleString() : "";
}

function CharitySection() {
  // DB에서 기존 기부 데이터 조회
  const { data: savedList = [], isLoading: charityLoading, refetch } = trpc.charity.list.useQuery();
  const upsertMutation = trpc.charity.upsert.useMutation({
    onSuccess: () => { toast.success("기부 유언이 저장되었습니다."); refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.charity.delete.useMutation({
    onSuccess: () => { toast.success("기부 유언이 삭제되었습니다."); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  // 로컬 상태: 체크된 분야 + 금액 + 기타 단체명
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [customOrg, setCustomOrg] = useState<Record<string, string>>({});

  // savedList 비동기 수신 후 로컬 상태 동기화
  useEffect(() => {
    if (savedList.length === 0) return;
    const newChecked: Record<string, boolean> = {};
    const newAmounts: Record<string, string> = {};
    const newCustomOrg: Record<string, string> = {};
    savedList.forEach((d) => {
      newChecked[d.category] = true;
      newAmounts[d.category] = d.amount > 0 ? d.amount.toLocaleString() : "";
      if (d.customOrgName) newCustomOrg[d.category] = d.customOrgName;
    });
    setChecked(newChecked);
    setAmounts(newAmounts);
    setCustomOrg(newCustomOrg);
  }, [savedList]);

  // 체크 토글
  const handleToggle = (key: string) => {
    const next = !checked[key];
    setChecked((prev) => ({ ...prev, [key]: next }));
    if (!next) {
      // 체크 해제 시 DB에서도 삭제
      const existing = savedList.find((d) => d.category === key);
      if (existing) {
        deleteMutation.mutate({ category: key as CharityCategory });
      }
    }
  };

  // 저장
  const handleSave = (key: string) => {
    const rawAmount = (amounts[key] || "0").replace(/[^0-9]/g, "");
    const amount = parseInt(rawAmount, 10) || 0;
    if (amount <= 0) return toast.error("기부 금액을 입력해주세요");
    if (key === "other" && !customOrg["other"]?.trim()) return toast.error("단체명을 입력해주세요");
    upsertMutation.mutate({
      category: key as CharityCategory,
      customOrgName: key === "other" ? customOrg["other"] : undefined,
      amount,
    });
  };

  // 총 기부 금액 합산
  const totalDonation = savedList.reduce((sum, d) => sum + (d.amount ?? 0), 0);

  if (charityLoading) {
    return (
      <div className="mt-10 flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-rose-400 rounded-full animate-spin" />
        기부 유언 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
          <Heart className="w-4 h-4 text-rose-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1F3864]">사회기부 유언</h2>
          <p className="text-xs text-gray-500">사망 후 기부하고 싶은 분야를 선택하고 금액을 입력하세요</p>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
        <Building2 className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
        <p className="text-xs text-rose-700 leading-relaxed">
          기부 단체는 <strong>EverWill이 분야별로 검증된 단체를 선정하여 전달</strong>합니다.
          단체 후원 신청은 EverWill 공식 채널을 통해 접수됩니다.
        </p>
      </div>

      {/* 총 기부 금액 표시 */}
      {totalDonation > 0 && (
        <div className="bg-[#1F3864]/5 border border-[#1F3864]/20 rounded-xl p-4 mb-5 flex items-center justify-between">
          <span className="text-sm text-[#1F3864] font-medium">총 기부 예정 금액</span>
          <span className="text-lg font-bold text-[#C9A961]">₩{totalDonation.toLocaleString()}</span>
        </div>
      )}

      {/* 분야 카드 그리드 */}
      <div className="space-y-3">
        {CHARITY_CATEGORIES.map((cat) => {
          const isChecked = !!checked[cat.key];
          const isSaved = savedList.some((d) => d.category === cat.key);
          return (
            <div key={cat.key} className={`rounded-xl border-2 transition-all duration-200 ${
              isChecked ? "border-rose-300 bg-rose-50/50" : "border-gray-200 bg-white"
            }`}>
              {/* 체크박스 행 */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                onClick={() => handleToggle(cat.key)}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isChecked ? "bg-rose-500 border-rose-500" : "border-gray-300"
                }`}>
                  {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="text-lg">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#1F3864] text-sm">{cat.label}</div>
                  <div className="text-xs text-gray-400 truncate">{cat.desc}</div>
                </div>
                {isSaved && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">저장됨</span>
                )}
              </button>

              {/* 체크 시 확장 영역 */}
              {isChecked && (
                <div className="px-4 pb-4 space-y-3 border-t border-rose-200/60 pt-3">
                  {/* 기타: 단체명 입력 */}
                  {cat.key === "other" && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">단체명 *</label>
                      <input
                        type="text"
                        placeholder="기부하고 싶은 단체명을 입력하세요"
                        value={customOrg["other"] ?? ""}
                        onChange={(e) => setCustomOrg((prev) => ({ ...prev, other: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                    </div>
                  )}
                  {/* 금액 입력 */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">기부 금액 (원) *</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₩</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="예: 10,000,000"
                          value={amounts[cat.key] ?? ""}
                          onChange={(e) => {
                            const formatted = formatAmount(e.target.value);
                            setAmounts((prev) => ({ ...prev, [cat.key]: formatted }));
                          }}
                          className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSave(cat.key)}
                        disabled={upsertMutation.isPending}
                        className="px-4 py-2 bg-[#1F3864] hover:bg-[#162a4e] text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {upsertMutation.isPending ? "저장 중..." : isSaved ? "수정" : "저장"}
                      </button>
                    </div>
                  </div>
                  {/* 저장된 금액 표시 */}
                  {isSaved && (
                    <div className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                      ✓ 저장된 금액: ₩{(savedList.find((d) => d.category === cat.key)?.amount ?? 0).toLocaleString()}
                      {cat.key === "other" && savedList.find((d) => d.category === "other")?.customOrgName && (
                        <span className="ml-2 text-gray-500">({savedList.find((d) => d.category === "other")?.customOrgName})</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        * 기부 유언은 유언자 사망 확인 후 EverWill이 선정한 단체에 전달됩니다.<br />
        * 기부 금액은 상속 자산에서 우선 공제 후 집행됩니다.
      </p>
    </div>
  );
}
