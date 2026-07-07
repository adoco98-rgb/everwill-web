/**
 * 유류분 배제 문서 작성 페이지
 * 유언자가 특정 상속인의 유류분 반환청구를 배제하는 의사를 문서화
 * 기본정보 자동 채움 + 배제 대상/사유 입력
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";

/** 배제 대상 상속인 정보 */
interface ExclusionTarget {
  id: string;
  name: string;
  relationship: string;
  birthDate: string;
  reason: string;
  detailReason: string;
}

/** 배제 사유 예시 목록 */
const REASON_EXAMPLES = [
  "10년 이상 연락 두절 및 부양 의무 불이행",
  "유언자에 대한 폭행·학대·협박",
  "유언자의 재산을 무단 처분·탕진",
  "유언자에 대한 명예훼손·모욕",
  "유언자의 유언 작성을 방해·강요",
  "중대한 범죄 행위 (형사 처벌)",
  "가족 간 심각한 불화 유발",
  "기타 (직접 입력)",
];

/** 임시저장 키 */
const DRAFT_KEY = "everwill_reserve_share_exclusion_draft";

export default function ReserveShareExclusionPage() {
  const { user } = useAuth();
  // 상속자 목록 가져오기
  const heirsQuery = trpc.heirs.getMyHeirs.useQuery();

  // 유언자 기본정보 (자동 채움)
  const [testatorInfo, setTestatorInfo] = useState({
    name: "",
    birthDate: "",
    address: "",
    phone: "",
    idNumber: "", // 주민등록번호 앞자리 (생년월일에서 자동)
  });

  // 배제 대상 목록
  const [exclusionTargets, setExclusionTargets] = useState<ExclusionTarget[]>([]);

  // 추가 의사 표시 내용
  const [additionalStatement, setAdditionalStatement] = useState("");

  // 작성일
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // 임시저장 상태
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // 유언자 정보 자동 채움
  useEffect(() => {
    if (user) {
      setTestatorInfo({
        name: user.name || "",
        birthDate: user.birthDate || "",
        address: user.address || "",
        phone: user.phone || "",
        idNumber: user.birthDate ? user.birthDate.replace(/-/g, "").slice(2) : "",
      });
    }
  }, [user]);

  // 임시저장 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.exclusionTargets) setExclusionTargets(data.exclusionTargets);
        if (data.additionalStatement) setAdditionalStatement(data.additionalStatement);
        if (data.documentDate) setDocumentDate(data.documentDate);
        setLastSaved(data.savedAt || null);
        toast.success("이전에 작성하던 내용을 불러왔습니다.");
      }
    } catch {
      // 무시
    }
  }, []);

  // 임시저장
  const handleSaveDraft = () => {
    try {
      const data = {
        exclusionTargets,
        additionalStatement,
        documentDate,
        savedAt: new Date().toLocaleString("ko-KR"),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      setLastSaved(data.savedAt);
      setIsDirty(false);
      toast.success("작성 중인 내용이 저장되었습니다.");
    } catch {
      toast.error("임시저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 배제 대상 추가
  const addTarget = () => {
    setExclusionTargets([
      ...exclusionTargets,
      {
        id: Date.now().toString(),
        name: "",
        relationship: "",
        birthDate: "",
        reason: "",
        detailReason: "",
      },
    ]);
    setIsDirty(true);
  };

  // 배제 대상 삭제
  const removeTarget = (id: string) => {
    setExclusionTargets(exclusionTargets.filter((t) => t.id !== id));
    setIsDirty(true);
  };

  // 배제 대상 정보 업데이트
  const updateTarget = (id: string, field: keyof ExclusionTarget, value: string) => {
    setExclusionTargets(
      exclusionTargets.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
    setIsDirty(true);
  };

  // 상속자 목록에서 선택하여 자동 채움
  const fillFromHeir = (targetId: string, heirId: number) => {
    const heir = heirsQuery.data?.find((h: any) => h.id === heirId);
    if (!heir) return;
    const relMap: Record<string, string> = {
      spouse: "배우자",
      child: "자녀",
      parent: "부모",
      sibling: "형제자매",
      grandchild: "손자녀",
      other: "기타",
    };
    setExclusionTargets(
      exclusionTargets.map((t) =>
        t.id === targetId
          ? {
              ...t,
              name: heir.nameKo || "",
              relationship: relMap[heir.relationship] || heir.relationship,
              birthDate: heir.birthDate || "",
            }
          : t
      )
    );
    setIsDirty(true);
  };

  // 인쇄
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864] flex items-center gap-2">
            <FileText className="w-7 h-7" />
            유류분 배제 의사 표시서
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            특정 상속인에 대한 유류분 반환청구 배제 의사를 문서화합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="gap-1"
          >
            <Save className="w-4 h-4" />
            임시저장
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1"
          >
            <Printer className="w-4 h-4" />
            인쇄
          </Button>
        </div>
      </div>

      {/* 임시저장 상태 */}
      {lastSaved && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          마지막 임시저장: {lastSaved}
          {isDirty && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 ml-2">
              수정됨 (저장 필요)
            </Badge>
          )}
        </div>
      )}

      {/* 법적 안내 */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 space-y-1">
              <p className="font-semibold">법적 안내사항</p>
              <p>
                본 문서는 유언자의 유류분 배제 의사를 명확히 기록하기 위한 것입니다.
                한국법상 상속 개시 전 유류분 포기는 법적 구속력이 제한적이나,
                사후 분쟁 시 유언자의 의사를 증명하는 중요한 참고 자료로 활용됩니다.
              </p>
              <p>
                (대법원 2006다29459 판례 참조)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 문서 본문 - 인쇄 영역 */}
      <div className="print:p-8" id="exclusion-document">
        {/* 문서 제목 */}
        <Card>
          <CardHeader className="text-center border-b">
            <CardTitle className="text-xl font-bold text-[#1F3864]">
              유류분 반환청구권 배제 의사 표시서
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Statement of Intent to Exclude Reserve Share Claims
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* 유언자 정보 (자동 채움) */}
            <div>
              <h3 className="font-semibold text-[#1F3864] mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                유언자 (본인) 정보
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">성명</label>
                    <Input
                      value={testatorInfo.name}
                      onChange={(e) => {
                        setTestatorInfo({ ...testatorInfo, name: e.target.value });
                        setIsDirty(true);
                      }}
                      placeholder="이름을 입력하세요"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">생년월일</label>
                    <Input
                      type="date"
                      value={testatorInfo.birthDate}
                      onChange={(e) => {
                        setTestatorInfo({ ...testatorInfo, birthDate: e.target.value });
                        setIsDirty(true);
                      }}
                      className="bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">주소</label>
                    <Input
                      value={testatorInfo.address}
                      onChange={(e) => {
                        setTestatorInfo({ ...testatorInfo, address: e.target.value });
                        setIsDirty(true);
                      }}
                      placeholder="주소를 입력하세요"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">연락처</label>
                    <Input
                      value={testatorInfo.phone}
                      onChange={(e) => {
                        setTestatorInfo({ ...testatorInfo, phone: e.target.value });
                        setIsDirty(true);
                      }}
                      placeholder="010-0000-0000"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">작성일</label>
                    <Input
                      type="date"
                      value={documentDate}
                      onChange={(e) => {
                        setDocumentDate(e.target.value);
                        setIsDirty(true);
                      }}
                      className="bg-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  회원 정보에서 자동으로 채워졌습니다. 수정이 필요하면 직접 변경하세요.
                </p>
              </div>
            </div>

            {/* 배제 대상 상속인 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#1F3864] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  유류분 배제 대상 상속인
                </h3>
                <Button size="sm" onClick={addTarget} className="gap-1 bg-[#1F3864]">
                  <Plus className="w-4 h-4" />
                  대상 추가
                </Button>
              </div>

              {exclusionTargets.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    유류분 배제 대상 상속인을 추가하세요.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTarget}
                    className="mt-3 gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    대상 추가
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {exclusionTargets.map((target, idx) => (
                    <Card key={target.id} className="border-red-100">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            배제 대상 {idx + 1}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTarget(target.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* 등록된 상속자에서 선택 */}
                        {heirsQuery.data && heirsQuery.data.length > 0 && (
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              등록된 상속자에서 선택 (선택사항)
                            </label>
                            <select
                              className="w-full border rounded-md px-3 py-2 text-sm"
                              onChange={(e) => {
                                if (e.target.value) {
                                  fillFromHeir(target.id, Number(e.target.value));
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="">직접 입력</option>
                              {heirsQuery.data.map((h: any) => (
                                <option key={h.id} value={h.id}>
                                  {h.nameKo} ({h.relationship})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">성명 *</label>
                            <Input
                              value={target.name}
                              onChange={(e) =>
                                updateTarget(target.id, "name", e.target.value)
                              }
                              placeholder="상속인 이름"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">관계 *</label>
                            <Input
                              value={target.relationship}
                              onChange={(e) =>
                                updateTarget(target.id, "relationship", e.target.value)
                              }
                              placeholder="예: 장남, 차녀"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">생년월일</label>
                            <Input
                              type="date"
                              value={target.birthDate}
                              onChange={(e) =>
                                updateTarget(target.id, "birthDate", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* 배제 사유 선택 */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            배제 사유 선택 *
                          </label>
                          <select
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={target.reason}
                            onChange={(e) =>
                              updateTarget(target.id, "reason", e.target.value)
                            }
                          >
                            <option value="">사유를 선택하세요</option>
                            {REASON_EXAMPLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 상세 사유 입력 */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            상세 사유 (구체적으로 기재할수록 법적 효력이 높아집니다) *
                          </label>
                          <Textarea
                            value={target.detailReason}
                            onChange={(e) =>
                              updateTarget(target.id, "detailReason", e.target.value)
                            }
                            placeholder="예: 장남 ○○○는 2015년부터 현재까지 약 10년간 연락을 완전히 끊고, 유언자의 부양 요청을 거부하였으며, 유언자의 병원비 및 생활비를 일체 부담하지 않았습니다. 또한 2018년에는 유언자 명의의 부동산을 무단으로 담보 설정하여 재산상 손해를 입혔습니다."
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 추가 의사 표시 */}
            <div>
              <h3 className="font-semibold text-[#1F3864] mb-3">추가 의사 표시 (선택)</h3>
              <Textarea
                value={additionalStatement}
                onChange={(e) => {
                  setAdditionalStatement(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="위 배제 대상자에 대한 추가적인 의사 표시가 있으면 자유롭게 기재하세요. 예: '상기 배제 대상자가 향후 태도를 개선하더라도 본 의사를 철회하지 않을 것임을 밝힙니다.'"
                rows={3}
              />
            </div>

            {/* 문서 하단 - 서명란 */}
            <div className="border-t pt-6 mt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  본인은 위 내용이 사실임을 확인하며, 자유로운 의사에 의하여
                  유류분 반환청구권 배제 의사를 표시합니다.
                </p>
                <div className="py-4">
                  <p className="text-sm text-gray-500">
                    {documentDate && new Date(documentDate).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex justify-center items-center gap-8 py-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">유언자 (작성자)</p>
                    <div className="mt-2 border-b-2 border-gray-400 w-40 mx-auto" />
                    <p className="text-xs text-gray-500 mt-1">
                      {testatorInfo.name || "(성명)"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">(인)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EverWill 인증 표시 (인쇄 시) */}
        <div className="hidden print:block mt-8 text-center text-xs text-gray-400 border-t pt-4">
          <p>본 문서는 EverWill 플랫폼에서 작성되었으며, 블록체인 해시로 무결성이 보장됩니다.</p>
          <p>문서 ID: EWRSE-{Date.now().toString(36).toUpperCase()}</p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={handleSaveDraft} className="gap-1">
          <Save className="w-4 h-4" />
          임시저장
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-1">
            <Printer className="w-4 h-4" />
            인쇄 / PDF 저장
          </Button>
          <Button className="gap-1 bg-[#1F3864] hover:bg-[#162d52]">
            <CheckCircle2 className="w-4 h-4" />
            문서 확정 및 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
