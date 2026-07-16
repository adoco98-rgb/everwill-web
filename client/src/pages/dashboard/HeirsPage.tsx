import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users, Plus, Trash2, Edit2, Save, X, Phone, MapPin,
  User, Crown, MessageSquare, ShieldCheck, Eye, EyeOff,
  FileText, Upload, Loader2, CheckCircle2, UserPlus, ChevronRight
} from "lucide-react";
import AddressSearch from "@/components/write/AddressSearch";

/**
 * 상속자 등록 페이지
 * - 상속자 추가 버튼 클릭 시 두 가지 옵션:
 *   1. 가족관계증명서에서 불러오기 (업로드된 가족 정보 자동 입력)
 *   2. 직접 입력 (기존 폼)
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

// 가족관계증명서 한국어 관계 → heirs enum 매핑
function normalizeRelationship(raw: string): "spouse" | "child" | "parent" | "sibling" | "grandchild" | "other" {
  const r = raw.trim().toLowerCase();
  if (r.includes("배우자") || r.includes("spouse") || r.includes("처") || r.includes("남편") || r.includes("아내")) return "spouse";
  if (r.includes("자녀") || r.includes("아들") || r.includes("딸") || r.includes("child") || r.includes("son") || r.includes("daughter")) return "child";
  if (r.includes("부모") || r.includes("아버지") || r.includes("어머니") || r.includes("부") || r.includes("모") || r.includes("parent") || r.includes("father") || r.includes("mother")) return "parent";
  if (r.includes("형") || r.includes("제") || r.includes("오빠") || r.includes("언니") || r.includes("누나") || r.includes("동생") || r.includes("sibling")) return "sibling";
  if (r.includes("손") || r.includes("grandchild")) return "grandchild";
  return "other";
}

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

  // 상속자 추가 방법 선택 모달
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  // 가족관계증명서 업로드 모달
  const [showFamilyUploadModal, setShowFamilyUploadModal] = useState(false);
  // 가족관계증명서 업로드 상태
  const [familyUploadPreview, setFamilyUploadPreview] = useState<string | null>(null);
  const [familyUploadLoading, setFamilyUploadLoading] = useState(false);
  const familyFileInputRef = useRef<HTMLInputElement>(null);

  const { data: heirs = [], refetch } = trpc.heirs.getMyHeirs.useQuery();
  // 저장된 가족 구성원 목록
  const { data: familyMembers = [], refetch: refetchFamily } = trpc.familyMembers.getMyFamilyMembers.useQuery();

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

  // 가족관계증명서 multipart 업로드 함수
  async function uploadFamilyDocMultipart(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", "family_cert");

    const res = await fetch("/api/family-doc/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `업로드 실패 (${res.status})` }));
      throw new Error(err.error || `업로드 실패 (${res.status})`);
    }
    return res.json() as Promise<{ success: boolean; count: number; members: any[] }>;
  }

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

  // 가족관계증명서 파일 선택 처리
  function handleFamilyFileSelect(file: File) {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("이미지(JPG/PNG) 또는 PDF 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("파일 크기는 20MB 이하여야 합니다.");
      return;
    }
    // 미리보기용 URL 생성
    const previewUrl = URL.createObjectURL(file);
    setFamilyUploadPreview(previewUrl);
    setFamilyUploadLoading(true);

    // multipart FormData로 업로드
    uploadFamilyDocMultipart(file)
      .then((data) => {
        setFamilyUploadLoading(false);
        refetchFamily();
        toast.success(`✅ ${data.count}명의 가족 정보를 추출했습니다. 아래에서 선택하여 추가하세요.`);
        setShowFamilyUploadModal(false);
      })
      .catch((err) => {
        setFamilyUploadLoading(false);
        toast.error(err.message || "가족 정보 추출에 실패했습니다.");
      });
  }

  // 가족 구성원 선택 → 상속자 폼에 자동 입력
  function fillFromFamilyMember(member: any) {
    setForm({
      ...defaultForm,
      nameKo: member.nameKo || "",
      relationship: normalizeRelationship(member.relationship || ""),
      birthDate: member.birthDate || "",
      address: member.address || "",
    });
    setShowChoiceModal(false);
    setShowAddForm(true);
    toast.success(`${member.nameKo} 정보가 자동 입력되었습니다. 나머지 정보를 확인 후 등록하세요.`);
  }

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
          onClick={() => { setShowChoiceModal(true); setShowAddForm(false); setEditingId(null); }}
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
                  <Badge variant="outline" className={`text-xs ${heir.accessLevel === "full" ? "border-green-400 text-green-600" : "border-gray-300 text-gray-500"}`}>
                    {heir.accessLevel === "full" ? <><Eye className="w-3 h-3 mr-1" />전체 열람</> : <><EyeOff className="w-3 h-3 mr-1" />자기 몫만</>}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(heir)} className="h-8 w-8 p-0 text-gray-400 hover:text-[#1F3864]">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate({ id: heir.id })} className="h-8 w-8 p-0 text-gray-400 hover:text-red-500">
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

      {/* 상속자 직접 입력 폼 */}
      {showAddForm && (
        <Card className="border-2 border-[#C9A961]/50 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#1F3864] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                새 상속자 등록 (제{heirs.length + 1}상속자)
              </CardTitle>
              <button
                onClick={() => setShowChoiceModal(true)}
                className="text-xs text-[#1F3864] underline flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                가족관계증명서에서 불러오기
              </button>
            </div>
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

      {/* 상속자 1명 이상 등록 시 기본유언장 확인 CTA */}
      {heirs.length > 0 && !showAddForm && (
        <div className="mt-8 bg-[#1F3864] rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold text-lg mb-2">상속자 등록이 완료되었나요?</h3>
          <p className="text-white/60 text-sm mb-4">
            등록한 자산과 상속자 정보로 작성된 유언장을 확인해보세요.
          </p>
          <a href="/dashboard/will-preview">
            <button className="bg-[#C9A961] hover:bg-[#b8963e] text-white px-8 py-3 rounded-full font-bold transition-colors">
              기본유언장 확인하기 →
            </button>
          </a>
        </div>
      )}

      {/* ── 상속자 추가 방법 선택 모달 ── */}
      <Dialog open={showChoiceModal} onOpenChange={setShowChoiceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1F3864] flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              상속자 추가 방법 선택
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {/* 옵션 1: 가족관계증명서에서 불러오기 */}
            <button
              onClick={() => {
                setShowChoiceModal(false);
                setShowFamilyUploadModal(true);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#1F3864]/20 hover:border-[#1F3864] hover:bg-[#1F3864]/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1F3864]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1F3864]/20">
                <FileText className="w-6 h-6 text-[#1F3864]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1F3864]">가족관계증명서에서 불러오기</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  가족관계증명서를 업로드하면 AI가 가족 정보를 자동으로 추출합니다
                </p>
                {familyMembers.length > 0 && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ {familyMembers.length}명의 가족 정보가 저장되어 있습니다
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1F3864]" />
            </button>

            {/* 저장된 가족 구성원이 있으면 바로 선택 가능 */}
            {familyMembers.length > 0 && (
              <div className="border border-green-200 bg-green-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  저장된 가족 정보에서 바로 선택
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(familyMembers as any[]).map((member) => {
                    // 이미 상속자로 등록된 경우 표시
                    const alreadyAdded = (heirs as Heir[]).some(
                      (h) => h.nameKo === member.nameKo
                    );
                    return (
                      <button
                        key={member.id}
                        onClick={() => fillFromFamilyMember(member)}
                        disabled={alreadyAdded}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                          alreadyAdded
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white hover:bg-green-100 text-gray-700 border border-green-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                          <span className="font-medium">{member.nameKo}</span>
                          <span className="text-gray-400 text-xs">{member.relationship}</span>
                          {member.birthDate && <span className="text-gray-400 text-xs">({member.birthDate})</span>}
                        </div>
                        {alreadyAdded ? (
                          <span className="text-xs text-gray-400">등록됨</span>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">선택 →</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 옵션 2: 직접 입력 */}
            <button
              onClick={() => {
                setShowChoiceModal(false);
                setForm(defaultForm);
                setShowAddForm(true);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#1F3864] hover:bg-gray-50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1F3864]/10">
                <UserPlus className="w-6 h-6 text-gray-500 group-hover:text-[#1F3864]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-700 group-hover:text-[#1F3864]">직접 입력</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  이름, 관계, 연락처 등을 직접 입력합니다
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1F3864]" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 가족관계증명서 업로드 모달 ── */}
      <Dialog open={showFamilyUploadModal} onOpenChange={(open) => {
        if (!familyUploadLoading) setShowFamilyUploadModal(open);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1F3864] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              가족관계증명서 업로드
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              가족관계증명서 또는 주민등록등본을 업로드하면 AI가 가족 구성원 정보를 자동으로 추출합니다.
            </p>

            {/* 업로드 영역 */}
            {!familyUploadLoading ? (
              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-[#1F3864]/30 rounded-xl cursor-pointer hover:border-[#1F3864] hover:bg-[#1F3864]/5 transition-all">
                <Upload className="w-10 h-10 text-[#1F3864]/40" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#1F3864]">클릭하여 파일 선택</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF 지원 · 최대 20MB</p>
                </div>
                <input
                  ref={familyFileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFamilyFileSelect(file);
                    e.target.value = "";
                  }}
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-[#1F3864]/20">
                {familyUploadPreview && (
                  <img
                    src={familyUploadPreview}
                    alt="업로드 중"
                    className="w-full max-h-64 object-contain bg-white"
                  />
                )}
                <div className="absolute inset-0 bg-[#1F3864]/50 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                  <p className="text-white font-semibold text-sm">AI가 가족 정보를 추출하고 있습니다...</p>
                  <p className="text-white/70 text-xs">잠시만 기다려주세요</p>
                </div>
              </div>
            )}

            {/* 안내 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <p className="font-semibold mb-1">📋 발급 방법</p>
              <p>정부24(gov.kr) 또는 주민센터에서 가족관계증명서를 발급받아 업로드하세요.</p>
              <p className="mt-1">스캔 이미지 PDF는 인식이 어려울 수 있습니다. JPG/PNG로 촬영하여 업로드를 권장합니다.</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFamilyUploadModal(false)}
                disabled={familyUploadLoading}
                className="flex-1"
              >
                취소
              </Button>
              {familyMembers.length > 0 && (
                <Button
                  onClick={() => {
                    setShowFamilyUploadModal(false);
                    setShowChoiceModal(true);
                  }}
                  disabled={familyUploadLoading}
                  className="flex-1 bg-[#1F3864] text-white"
                >
                  저장된 가족 정보 보기
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
          {form.country === "KR" ? (
            <AddressSearch
              value={form.address}
              onChange={(address: string) => update("address", address)}
              label="주소"
              placeholder="주소를 검색해 주세요"
            />
          ) : (
            <>
              <Label className="text-xs font-medium text-gray-600 mb-1 block">주소</Label>
              <Input
                placeholder="해외 주소 입력"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </>
          )}
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
