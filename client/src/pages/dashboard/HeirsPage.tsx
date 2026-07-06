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
  Heart, Building2, ShieldCheck, Banknote, Eye, EyeOff
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
  isExecutor: number;
  accessLevel: string;
  heirFee: number;
  heirPaid: number;
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
  isExecutor: number;
  accessLevel: "own_only" | "full";
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
  isExecutor: 0,
  accessLevel: "own_only",
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
      isExecutor: heir.isExecutor ?? 0,
      accessLevel: (heir.accessLevel as "own_only" | "full") ?? "own_only",
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
                <div className="flex items-center gap-2 flex-wrap">
                  {heir.isExecutor === 1 ? (
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                  ) : heir.priority === 1 ? (
                    <Crown className="w-4 h-4 text-[#C9A961]" />
                  ) : null}
                  {heir.isExecutor === 1 ? (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 border text-xs">
                      집행자
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className={heir.priority === 1 ? "border-[#C9A961] text-[#C9A961]" : "border-gray-300 text-gray-500"}
                    >
                      제{heir.priority}상속자
                    </Badge>
                  )}
                  <CardTitle className="text-base font-semibold text-[#1F3864]">
                    {heir.nameKo}
                    {heir.nameEn && <span className="text-gray-400 text-sm ml-1">({heir.nameEn})</span>}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {RELATIONSHIP_LABELS[heir.relationship] ?? heir.relationship}
                  </Badge>
                  {/* 요금 배지 */}
                  <Badge className="bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/30 text-xs">
                    <Banknote className="w-3 h-3 mr-1" />
                    {heir.isExecutor === 1 ? "₩149,000" : heir.priority === 1 ? "₩99,000" : "₩99,000"}
                  </Badge>
                  {/* 열람 권한 배지 */}
                  <Badge variant="outline" className={`text-xs ${heir.accessLevel === "full" ? "border-green-400 text-green-600" : "border-gray-300 text-gray-500"}`}>
                    {heir.accessLevel === "full" ? <><Eye className="w-3 h-3 mr-1" />전체 열람</> : <><EyeOff className="w-3 h-3 mr-1" />자기 몫만</>}
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

      {/* 국가 + 주소 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium text-gray-600 mb-1 block">거주 국가</Label>
          <Select value={form.country} onValueChange={(v) => update("country", v)}>
            <SelectTrigger>
              <SelectValue placeholder="국가 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KR">🇰🇷 한국</SelectItem>
              <SelectItem value="US">🇺🇸 미국</SelectItem>
              <SelectItem value="JP">🇯🇵 일본</SelectItem>
              <SelectItem value="CN">🇨🇳 중국</SelectItem>
              <SelectItem value="DE">🇩🇪 독일</SelectItem>
              <SelectItem value="GB">🇬🇧 영국</SelectItem>
              <SelectItem value="CA">🇨🇦 캐나다</SelectItem>
              <SelectItem value="AU">🇦🇺 호주</SelectItem>
              <SelectItem value="SG">🇸🇬 싱가포르</SelectItem>
              <SelectItem value="AE">🇦🇪 UAE</SelectItem>
              <SelectItem value="OTHER">🌐 기타</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600 mb-1 block">주소</Label>
          <Input
            placeholder="서울시 강남구 테헤란로 123"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
      </div>

      {/* SNS 연락처 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
        <Label className="text-xs font-semibold text-gray-700 block">SNS 연락처 (선택)</Label>
        <p className="text-xs text-gray-500">사망 후 자동 알림 발송에 사용됩니다.</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">KakaoTalk ID</Label>
            <Input
              placeholder="카카오톡 ID"
              value={(form as any).kakaoId ?? ""}
              onChange={(e) => update("kakaoId" as any, e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">LINE ID</Label>
            <Input
              placeholder="LINE ID"
              value={(form as any).lineId ?? ""}
              onChange={(e) => update("lineId" as any, e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">WhatsApp (+국가코드)</Label>
            <Input
              placeholder="+1 234 567 8900"
              value={(form as any).whatsappId ?? ""}
              onChange={(e) => update("whatsappId" as any, e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">WeChat ID</Label>
            <Input
              placeholder="WeChat ID"
              value={(form as any).wechatId ?? ""}
              onChange={(e) => update("wechatId" as any, e.target.value)}
            />
          </div>
        </div>
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

      {/* 집행자 지정 토글 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-purple-800 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              유언 집행자로 지정
            </p>
            <p className="text-xs text-purple-600 mt-0.5">
              집행자는 사망 후 전체 유언 내용을 열람하고 집행을 진행합니다. (요금: ₩149,000)
            </p>
          </div>
          <Switch
            checked={form.isExecutor === 1}
            onCheckedChange={(checked) => {
              update("isExecutor", checked ? 1 : 0);
              update("accessLevel", checked ? "full" : "own_only");
            }}
          />
        </div>
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
// 노인복지 기부 유언 섹션 컴포넌트
// ─────────────────────────────────────────────

/** 노인복지 기부 분야 (전용) */
const ELDERLY_CATEGORIES = [
  { key: "elderly_poverty", label: "노인 빈곤 해결",     emoji: "🏠", desc: "독거노인 생활비·난방비·식사 지원" },
  { key: "elderly_biz",    label: "노인 사업 지원",     emoji: "💼", desc: "시니어 창업·재취업·직업훈련 프로그램" },
  { key: "elderly_care",   label: "노인 돌봄 서비스",   emoji: "🤝", desc: "방문 돌봄·말벗·외출 동행 서비스" },
  { key: "elderly_health", label: "노인 의료·건강",     emoji: "🏥", desc: "치매 케어·재활·건강검진 지원" },
  { key: "elderly_culture", label: "노인 문화·여가",    emoji: "🎵", desc: "문화 프로그램·여행·평생교육 지원" },
] as const;

type CharityCategory = typeof ELDERLY_CATEGORIES[number]["key"] | string;

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

  // 로컬 상태: 체크된 분야 + 금액
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  // savedList 비동기 수신 후 로컬 상태 동기화
  useEffect(() => {
    if (savedList.length === 0) return;
    const newChecked: Record<string, boolean> = {};
    const newAmounts: Record<string, string> = {};
    savedList.forEach((d) => {
      newChecked[d.category] = true;
      newAmounts[d.category] = d.amount > 0 ? d.amount.toLocaleString() : "";
    });
    setChecked(newChecked);
    setAmounts(newAmounts);
  }, [savedList]);

  // 체크 토글
  const handleToggle = (key: string) => {
    const next = !checked[key];
    setChecked((prev) => ({ ...prev, [key]: next }));
    if (!next) {
      const existing = savedList.find((d) => d.category === key);
      if (existing) {
        deleteMutation.mutate({ category: key as any });
      }
    }
  };

  // 저장
  const handleSave = (key: string) => {
    const rawAmount = (amounts[key] || "0").replace(/[^0-9]/g, "");
    const amount = parseInt(rawAmount, 10) || 0;
    if (amount <= 0) return toast.error("기부 금액을 입력해주세요");
    upsertMutation.mutate({
      category: key as any,
      amount,
    });
  };

  // 총 기부 금액 합산
  const totalDonation = savedList.reduce((sum, d) => sum + (d.amount ?? 0), 0);

  if (charityLoading) {
    return (
      <div className="mt-10 flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
        노인복지 기부 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* 히어로 이미지 + 메시지 */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <img
          src="/manus-storage/elderly-welfare-2_7101871d.webp"
          alt="노인복지 지원"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F3864]/90 via-[#1F3864]/40 to-transparent flex items-end">
          <div className="p-5">
            <h2 className="text-xl font-bold text-white mb-1">노인복지 기부 유언</h2>
            <p className="text-sm text-white/80">세계의 모든 빈곤노인들과 독거노인, 어렵고 힘든 상황에 놓인 노인분들께 사랑과 희망을 드립니다. 에버윌이 함께 합니다.</p>
          </div>
        </div>
      </div>

      {/* 노인 빈곤 현실 안내 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 mb-5">
        <div className="flex items-start gap-3">
          <img
            src="/manus-storage/elderly-welfare-1_0bce95b8.jpg"
            alt="노인 돌봄"
            className="w-16 h-16 rounded-lg object-cover shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-1">대한민국 노인 빈곤율 OECD 1위</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              65세 이상 노인 빈곤율 40.4% — OECD 평균(14.2%)의 약 3배입니다.
              독거노인 190만 명, 기초생활수급 노인 70만 명.
              당신의 기부가 어르신의 따뜻한 한 끼, 난방비, 새로운 일자리가 됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="bg-[#1F3864]/5 border border-[#1F3864]/20 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#1F3864] mt-0.5 shrink-0" />
        <p className="text-xs text-[#1F3864] leading-relaxed">
          기부 단체는 <strong>EverWill이 검증한 노인복지 전문 기관</strong>에 전달됩니다.
          투명한 집행 내역을 유족에게 보고합니다.
        </p>
      </div>

      {/* 총 기부 금액 표시 */}
      {totalDonation > 0 && (
        <div className="bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-xl p-4 mb-5 flex items-center justify-between">
          <span className="text-sm text-[#1F3864] font-medium">총 기부 예정 금액</span>
          <span className="text-lg font-bold text-[#C9A961]">₩{totalDonation.toLocaleString()}</span>
        </div>
      )}

      {/* 노인복지 분야 카드 */}
      <div className="space-y-3">
        {ELDERLY_CATEGORIES.map((cat) => {
          const isChecked = !!checked[cat.key];
          const isSaved = savedList.some((d) => d.category === cat.key);
          return (
            <div key={cat.key} className={`rounded-xl border-2 transition-all duration-200 ${
              isChecked ? "border-[#C9A961]/60 bg-[#C9A961]/5" : "border-gray-200 bg-white"
            }`}>
              {/* 체크박스 행 */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                onClick={() => handleToggle(cat.key)}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isChecked ? "bg-[#C9A961] border-[#C9A961]" : "border-gray-300"
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
                <div className="px-4 pb-4 space-y-3 border-t border-[#C9A961]/30 pt-3">
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
                          className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A961]/50"
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
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-500 leading-relaxed text-center">
          * 기부 유언은 유언자 사망 확인 후 EverWill이 선정한 노인복지 단체에 전달됩니다.<br />
          * 기부 금액은 상속 자산에서 우선 공제 후 집행됩니다.<br />
          * 집행 결과는 유족에게 투명하게 보고됩니다.
        </p>
      </div>
    </div>
  );
}
