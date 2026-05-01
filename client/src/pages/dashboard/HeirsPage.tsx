import { useState } from "react";
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
  User, Crown, MessageSquare, ChevronDown, ChevronUp
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
