/**
 * 유류분 배제 의사 표시서 작성 페이지
 * 유언자가 특정 상속인의 유류분 반환청구를 배제하는 의사를 문서화
 * 법적 필수 항목 강화: 주민등록번호, 구체적 사실관계, 인과관계, 철회불가 선언 등
 * 영상 증언 섹션 통합 (하단)
 */
import { useState, useEffect, useRef } from "react";
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
  Video,
  Camera,
  Play,
  Square,
  Upload,
  Clock,
  Mic,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

/** 배제 대상 상속인 정보 - 법적 필수 항목 포함 */
interface ExclusionTarget {
  id: string;
  // 기본 신원 정보
  name: string;
  idNumber: string;         // 주민등록번호 (앞 6자리-뒤 7자리)
  relationship: string;
  birthDate: string;
  address: string;
  // 배제 사유
  reason: string;
  // 구체적 사실관계 (날짜/장소/행위 분리)
  factDate: string;         // 사실 발생 날짜
  factPlace: string;        // 사실 발생 장소
  factContent: string;      // 구체적 행위 내용
  // 인과관계 설명
  causation: string;        // 위 사실과 배제 사유의 인과관계
  // 상세 사유 (종합)
  detailReason: string;
  // 증거 자료
  evidenceList: string;
  // 적용 법조항
  legalBasis: string;
}

/** 배제 사유 예시 목록 (민법 제1004조 상속결격 사유 + 실무 사유) */
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

/** 적용 법조항 */
const LEGAL_BASIS_OPTIONS = [
  "민법 제1004조 (상속결격) 준용",
  "민법 제1112조 (유류분의 권리자와 유류분)",
  "민법 제1113조 (유류분의 산정)",
  "민법 제1115조 (유류분의 보전)",
  "민법 제1118조 (준용규정)",
];

/** 임시저장 키 */
const DRAFT_KEY = "everwill_reserve_share_exclusion_draft";

/** 영상 녹화 상태 */
type RecordingState = "idle" | "recording" | "recorded" | "uploaded";

export default function ReserveShareExclusionPage() {
  const { user } = useAuth();
  // 상속자 목록 가져오기
  const heirsQuery = trpc.heirs.getMyHeirs.useQuery();
  // 가족관계증명서 추출 가족 목록
  const familyMembersQuery = trpc.familyMembers.getMyFamilyMembers.useQuery();

  // 유언자 기본정보 (자동 채움)
  const [testatorInfo, setTestatorInfo] = useState({
    name: "",
    idNumber: "",       // 주민등록번호
    birthDate: "",
    address: "",
    phone: "",
  });

  // 배제 대상 목록
  const [exclusionTargets, setExclusionTargets] = useState<ExclusionTarget[]>([]);

  // 추가 의사 표시 내용
  const [additionalStatement, setAdditionalStatement] = useState("");

  // 법적 확인 체크박스
  const [confirmFreeWill, setConfirmFreeWill] = useState(false);      // 자유로운 의사 확인
  const [confirmIrrevocable, setConfirmIrrevocable] = useState(false); // 철회불가 선언

  // 작성일
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // 임시저장 상태
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // 영상 증언 상태
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [videoScript, setVideoScript] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 서명 캔버스
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // 유언자 정보 자동 채움
  useEffect(() => {
    if (user) {
      const bd = user.birthDate || "";
      // 주민등록번호 앞 6자리 생성 (생년월일 YYYYMMDD → YYMMDD)
      const idPrefix = bd ? bd.replace(/-/g, "").slice(2) : "";
      setTestatorInfo({
        name: user.name || "",
        idNumber: idPrefix ? `${idPrefix}-*******` : "",
        birthDate: bd,
        address: (user as any).address || "",
        phone: (user as any).phone || "",
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
        if (data.confirmFreeWill) setConfirmFreeWill(data.confirmFreeWill);
        if (data.confirmIrrevocable) setConfirmIrrevocable(data.confirmIrrevocable);
        if (data.videoScript) setVideoScript(data.videoScript);
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
        confirmFreeWill,
        confirmIrrevocable,
        videoScript,
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
        idNumber: "",
        relationship: "",
        birthDate: "",
        address: "",
        reason: "",
        factDate: "",
        factPlace: "",
        factContent: "",
        causation: "",
        detailReason: "",
        evidenceList: "",
        legalBasis: "민법 제1004조 (상속결격) 준용",
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
              address: heir.address || "",
            }
          : t
      )
    );
    setIsDirty(true);
  };

  // 가족관계증명서 추출 가족에서 자동 채움
  const fillFromFamilyMember = (targetId: string, memberId: number) => {
    const member = familyMembersQuery.data?.find((m: any) => m.id === memberId);
    if (!member) return;
    setExclusionTargets(
      exclusionTargets.map((t) =>
        t.id === targetId
          ? {
              ...t,
              name: member.nameKo || "",
              relationship: member.relationship || "",
              birthDate: member.birthDate || "",
              address: member.address || "",
              idNumber: member.idFront ? `${member.idFront}-*******` : "",
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

  // 서명 캔버스 - 마우스/터치 시작
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startSign = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getCanvasPos(e, canvas);
  };

  const drawSign = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPos.current) return;
    const pos = getCanvasPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setHasSigned(true);
  };

  const endSign = () => {
    setIsDrawing(false);
    lastPos.current = null;
    const canvas = signatureCanvasRef.current;
    if (canvas && hasSigned) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearSign = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setSignatureDataUrl(null);
  };

  // ── 영상 증언 관련 함수 ──

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 기본 스크립트 생성
  const generateVideoScript = () => {
    const name = user?.name || "___";
    const date = new Date().toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const targetNames = exclusionTargets.map((t) => t.name || "___").join(", ");
    setVideoScript(
      `저는 ${name}입니다. 오늘 ${date}, 자유로운 의사에 의하여 다음과 같이 유류분 배제 사유를 진술합니다.\n\n` +
      `배제 대상: ${targetNames || "[배제 대상 이름]"}\n\n` +
      `[배제 사유를 구체적으로 진술하세요]\n\n` +
      `이러한 사유로 인하여 위 상속인에 대한 유류분 반환청구를 배제하고자 하는 의사를 명확히 밝힙니다.\n\n` +
      `본 영상은 어떠한 강압이나 협박 없이, 본인의 자유로운 의사에 의하여 촬영되었음을 확인합니다.\n\n` +
      `${date}\n${name}`
    );
    setIsDirty(true);
    toast.success("기본 스크립트가 생성되었습니다. 내용을 수정하세요.");
  };

  // 녹화 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        setRecordingState("recorded");
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      };
      mediaRecorder.start(1000);
      setRecordingState("recording");
      setVideoDuration(0);
      const interval = setInterval(() => setVideoDuration((prev) => prev + 1), 1000);
      setTimerInterval(interval);
    } catch {
      toast.error("카메라/마이크 접근이 거부되었습니다. 브라우저 설정을 확인하세요.");
    }
  };

  // 녹화 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // 재녹화
  const resetRecording = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingState("idle");
    setVideoDuration(0);
  };

  // 영상 저장 (로컬 상태 저장 - 실제 업로드는 추후 구현)
  const handleSaveVideo = () => {
    if (!recordedBlob) return;
    toast.success("영상 증언이 저장되었습니다. 문서 확정 시 함께 제출됩니다.");
    setRecordingState("uploaded");
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
            특정 상속인에 대한 유류분 반환청구 배제 의사를 법적 양식으로 문서화합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} className="gap-1">
            <Save className="w-4 h-4" />
            임시저장
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
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
              <p className="text-xs">(대법원 2006다29459 판례 참조)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 문서 본문 (인쇄 영역) ── */}
      <div className="print:p-8" id="exclusion-document">
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

            {/* ① 유언자 정보 */}
            <div>
              <h3 className="font-semibold text-[#1F3864] mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                유언자 (본인) 정보
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">성명 *</label>
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
                    <label className="text-xs text-gray-500 mb-1 block">
                      주민등록번호 *
                      <span className="text-gray-400 ml-1">(뒷자리는 * 처리됩니다)</span>
                    </label>
                    <Input
                      value={testatorInfo.idNumber}
                      onChange={(e) => {
                        setTestatorInfo({ ...testatorInfo, idNumber: e.target.value });
                        setIsDirty(true);
                      }}
                      placeholder="예: 750101-*******"
                      className="bg-white font-mono"
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
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">주소 *</label>
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
                    <label className="text-xs text-gray-500 mb-1 block">작성일 *</label>
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

            {/* ② 배제 대상 상속인 */}
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
                  <p className="text-gray-500 text-sm">유류분 배제 대상 상속인을 추가하세요.</p>
                  <Button variant="outline" size="sm" onClick={addTarget} className="mt-3 gap-1">
                    <Plus className="w-4 h-4" />
                    대상 추가
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {exclusionTargets.map((target, idx) => (
                    <Card key={target.id} className="border-red-100">
                      <CardContent className="pt-4 space-y-4">
                        {/* 카드 헤더 */}
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

                        {/* 불러오기 선택 영역 */}
                        <div className="space-y-2">
                          {/* 가족관계증명서 추출 가족 목록 */}
                          {familyMembersQuery.data && familyMembersQuery.data.length > 0 && (
                            <div>
                              <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                                가족관계증명서에서 선택 (이름·관계·생년월일·주소 자동 입력)
                              </label>
                              <select
                                className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm bg-blue-50/30"
                                onChange={(e) => {
                                  if (e.target.value) fillFromFamilyMember(target.id, Number(e.target.value));
                                }}
                                defaultValue=""
                              >
                                <option value="">-- 가족관계증명서에서 선택 --</option>
                                {familyMembersQuery.data.map((m: any) => (
                                  <option key={m.id} value={m.id}>
                                    {m.nameKo} ({m.relationship}){m.address ? " · 주소있음" : " · 주소없음"}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* 등록된 상속자에서 선택 */}
                          {heirsQuery.data && heirsQuery.data.length > 0 && (
                            <div>
                              <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                상속자 등록에서 선택 (선택사항)
                              </label>
                              <select
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                onChange={(e) => {
                                  if (e.target.value) fillFromHeir(target.id, Number(e.target.value));
                                }}
                                defaultValue=""
                              >
                                <option value="">-- 상속자 등록에서 선택 --</option>
                                {heirsQuery.data.map((h: any) => (
                                  <option key={h.id} value={h.id}>
                                    {h.nameKo} ({h.relationship})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* 가족 정보 없을 때 안내 */}
                          {(!familyMembersQuery.data || familyMembersQuery.data.length === 0) &&
                           (!heirsQuery.data || heirsQuery.data.length === 0) && (
                            <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded border border-dashed">
                              가족관계증명서를 업로드하면 가족 정보를 자동으로 불러올 수 있습니다.
                              <a href="/dashboard/family-document" className="text-blue-500 underline ml-1">업로드 하기 →</a>
                            </div>
                          )}
                        </div>

                        {/* 신원 정보 */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            신원 정보
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">성명 *</label>
                              <Input
                                value={target.name}
                                onChange={(e) => updateTarget(target.id, "name", e.target.value)}
                                placeholder="상속인 이름"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">
                                주민등록번호 *
                                <span className="text-gray-400 ml-1">(뒷자리 * 처리)</span>
                              </label>
                              <Input
                                value={target.idNumber}
                                onChange={(e) => updateTarget(target.id, "idNumber", e.target.value)}
                                placeholder="예: 850315-*******"
                                className="font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">관계 *</label>
                              <Input
                                value={target.relationship}
                                onChange={(e) => updateTarget(target.id, "relationship", e.target.value)}
                                placeholder="예: 장남, 차녀"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">생년월일</label>
                              <Input
                                type="date"
                                value={target.birthDate}
                                onChange={(e) => updateTarget(target.id, "birthDate", e.target.value)}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs text-gray-500 mb-1 block">배제 대상인 주소 (현재 거주지)</label>
                              <Input
                                value={target.address}
                                onChange={(e) => updateTarget(target.id, "address", e.target.value)}
                                placeholder="예: 서울시 강남구 테헤란로 123, 101동 201호"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 배제 사유 선택 */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">배제 사유 선택 *</label>
                          <select
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={target.reason}
                            onChange={(e) => updateTarget(target.id, "reason", e.target.value)}
                          >
                            <option value="">사유를 선택하세요</option>
                            {REASON_EXAMPLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>

                        {/* 구체적 사실관계 (날짜/장소/행위 분리) */}
                        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            구체적 사실관계 (법적 효력 강화)
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">
                                사실 발생 날짜 *
                              </label>
                              <Input
                                type="date"
                                value={target.factDate}
                                onChange={(e) => updateTarget(target.id, "factDate", e.target.value)}
                                className="bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">
                                사실 발생 장소 *
                              </label>
                              <Input
                                value={target.factPlace}
                                onChange={(e) => updateTarget(target.id, "factPlace", e.target.value)}
                                placeholder="예: 서울시 강남구 자택, 서울아산병원"
                                className="bg-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              구체적 행위 내용 *
                              <span className="text-gray-400 ml-1">(날짜·장소·행위를 명확히 기재)</span>
                            </label>
                            <Textarea
                              value={target.factContent}
                              onChange={(e) => updateTarget(target.id, "factContent", e.target.value)}
                              placeholder="예: 2015년 3월부터 현재까지 약 10년간 연락을 완전히 끊고, 유언자의 부양 요청을 거부하였으며, 2018년 4월에는 유언자 명의의 부동산(서울시 ○○구 ○○동 ○○번지)을 무단으로 담보 설정하여 재산상 손해를 입혔습니다."
                              rows={3}
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              인과관계 설명 *
                              <span className="text-gray-400 ml-1">(위 사실과 배제 사유의 관련성)</span>
                            </label>
                            <Textarea
                              value={target.causation}
                              onChange={(e) => updateTarget(target.id, "causation", e.target.value)}
                              placeholder="예: 위와 같은 행위는 민법 제1004조의 상속결격 사유에 준하는 중대한 의무 위반으로, 유언자에게 심각한 정신적·재산적 손해를 입혔으며, 이로 인해 유언자는 해당 상속인에 대한 유류분 반환청구권을 배제하고자 합니다."
                              rows={3}
                              className="bg-white"
                            />
                          </div>
                        </div>

                        {/* 상세 사유 (종합) */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            종합 상세 사유
                            <span className="text-gray-400 ml-1">(위 내용을 종합한 최종 진술)</span>
                          </label>
                          <Textarea
                            value={target.detailReason}
                            onChange={(e) => updateTarget(target.id, "detailReason", e.target.value)}
                            placeholder="위 구체적 사실관계를 바탕으로 종합적인 배제 사유를 기재하세요."
                            rows={3}
                          />
                        </div>

                        {/* 증거 자료 목록 */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            증거 자료 목록 (보유 자료 기재)
                          </label>
                          <Textarea
                            value={target.evidenceList}
                            onChange={(e) => updateTarget(target.id, "evidenceList", e.target.value)}
                            placeholder="예:
1. 카카오톡 대화 내역 (2015.03~2024.12)
2. 병원 입원 기록 (2020.05, 서울아산병원)
3. 부동산 무단 담보 설정 등기부등본
4. 경찰 신고 접수증 (2022.12)"
                            rows={3}
                          />
                        </div>

                        {/* 적용 법조항 */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">적용 법조항</label>
                          <select
                            value={target.legalBasis}
                            onChange={(e) => updateTarget(target.id, "legalBasis", e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20"
                          >
                            {LEGAL_BASIS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* ③ 추가 의사 표시 */}
            <div>
              <h3 className="font-semibold text-[#1F3864] mb-3">추가 의사 표시 (선택)</h3>
              <Textarea
                value={additionalStatement}
                onChange={(e) => {
                  setAdditionalStatement(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="위 배제 대상자에 대한 추가적인 의사 표시가 있으면 자유롭게 기재하세요."
                rows={3}
              />
            </div>

            {/* ④ 법적 확인 체크박스 */}
            <div className="border border-[#1F3864]/20 rounded-lg p-5 bg-[#1F3864]/5 space-y-4">
              <h3 className="font-semibold text-[#1F3864] flex items-center gap-2">
                <Shield className="w-4 h-4" />
                법적 확인 사항 (필수)
              </h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmFreeWill}
                  onChange={(e) => {
                    setConfirmFreeWill(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="mt-1 w-4 h-4 accent-[#1F3864]"
                />
                <span className="text-sm text-gray-700">
                  <strong>자유로운 의사 확인:</strong> 본인은 위 내용이 사실임을 확인하며,
                  어떠한 강압·협박·기망 없이 자유로운 의사에 의하여 유류분 반환청구권 배제 의사를 표시합니다.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmIrrevocable}
                  onChange={(e) => {
                    setConfirmIrrevocable(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="mt-1 w-4 h-4 accent-[#1F3864]"
                />
                <span className="text-sm text-gray-700">
                  <strong>철회불가 선언:</strong> 본인은 위 배제 의사 표시가 본인의 최종적이고
                  확정적인 의사임을 선언하며, 향후 배제 대상자의 태도 변화 여부와 무관하게
                  이를 철회하지 않을 것임을 밝힙니다.
                </span>
              </label>
            </div>

            {/* ⑤ 서명란 */}
            <div className="border-t pt-6 mt-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  본인은 위 내용이 사실임을 확인하며, 자유로운 의사에 의하여
                  유류분 반환청구권 배제 의사를 표시합니다.
                </p>
                <p className="text-sm text-gray-500 text-center">
                  {documentDate && new Date(documentDate).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {/* 서명 캔버스 */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-medium text-[#1F3864]">
                    유언자 서명 — {testatorInfo.name || "(성명)"}
                  </p>
                  <div className="relative border-2 border-gray-300 rounded-lg bg-white cursor-crosshair"
                    style={{ touchAction: 'none' }}
                  >
                    <canvas
                      ref={signatureCanvasRef}
                      width={400}
                      height={140}
                      className="block rounded-lg"
                      onMouseDown={startSign}
                      onMouseMove={drawSign}
                      onMouseUp={endSign}
                      onMouseLeave={endSign}
                      onTouchStart={startSign}
                      onTouchMove={drawSign}
                      onTouchEnd={endSign}
                    />
                    {!hasSigned && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-gray-300 text-sm select-none">
                          이곳에 서명하세요
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSign}
                      className="gap-1 text-gray-500"
                    >
                      <Trash2 className="w-3 h-3" />
                      서명 지우기
                    </Button>
                    {hasSigned && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const canvas = signatureCanvasRef.current;
                          if (!canvas) return;
                          setSignatureDataUrl(canvas.toDataURL('image/png'));
                          toast.success("서명이 저장되었습니다.");
                        }}
                        className="gap-1 bg-[#1F3864] hover:bg-[#162d52]"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        서명 확정
                      </Button>
                    )}
                  </div>
                  {signatureDataUrl && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      서명이 확정되었습니다.
                    </p>
                  )}
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

      {/* ── 영상 증언 섹션 ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3 border-b pb-3">
          <Video className="w-6 h-6 text-[#1F3864]" />
          <div>
            <h2 className="text-lg font-bold text-[#1F3864]">유류분 배제 영상 증언 (선택)</h2>
            <p className="text-sm text-gray-500">
              영상으로 배제 사유를 직접 진술하면 법적 증거력이 강화됩니다.
            </p>
          </div>
        </div>

        {/* 영상 안내 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 space-y-1">
                <p className="font-semibold">영상 증언 촬영 안내</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>밝은 조명 아래에서 얼굴이 명확히 보이도록 촬영하세요</li>
                  <li>신분증을 카메라에 보여주면 본인 확인에 도움이 됩니다</li>
                  <li>스크립트를 미리 작성하고, 천천히 명확하게 읽어주세요</li>
                  <li>배제 사유를 구체적으로 진술할수록 법적 효력이 높아집니다</li>
                  <li>촬영 시 날짜와 본인 이름을 반드시 말씀하세요</li>
                  <li>강압이나 협박 없이 자유의사임을 마지막에 확인하세요</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 스크립트 작성 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1F3864]" />
                증언 스크립트 작성
              </CardTitle>
              <Button variant="outline" size="sm" onClick={generateVideoScript} className="text-xs">
                기본 양식 생성
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">
              녹화 전에 스크립트를 미리 작성하세요. 녹화 중 화면 아래에 표시됩니다.
            </p>
            <Textarea
              value={videoScript}
              onChange={(e) => {
                setVideoScript(e.target.value);
                setIsDirty(true);
              }}
              placeholder="증언할 내용을 미리 작성하세요. '기본 양식 생성' 버튼을 누르면 템플릿이 제공됩니다."
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-400">
              * 스크립트는 참고용입니다. 녹화 시 자연스럽게 말씀하셔도 됩니다.
            </p>
          </CardContent>
        </Card>

        {/* 영상 녹화 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#1F3864]" />
              영상 녹화
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 비디오 화면 */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {recordingState === "idle" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <Camera className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-400">녹화 시작 버튼을 누르세요</p>
                </div>
              )}
              {recordingState === "recording" && (
                <>
                  <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-sm font-mono bg-black/50 px-2 py-1 rounded">
                      REC {formatTime(videoDuration)}
                    </span>
                  </div>
                  {videoScript && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 max-h-32 overflow-y-auto">
                      <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                        {videoScript}
                      </p>
                    </div>
                  )}
                </>
              )}
              {(recordingState === "recorded" || recordingState === "uploaded") && recordedUrl && (
                <video src={recordedUrl} className="w-full h-full object-cover" controls playsInline />
              )}
            </div>

            {/* 녹화 컨트롤 */}
            <div className="flex items-center justify-center gap-4">
              {recordingState === "idle" && (
                <Button
                  onClick={startRecording}
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white px-6"
                  size="lg"
                >
                  <Play className="w-5 h-5" />
                  녹화 시작
                </Button>
              )}
              {recordingState === "recording" && (
                <Button
                  onClick={stopRecording}
                  className="gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6"
                  size="lg"
                >
                  <Square className="w-5 h-5" />
                  녹화 중지 ({formatTime(videoDuration)})
                </Button>
              )}
              {recordingState === "recorded" && (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetRecording} className="gap-1">
                    <Camera className="w-4 h-4" />
                    다시 녹화
                  </Button>
                  <Button
                    className="gap-1 bg-[#1F3864] hover:bg-[#162d52]"
                    onClick={handleSaveVideo}
                  >
                    <Upload className="w-4 h-4" />
                    영상 저장 및 제출
                  </Button>
                </div>
              )}
              {recordingState === "uploaded" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">영상 증언이 저장되었습니다.</span>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!recordedUrl) return;
                        const a = document.createElement("a");
                        a.href = recordedUrl;
                        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
                        a.download = `유류분배제영상증언_${dateStr}.webm`;
                        a.click();
                        toast.success("영상 파일 다운로드를 시작합니다.");
                      }}
                      className="gap-1 text-[#1F3864] border-[#1F3864]/30 hover:bg-[#1F3864]/5"
                    >
                      <Upload className="w-4 h-4" />
                      파일 다운로드
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetRecording}
                      className="gap-1 text-amber-600 border-amber-300 hover:bg-amber-50"
                    >
                      <Camera className="w-4 h-4" />
                      다시 녹화 (변경)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
                        setRecordedBlob(null);
                        setRecordedUrl(null);
                        setRecordingState("idle");
                        setVideoDuration(0);
                        toast.success("영상이 삭제되었습니다.");
                      }}
                      className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      영상 삭제
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 녹화 정보 */}
            {recordingState === "recorded" && (
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  녹화 시간: {formatTime(videoDuration)}
                </span>
                <span className="flex items-center gap-1">
                  <Mic className="w-4 h-4" />
                  음성 포함
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 영상 법적 안내 */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 space-y-1">
                <p className="font-semibold">영상 증언 법적 안내</p>
                <p>
                  본 영상 증언은 유류분 배제 의사 표시서의 보충 증거로 활용됩니다.
                  영상 자체만으로 유류분 반환청구를 완전히 차단할 수는 없으나,
                  유언자의 명확한 의사를 증명하는 강력한 증거가 됩니다.
                </p>
                <p className="text-xs mt-2">
                  * 유류분 배제 문서와 함께 제출하면 효력이 극대화됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <Button
            className="gap-1 bg-[#1F3864] hover:bg-[#162d52]"
            disabled={!confirmFreeWill || !confirmIrrevocable}
            onClick={() => {
              if (!confirmFreeWill || !confirmIrrevocable) {
                toast.error("법적 확인 사항 두 항목을 모두 체크해야 문서를 확정할 수 있습니다.");
                return;
              }
              handleSaveDraft();
              toast.success("문서가 확정 저장되었습니다.");
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            문서 확정 및 저장
          </Button>
        </div>
      </div>

      {/* 확정 버튼 안내 */}
      {(!confirmFreeWill || !confirmIrrevocable) && (
        <p className="text-xs text-center text-amber-600">
          * 문서 확정을 위해 위 "법적 확인 사항" 두 항목을 모두 체크하세요.
        </p>
      )}
    </div>
  );
}
