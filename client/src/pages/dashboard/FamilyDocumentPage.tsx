/**
 * 가족관계증명서 / 주민등록등본 업로드 페이지
 * AI OCR로 가족 구성원 정보 자동 추출 → 저장
 * 유류분 배제 작성 시 자동 불러오기에 활용
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Users,
  FileText,
  Trash2,
  Plus,
  CheckCircle2,
  Loader2,
  Info,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function FamilyDocumentPage() {
  const [docType, setDocType] = useState<"family_cert" | "resident_cert">("family_cert");
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 편집 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAddress, setEditAddress] = useState("");

  // 수동 추가 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    nameKo: "",
    relationship: "",
    birthDate: "",
    address: "",
  });

  const familyQuery = trpc.familyMembers.getMyFamilyMembers.useQuery();
  const extractMutation = trpc.familyMembers.extractFromDocument.useMutation();
  const updateAddressMutation = trpc.familyMembers.updateAddress.useMutation();
  const addMutation = trpc.familyMembers.addFamilyMember.useMutation();
  const deleteMutation = trpc.familyMembers.deleteFamilyMember.useMutation();

  const utils = trpc.useUtils();

  // 파일 선택 → base64 변환 → OCR 추출
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // base64 변환
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setIsExtracting(true);
      try {
        const result = await extractMutation.mutateAsync({
          imageBase64: base64,
          fileName: file.name,
          docType,
        });
        toast.success(`${result.count}명의 가족 정보가 추출되었습니다.`);
        utils.familyMembers.getMyFamilyMembers.invalidate();
      } catch {
        toast.error("문서 분석에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setIsExtracting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  // 주소 저장
  const handleSaveAddress = async (id: number) => {
    try {
      await updateAddressMutation.mutateAsync({ id, address: editAddress });
      toast.success("주소가 저장되었습니다.");
      setEditingId(null);
      utils.familyMembers.getMyFamilyMembers.invalidate();
    } catch {
      toast.error("저장 실패");
    }
  };

  // 수동 추가
  const handleAddMember = async () => {
    if (!newMember.nameKo || !newMember.relationship) {
      toast.error("이름과 관계는 필수입니다.");
      return;
    }
    try {
      await addMutation.mutateAsync(newMember);
      toast.success("가족 구성원이 추가되었습니다.");
      setShowAddForm(false);
      setNewMember({ nameKo: "", relationship: "", birthDate: "", address: "" });
      utils.familyMembers.getMyFamilyMembers.invalidate();
    } catch {
      toast.error("추가 실패");
    }
  };

  // 삭제
  const handleDelete = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("삭제되었습니다.");
      utils.familyMembers.getMyFamilyMembers.invalidate();
    } catch {
      toast.error("삭제 실패");
    }
  };

  const sourceLabel = (source: string) => {
    if (source === "family_cert") return { label: "가족관계증명서", color: "bg-blue-100 text-blue-700" };
    if (source === "resident_cert") return { label: "주민등록등본", color: "bg-green-100 text-green-700" };
    return { label: "수동입력", color: "bg-gray-100 text-gray-600" };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]">가족 구성원 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          가족관계증명서 또는 주민등록등본을 업로드하면 AI가 가족 정보를 자동으로 추출합니다.
          추출된 정보는 유류분 배제 작성 시 자동으로 불러올 수 있습니다.
        </p>
      </div>

      {/* 문서 업로드 카드 */}
      <Card className="border-[#1F3864]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1F3864] flex items-center gap-2">
            <FileText className="w-4 h-4" />
            문서 업로드 (AI 자동 추출)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 문서 종류 선택 */}
          <div className="flex gap-3">
            <button
              onClick={() => setDocType("family_cert")}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                docType === "family_cert"
                  ? "bg-[#1F3864] text-white border-[#1F3864]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-[#1F3864]"
              }`}
            >
              가족관계증명서
            </button>
            <button
              onClick={() => setDocType("resident_cert")}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                docType === "resident_cert"
                  ? "bg-[#1F3864] text-white border-[#1F3864]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-[#1F3864]"
              }`}
            >
              주민등록등본
            </button>
          </div>

          {/* 업로드 영역 */}
          <div
            onClick={() => !isExtracting && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isExtracting
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : "border-[#C9A961]/50 hover:border-[#C9A961] hover:bg-[#C9A961]/5"
            }`}
          >
            {isExtracting ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-[#1F3864] animate-spin" />
                <p className="text-sm text-gray-600">AI가 문서를 분석 중입니다...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-[#C9A961]" />
                <p className="text-sm font-medium text-gray-700">
                  {docType === "family_cert" ? "가족관계증명서" : "주민등록등본"} 업로드
                </p>
                <p className="text-xs text-gray-400">JPG, PNG, PDF 지원 · 클릭하여 선택</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* 미리보기 */}
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="업로드 문서"
                className="w-full max-h-48 object-contain rounded-lg border"
              />
            </div>
          )}

          {/* 안내 */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              <strong>주소 안내:</strong> 가족관계증명서에는 주소가 없습니다.
              추출 후 각 구성원의 현재 거주지 주소를 직접 입력해주세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 가족 구성원 목록 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-[#1F3864] flex items-center gap-2">
              <Users className="w-4 h-4" />
              등록된 가족 구성원
              {familyQuery.data && (
                <Badge className="bg-[#1F3864]/10 text-[#1F3864] border-0">
                  {familyQuery.data.length}명
                </Badge>
              )}
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-1 text-[#1F3864] border-[#1F3864]/30"
            >
              <Plus className="w-3 h-3" />
              직접 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 수동 추가 폼 */}
          {showAddForm && (
            <div className="border border-[#C9A961]/30 rounded-lg p-4 bg-amber-50/30 space-y-3">
              <p className="text-sm font-medium text-[#1F3864]">가족 구성원 직접 추가</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">이름 *</label>
                  <Input
                    value={newMember.nameKo}
                    onChange={(e) => setNewMember({ ...newMember, nameKo: e.target.value })}
                    placeholder="예: 라성원"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">관계 *</label>
                  <Input
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                    placeholder="예: 자녀, 배우자"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">생년월일</label>
                  <Input
                    type="date"
                    value={newMember.birthDate}
                    onChange={(e) => setNewMember({ ...newMember, birthDate: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">현재 거주지 주소</label>
                  <Input
                    value={newMember.address}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    placeholder="예: 서울시 강남구 ..."
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddMember}
                  disabled={addMutation.isPending}
                  className="bg-[#1F3864] hover:bg-[#162d52]"
                >
                  {addMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "추가"}
                </Button>
              </div>
            </div>
          )}

          {/* 목록 */}
          {familyQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : !familyQuery.data || familyQuery.data.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">등록된 가족 구성원이 없습니다.</p>
              <p className="text-xs mt-1">문서를 업로드하거나 직접 추가해주세요.</p>
            </div>
          ) : (
            familyQuery.data.map((member) => {
              const src = sourceLabel(member.source);
              return (
                <div
                  key={member.id}
                  className="border rounded-lg p-4 space-y-3 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1F3864]">{member.nameKo}</span>
                        <span className="text-sm text-gray-500">({member.relationship})</span>
                        <Badge className={`text-xs border-0 ${src.color}`}>{src.label}</Badge>
                      </div>
                      {member.birthDate && (
                        <p className="text-xs text-gray-500">생년월일: {member.birthDate}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 -mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* 주소 입력/표시 */}
                  {editingId === member.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="현재 거주지 주소 입력"
                        className="text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveAddress(member.id)}
                        disabled={updateAddressMutation.isPending}
                        className="bg-[#1F3864] hover:bg-[#162d52] shrink-0"
                      >
                        {updateAddressMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        className="shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={() => {
                        setEditingId(member.id);
                        setEditAddress(member.address || "");
                      }}
                    >
                      {member.address ? (
                        <p className="text-sm text-gray-600 flex-1">{member.address}</p>
                      ) : (
                        <p className="text-sm text-gray-300 flex-1 italic">주소 미입력 — 클릭하여 추가</p>
                      )}
                      <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-[#C9A961] shrink-0" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 활용 안내 */}
      {familyQuery.data && familyQuery.data.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            등록된 가족 구성원은 <strong>유류분 배제 의사 표시서</strong> 작성 시
            "가족 목록에서 선택" 드롭다운에서 자동으로 불러올 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
