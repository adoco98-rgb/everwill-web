/**
 * 공증서류 등록 페이지
 * 유언공증에 필요한 서류를 업로드하고, 발급 사이트 바로가기 제공
 * 모든 서류: AI 자동 분석 (선명도·서류종류·유효기간·필수항목)
 * 신분증/인감도장: 이미지 미리보기 기능 포함
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  ExternalLink,
  Check,
  AlertCircle,
  User,
  Info,
  X,
  File,
  ZoomIn,
  RotateCcw,
  Eye,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Users,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  helpLink?: { label: string; url: string };
  /** 이미지 미리보기가 필요한 항목 (신분증, 인감도장) */
  needsPreview?: boolean;
}

interface DocumentSection {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof User;
  color: string;
  bgColor: string;
  documents: DocumentItem[];
  alwaysExpanded?: boolean;
}

interface AnalysisResult {
  clarity: { status: string; message: string };
  docTypeMatch: { status: string; detectedType: string; message: string };
  validity: { status: string; issueDate: string | null; message: string };
  requiredElements: { status: string; found: string[]; missing: string[]; message: string };
  overallStatus: string;
  overallMessage: string;
  confidence: string;
}

interface ManualFormData {
  [key: string]: string;
}

interface UploadedDoc {
  fileName: string;
  uploadedAt: string;
  previewUrl?: string;
  analysis?: AnalysisResult;
  analyzing?: boolean;
  /** AI 분석 진행 단계 (0~4) */
  analysisStep?: number;
  /** AI 분석 실패 여부 */
  analysisFailed?: boolean;
  /** AI 분석 건너뛰기 (사용자가 수동 확인) */
  analysisSkipped?: boolean;
  /** 수동 입력 데이터 */
  manualData?: ManualFormData;
  /** 서버에 저장됨 */
  savedToServer?: boolean;
}

const SECTIONS: DocumentSection[] = [
  {
    id: "testator",
    title: "유언자 (본인)",
    subtitle: "상세본 요구되는 경우가 많음",
    icon: User,
    color: "text-[#1F3864]",
    bgColor: "bg-blue-50",
    documents: [
      {
        id: "basic_cert",
        name: "기본증명서 (상세)",
        description: "본인의 출생·사망·혼인 등 기본 신분사항",
        required: true,
        helpLink: { label: "전자가족관계등록시스템", url: "https://efamily.scourt.go.kr" },
      },
      {
        id: "family_cert",
        name: "가족관계증명서 (상세)",
        description: "부모·배우자·자녀 등 가족관계 확인",
        required: true,
        helpLink: { label: "전자가족관계등록시스템", url: "https://efamily.scourt.go.kr" },
      },
      {
        id: "resident_reg",
        name: "주민등록등본",
        description: "현재 주소지 및 세대원 확인",
        required: true,
        helpLink: { label: "정부24에서 발급", url: "https://www.gov.kr/mw/SS/PUBR/insertPublicForm.do?formId=CERT_RESIDENT" },
      },
      {
        id: "seal_cert",
        name: "인감증명서",
        description: "본인 인감 확인용 (발급 3개월 이내)",
        required: true,
        helpLink: { label: "정부24에서 발급", url: "https://www.gov.kr/mw/SS/PUBR/insertPublicForm.do?formId=CERT_SEAL" },
      },

      {
        id: "seal_stamp",
        name: "인감도장 날인",
        description: "인감증명서에 등록된 인감도장 날인 이미지",
        required: false,
        needsPreview: true,
      },
    ],
  },
  {
    id: "health",
    title: "건강증명서",
    subtitle: "유언 작성 당시 의사능력 증명용",
    icon: ShieldCheck,
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    alwaysExpanded: true,
    documents: [
      {
        id: "health_cert",
        name: "건강진단서",
        description: "유언 작성 당시 정신적·신체적 건강 상태 증명. 유언의 효력 강화에 도움이 됩니다.",
        required: false,
        helpLink: { label: "가까운 보건소 찾기", url: "https://www.mohw.go.kr/menu.es?mid=a10706010000" },
      },
      {
        id: "dementia_test",
        name: "치매 선별검사 결과서",
        description: "65세 이상 권장. 보건소 치매안심센터에서 무료 검사 가능합니다.",
        required: false,
        helpLink: { label: "치매안심센터 찾기", url: "https://www.nid.or.kr/info/center_list.aspx" },
      },
    ],
  },
  {
    id: "executor",
    title: "유언집행자",
    subtitle: "수증자 겨 가능",
    icon: Briefcase,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    alwaysExpanded: true,
    documents: [
      {
        id: "executor_family_cert",
        name: "가족관계증명서",
        description: "유언집행자의 가족관계 확인 (1통)",
        required: true,
        helpLink: { label: "전자가족관계등록시스템", url: "https://efamily.scourt.go.kr" },
      },
      {
        id: "executor_basic_cert",
        name: "기본증명서",
        description: "유언집행자의 기본 신분사항 확인 (1통)",
        required: true,
        helpLink: { label: "전자가족관계등록시스템", url: "https://efamily.scourt.go.kr" },
      },
      {
        id: "executor_resident",
        name: "주민등록등본",
        description: "유언집행자의 현재 주소지 확인 (1통)",
        required: true,
        helpLink: { label: "정부24에서 발급", url: "https://www.gov.kr/mw/SS/PUBR/insertPublicForm.do?formId=CERT_RESIDENT" },
      },
    ],
  },
  {
    id: "beneficiary",
    title: "수증자 (상속받는 자)",
    subtitle: "상속인 본인 확인용",
    icon: Users,
    color: "text-green-700",
    bgColor: "bg-green-50",
    alwaysExpanded: true,
    documents: [
      {
        id: "beneficiary_resident",
        name: "주민등록등본",
        description: "상속인의 현재 주소지 확인 (1통)",
        required: true,
        helpLink: { label: "정부24에서 발급", url: "https://www.gov.kr/mw/SS/PUBR/insertPublicForm.do?formId=CERT_RESIDENT" },
      },
    ],
  },
];

/** 파일을 base64 data URL로 변환 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const NOTARIZE_DRAFT_KEY = "everwill_notarization_docs_draft";

export default function NotarizationDocsPage() {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDoc>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>("testator");

  // 임시저장 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTARIZE_DRAFT_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.uploadedDocs && Object.keys(data.uploadedDocs).length > 0) {
          // previewUrl은 blob URL이므로 복원 불가 → 제거
          const cleaned: Record<string, UploadedDoc> = {};
          for (const [k, v] of Object.entries(data.uploadedDocs)) {
            cleaned[k] = { ...(v as UploadedDoc), previewUrl: undefined };
          }
          setUploadedDocs(cleaned);
        }
      }
    } catch { /* 무시 */ }
  }, []);

  // 임시저장 (업로드 상태 변경 시 자동)
  useEffect(() => {
    if (Object.keys(uploadedDocs).length === 0) return;
    try {
      const toSave: Record<string, any> = {};
      for (const [k, v] of Object.entries(uploadedDocs)) {
        // blob URL은 저장 불가
        toSave[k] = { ...v, previewUrl: undefined };
      }
      localStorage.setItem(NOTARIZE_DRAFT_KEY, JSON.stringify({ uploadedDocs: toSave, savedAt: new Date().toISOString() }));
    } catch { /* 무시 */ }
  }, [uploadedDocs]);
  // 미리보기 모달 상태
  const [previewModal, setPreviewModal] = useState<{ docId: string; url: string; name: string } | null>(null);
  // 제출 전 미리보기 상태 (이미지 파일 선택 직후)
  const [pendingPreview, setPendingPreview] = useState<{
    docId: string;
    file: File;
    url: string;
    docName: string;
  } | null>(null);

  // AI 분석 mutation
  const analyzeMutation = trpc.docAnalyze.analyzeDocument.useMutation();
  // 공증서류 서버 저장 mutation
  const uploadToServerMutation = trpc.notarizationDocs.upload.useMutation();
  const deleteFromServerMutation = trpc.notarizationDocs.delete.useMutation();
  // 서버에서 저장된 서류 목록 조회
  const { data: serverDocs, refetch: refetchServerDocs } = trpc.notarizationDocs.list.useQuery();
  // 서버 서류를 uploadedDocs에 합치
  useEffect(() => {
    if (serverDocs && serverDocs.length > 0) {
      const merged: Record<string, UploadedDoc> = {};
      for (const doc of serverDocs) {
        merged[doc.docId] = {
          fileName: doc.fileName,
          uploadedAt: new Date(doc.createdAt).toLocaleString("ko-KR"),
          previewUrl: doc.fileUrl,
          savedToServer: true,
        };
      }
      setUploadedDocs((prev) => ({ ...merged, ...prev }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverDocs]);

  /** AI 서류 분석 실행 */
  const runAnalysis = async (docId: string, file: File) => {
    // 분석 중 상태 + 단계 초기화
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], analyzing: true, analysisStep: 0 },
    }));

    // 단계별 진행 시뮬레이션 (실제 AI 호출과 병행)
    const stepTimers: NodeJS.Timeout[] = [];
    stepTimers.push(setTimeout(() => {
      setUploadedDocs((prev) => prev[docId]?.analyzing ? { ...prev, [docId]: { ...prev[docId], analysisStep: 1 } } : prev);
    }, 1500));
    stepTimers.push(setTimeout(() => {
      setUploadedDocs((prev) => prev[docId]?.analyzing ? { ...prev, [docId]: { ...prev[docId], analysisStep: 2 } } : prev);
    }, 3500));
    stepTimers.push(setTimeout(() => {
      setUploadedDocs((prev) => prev[docId]?.analyzing ? { ...prev, [docId]: { ...prev[docId], analysisStep: 3 } } : prev);
    }, 5500));

    try {
      const dataUrl = await fileToDataUrl(file);
      const result = await analyzeMutation.mutateAsync({
        imageUrl: dataUrl,
        expectedDocType: docId as any,
      });

      // 타이머 정리
      stepTimers.forEach(clearTimeout);

      if (result.success) {
        // 완료 단계 표시 후 결과 전환
        setUploadedDocs((prev) => ({
          ...prev,
          [docId]: { ...prev[docId], analysisStep: 4 },
        }));
        // 짧은 딜레이 후 결과 표시 (완료 애니메이션 보여주기)
        await new Promise((r) => setTimeout(r, 600));
        setUploadedDocs((prev) => ({
          ...prev,
          [docId]: { ...prev[docId], analysis: result.data as AnalysisResult, analyzing: false, analysisStep: undefined },
        }));

        const status = (result.data as AnalysisResult).overallStatus;
        if (status === "pass") {
          toast.success("AI 검증 통과! 서류가 정상입니다.");
        } else if (status === "warning") {
          toast.warning("AI 검증 주의사항이 있습니다. 아래 결과를 확인해주세요.");
        } else {
          toast.error("AI 검증 실패. 서류를 다시 확인해주세요.");
        }
      }
    } catch (error) {
      stepTimers.forEach(clearTimeout);
      setUploadedDocs((prev) => ({
        ...prev,
        [docId]: { ...prev[docId], analyzing: false, analysisStep: undefined, analysisFailed: true },
      }));
      toast.error("AI 분석에 실패했습니다. 재시도하거나 건너뛸 수 있습니다.");
    }
  };

  /** AI 분석 건너뛰기 → 수동 입력 폼 표시 */
  const handleSkipAnalysis = (docId: string) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], analysisFailed: false, analysisSkipped: true, manualData: {} },
    }));
    toast.info("AI 분석을 건너뛰었습니다. 필수 정보를 직접 입력해주세요.");
  };

  /** 수동 입력 폼 데이터 업데이트 */
  const handleManualDataChange = (docId: string, field: string, value: string) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        manualData: { ...(prev[docId]?.manualData || {}), [field]: value },
      },
    }));
  };

  /** 수동 입력 확인 완료 */
  const handleManualSubmit = (docId: string) => {
    toast.success("수동 입력이 저장되었습니다.");
  };

  /** AI 분석 재시도 */
  const handleRetryAnalysis = async (docId: string) => {
    const doc = uploadedDocs[docId];
    if (!doc) return;
    // previewUrl에서 blob을 다시 fetch하여 분석
    if (doc.previewUrl) {
      try {
        const resp = await fetch(doc.previewUrl);
        const blob = await resp.blob();
        const file = new globalThis.File([blob], doc.fileName, { type: blob.type });
        setUploadedDocs((prev) => ({
          ...prev,
          [docId]: { ...prev[docId], analysisFailed: false },
        }));
        runAnalysis(docId, file);
      } catch {
        toast.error("파일을 다시 읽을 수 없습니다. 재업로드해주세요.");
      }
    } else {
      toast.error("파일을 다시 업로드해주세요.");
    }
  };

  /** 이미지 파일 선택 시 미리보기 표시 (제출 전 확인) */
  const handleImageSelect = (docId: string, docName: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다. (JPG, PNG, HEIC)");
      return;
    }
    const url = URL.createObjectURL(file);
    setPendingPreview({ docId, file, url, docName });
  };

  /** 미리보기 확인 후 업로드 확정 + AI 분석 + 서버 저장 */
  const handleConfirmUpload = async () => {
    if (!pendingPreview) return;
    const { docId, file, url, docName } = pendingPreview;
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: {
        fileName: file.name,
        uploadedAt: new Date().toLocaleString("ko-KR"),
        previewUrl: url,
      },
    }));
    toast.success(`${file.name} 업로드 완료. AI 분석을 시작합니다...`);
    setPendingPreview(null);
    // 서버에 저장
    try {
      const dataUrl = await fileToDataUrl(file);
      await uploadToServerMutation.mutateAsync({
        docId,
        docName,
        fileName: file.name,
        fileSize: file.size,
        fileBase64: dataUrl,
        mimeType: file.type,
      });
      setUploadedDocs((prev) => ({ ...prev, [docId]: { ...prev[docId], savedToServer: true } }));
      refetchServerDocs();
    } catch {
      // 서버 저장 실패 시도 로컈 저장으로 대체
    }
    // AI 분석 실행
    runAnalysis(docId, file);
  };

  /** 미리보기 취소 */
  const handleCancelPreview = () => {
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview.url);
    }
    setPendingPreview(null);
  };

  /** 일반 파일 업로드 (미리보기 불필요 항목) + AI 분석 + 서버 저장 */
  const handleFileUpload = async (docId: string, file: File, docName?: string) => {
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: { fileName: file.name, uploadedAt: new Date().toLocaleString("ko-KR"), previewUrl },
    }));
    toast.success(`${file.name} 업로드 완료. AI 분석을 시작합니다...`);
    // 서버에 저장
    try {
      const dataUrl = await fileToDataUrl(file);
      await uploadToServerMutation.mutateAsync({
        docId,
        docName: docName || docId,
        fileName: file.name,
        fileSize: file.size,
        fileBase64: dataUrl,
        mimeType: file.type,
      });
      setUploadedDocs((prev) => ({ ...prev, [docId]: { ...prev[docId], savedToServer: true } }));
      refetchServerDocs();
    } catch {
      // 서버 저장 실패 시도 로컈 저장으로 대체
    }
    // AI 분석 실행
    runAnalysis(docId, file);
  };

  const handleRemoveDoc = async (docId: string) => {
    const doc = uploadedDocs[docId];
    if (doc?.previewUrl && !doc.savedToServer) {
      URL.revokeObjectURL(doc.previewUrl);
    }
    setUploadedDocs((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    // 서버에서도 삭제
    try {
      await deleteFromServerMutation.mutateAsync({ docId });
      refetchServerDocs();
    } catch { /* 무시 */ }
    toast.success("파일이 삭제되었습니다.");
  };

  const totalRequired = SECTIONS.flatMap((s) => s.documents).filter((d) => d.required).length;
  const uploadedRequired = SECTIONS.flatMap((s) => s.documents).filter((d) => d.required && uploadedDocs[d.id]).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1
          className="text-2xl font-bold text-[#1F3864]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          공증서류 등록
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          유언공증에 필요한 서류를 업로드해주세요. AI가 자동으로 서류를 분석하여 문제가 있으면 안내합니다.
        </p>
      </div>

      {/* 진행 상황 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#1F3864]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1F3864]">필수 서류 진행률</p>
            <p className="text-xs text-gray-400">{uploadedRequired} / {totalRequired} 완료</p>
          </div>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C9A961] rounded-full transition-all duration-500"
              style={{ width: `${totalRequired > 0 ? (uploadedRequired / totalRequired) * 100 : 0}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-bold text-[#C9A961]">
          {totalRequired > 0 ? Math.round((uploadedRequired / totalRequired) * 100) : 0}%
        </span>
      </div>

      {/* 안내 배너 */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">AI 자동 검증 안내</p>
          <p className="text-blue-600 text-xs">
            업로드된 서류는 AI가 자동으로 <strong>선명도, 서류 종류, 유효기간, 필수 항목</strong>을 검증합니다. 
            문제가 발견되면 즉시 안내해드리니 안심하고 업로드하세요.
          </p>
        </div>
      </div>

      {/* 섹션별 서류 목록 */}
      <div className="space-y-4">
        {SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = section.alwaysExpanded || expandedSection === section.id;
          const sectionUploaded = section.documents.filter((d) => uploadedDocs[d.id]).length;
          const sectionTotal = section.documents.length;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              {/* 섹션 헤더 */}
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                  <SectionIcon className={`w-5 h-5 ${section.color}`} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-[#1F3864] text-sm">{section.title}</h3>
                  <p className="text-xs text-gray-400">{section.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{sectionUploaded}/{sectionTotal}</span>
                  {sectionUploaded === sectionTotal && sectionTotal > 0 ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <ChevronIcon isExpanded={isExpanded} />
                  )}
                </div>
              </button>

              {/* 서류 목록 (펼침) */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-gray-50 pt-3">
                  {section.documents.map((doc) => {
                    const isUploaded = !!uploadedDocs[doc.id];
                    const uploadedDoc = uploadedDocs[doc.id];
                    return (
                      <div
                        key={doc.id}
                        className={`rounded-lg border p-4 transition-all ${
                          isUploaded
                            ? uploadedDoc?.analysis?.overallStatus === "fail"
                              ? "border-red-200 bg-red-50/50"
                              : uploadedDoc?.analysis?.overallStatus === "warning"
                              ? "border-amber-200 bg-amber-50/50"
                              : "border-green-200 bg-green-50/50"
                            : "border-gray-100 bg-gray-50/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#1F3864]">{doc.name}</span>
                              {doc.required && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">필수</span>
                              )}
                              {isUploaded && !uploadedDoc?.analyzing && uploadedDoc?.analysis?.overallStatus === "pass" && (
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                              )}
                              {isUploaded && !uploadedDoc?.analyzing && uploadedDoc?.analysis?.overallStatus === "warning" && (
                                <ShieldAlert className="w-4 h-4 text-amber-500" />
                              )}
                              {isUploaded && !uploadedDoc?.analyzing && uploadedDoc?.analysis?.overallStatus === "fail" && (
                                <ShieldX className="w-4 h-4 text-red-500" />
                              )}
                              {uploadedDoc?.analyzing && (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                            {doc.needsPreview && !isUploaded && (
                              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                이미지 선택 후 선명도를 확인할 수 있습니다
                              </p>
                            )}
                            {isUploaded && (
                              <div className="flex items-center gap-2 mt-2">
                                <File className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-xs text-green-700 font-medium">{uploadedDoc.fileName}</span>
                                <span className="text-xs text-gray-400">({uploadedDoc.uploadedAt})</span>
                                {uploadedDoc.previewUrl && (
                                  <button
                                    onClick={() => setPreviewModal({ docId: doc.id, url: uploadedDoc.previewUrl!, name: doc.name })}
                                    className="text-xs text-blue-500 hover:text-blue-700 ml-1 flex items-center gap-0.5"
                                  >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                    보기
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemoveDoc(doc.id)}
                                  className="text-xs text-red-400 hover:text-red-600 ml-2"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            {/* 업로드된 이미지 썸네일 미리보기 */}
                            {isUploaded && uploadedDoc.previewUrl && (
                              <div className="mt-3">
                                <div
                                  className="relative w-full max-w-[240px] h-[150px] rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                                  onClick={() => setPreviewModal({ docId: doc.id, url: uploadedDoc.previewUrl!, name: doc.name })}
                                >
                                  <img
                                    src={uploadedDoc.previewUrl}
                                    alt={doc.name}
                                    className="w-full h-full object-contain bg-gray-100"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* AI 분석 진행 상태 애니메이션 */}
                            {isUploaded && uploadedDoc?.analyzing && (
                              <AnalysisProgressAnimation step={uploadedDoc.analysisStep ?? 0} />
                            )}
                            {/* AI 분석 실패 시 재시도/건너뛰기 카드 */}
                            {isUploaded && uploadedDoc?.analysisFailed && !uploadedDoc?.analyzing && (
                              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                  <span className="text-xs font-bold text-red-700">AI 분석 실패</span>
                                </div>
                                <p className="text-xs text-red-600 mb-3">서버 오류로 분석을 완료하지 못했습니다. 다시 시도하거나, 분석 없이 진행할 수 있습니다.</p>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleRetryAnalysis(doc.id)}
                                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    다시 분석
                                  </button>
                                  <button
                                    onClick={() => handleSkipAnalysis(doc.id)}
                                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
                                  >
                                    분석 건너뛰기
                                  </button>
                                </div>
                              </div>
                            )}
                            {/* AI 분석 건너뛴 상태 → 수동 입력 폼 */}
                            {isUploaded && uploadedDoc?.analysisSkipped && !uploadedDoc?.analyzing && (
                              <ManualInputForm
                                docId={doc.id}
                                manualData={uploadedDoc.manualData || {}}
                                onChange={handleManualDataChange}
                                onSubmit={handleManualSubmit}
                              />
                            )}
                            {isUploaded && uploadedDoc?.analysis && !uploadedDoc?.analyzing && (
                              <AnalysisResultCard analysis={uploadedDoc.analysis} />
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {doc.helpLink && (
                              <a
                                href={doc.helpLink.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                {doc.helpLink.label}
                              </a>
                            )}
                            <label className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors font-medium ${
                              isUploaded
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-[#1F3864]/10 text-[#1F3864] hover:bg-[#1F3864]/20"
                            }`}>
                              <Upload className="w-3.5 h-3.5" />
                              {isUploaded ? "재업로드" : "업로드"}
                              <input
                                type="file"
                                accept={doc.needsPreview ? ".jpg,.jpeg,.png,.heic" : ".pdf,.jpg,.jpeg,.png,.heic"}
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (doc.needsPreview) {
                                      handleImageSelect(doc.id, doc.name, file);
                                    } else {
                                      handleFileUpload(doc.id, file);
                                    }
                                  }
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* 건강증명서 섹션 바로 아래 발급 안내 박스 */}
              {section.id === "health" && isExpanded && (
                <div className="px-5 pb-5">
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="w-full">
                        <p className="font-bold text-rose-800 text-sm mb-2">건강증명서 발급 안내</p>
                        <p className="text-xs text-rose-700 mb-3">
                          유언 작성 당시 의사능력(판단력)을 증명하는 건강증명서를 제출하면 유언의 효력이 강화됩니다.
                        </p>
                        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 mb-3">
                          <p className="font-bold text-amber-900 text-xs flex items-center gap-2">
                            <span>💡</span> 보건소 한 곳에서 두 가지 모두 발급 가능!
                          </p>
                          <p className="text-amber-800 text-xs mt-1">
                            가까운 보건소 방문 시 <strong>건강진단서</strong>와 <strong>치매 선별검사</strong>를 한 번에 받을 수 있습니다.
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 space-y-2 text-xs text-gray-700">
                          <p className="font-semibold text-gray-900">필요 서류 2가지:</p>
                          <ul className="space-y-2 ml-1">
                            <li className="flex items-start gap-2">
                              <span className="bg-rose-100 text-rose-700 font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs">1</span>
                              <div>
                                <strong>건강진단서</strong>
                                <p className="text-gray-500 mt-0.5">보건소 또는 가까운 병원·의원에서 발급 (보건소 비용: ₩3,000~5,000)</p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="bg-rose-100 text-rose-700 font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs">2</span>
                              <div>
                                <strong>치매 선별검사 결과서</strong> <span className="text-gray-400">(65세 이상 권장)</span>
                                <p className="text-gray-500 mt-0.5">보건소 치매안심센터에서 <strong className="text-green-700">무료</strong> 검사</p>
                              </div>
                            </li>
                          </ul>
                          <p className="text-gray-500 pt-2 border-t border-gray-100">
                            ※ 유언 작성일 기준 <strong>3개월 이내</strong> 발급된 서류를 제출해주세요.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">유의사항</p>
          <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
            <li>인감증명서는 발급일로부터 3개월 이내 것만 유효합니다.</li>
            <li>가족관계증명서·기본증명서는 "상세" 버전으로 발급해주세요.</li>
            <li>신분증 사본은 글자와 사진이 선명하게 보여야 합니다.</li>
            <li>주민등록번호 듷자리까지 모두 나오도록 발급해주세요. (등기사항전부증명서 제외)</li>
            <li>모든 서류는 반드시 <strong>원본</strong>을 스캔해야 합니다. (열람용 불가)</li>
            <li>전자인감증명서 제출 시: 공증 + 법무법인한미 제출용 + 자필서명 기재 필수</li>
            <li>업로드된 서류는 암호화되어 안전하게 보관됩니다.</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="font-semibold text-xs text-amber-800 mb-1">증인 및 유언집행자 자격 제한</p>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>미성년자는 증인 및 유언집행자가 될 수 없습니다.</li>
              <li>증인은 친인체 불가 (이해관계 없어야 함)</li>
              <li>금치산자, 한정치산자, 한정후견인, 성년후견인은 불가</li>
            </ul>
          </div>
        </div>
      </div>
      {/* ===== 저장 완료 / 다음 단계 버튼 ===== */}
      <div className="flex gap-3 justify-end mt-2">
        <button
          onClick={() => { refetchServerDocs(); toast.success("서류가 자동 저장되었습니다."); }}
          className="px-5 py-2.5 rounded-xl border border-[#1F3864] text-[#1F3864] font-semibold text-sm hover:bg-[#1F3864]/5 transition"
        >
          임시저장
        </button>
        <button
          onClick={() => window.location.href = '/dashboard/signature-cert'}
          className="px-6 py-2.5 rounded-xl bg-[#C9A961] text-white font-bold text-sm hover:bg-[#b8944e] transition flex items-center gap-2"
        >
          저장완료 → 다음 단계 (서명 인증)
        </button>
      </div>
      {/* ===== 미리보기 확인 모달 (파일 선택 직후) ===== */}
      <AnimatePresence>
        {pendingPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={handleCancelPreview}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#1F3864] text-base">{pendingPreview.docName} 미리보기</h3>
                  <p className="text-xs text-gray-500 mt-0.5">이미지가 선명하게 잘 찍혔는지 확인해주세요</p>
                </div>
                <button
                  onClick={handleCancelPreview}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* 이미지 미리보기 */}
              <div className="p-6">
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={pendingPreview.url}
                    alt="미리보기"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                </div>

                {/* 체크리스트 안내 */}
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-2">확인 사항</p>
                  <ul className="text-xs text-blue-700 space-y-1.5">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>글자가 선명하게 읽을 수 있나요?</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>이미지가 잘리거나 기울어지지 않았나요?</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>빛 반사나 그림자가 없나요?</span>
                    </li>
                  </ul>
                </div>

                {/* 파일 정보 */}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <File className="w-3.5 h-3.5" />
                  <span>{pendingPreview.file.name}</span>
                  <span className="text-gray-300">|</span>
                  <span>{(pendingPreview.file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              {/* 하단 버튼 */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
                <button
                  onClick={handleCancelPreview}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  다시 선택
                </button>
                <button
                  onClick={handleConfirmUpload}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1F3864] text-white text-sm font-medium hover:bg-[#1F3864]/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  이 이미지로 제출
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 확대 보기 모달 (업로드 완료 후) ===== */}
      <AnimatePresence>
        {previewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setPreviewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewModal(null)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 text-sm"
              >
                <X className="w-4 h-4" />
                닫기
              </button>
              <div className="mb-2">
                <span className="text-white/90 text-sm font-medium">{previewModal.name}</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-white shadow-2xl">
                <img
                  src={previewModal.url}
                  alt={previewModal.name}
                  className="w-full h-auto max-h-[75vh] object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 서류별 수동 입력 필드 정의 */
const MANUAL_FIELDS: Record<string, { label: string; placeholder: string; type?: string }[]> = {
  basic_cert: [
    { label: "성명", placeholder: "예: 홍길동" },
    { label: "생년월일", placeholder: "YYYY-MM-DD", type: "date" },
    { label: "등록기준지", placeholder: "예: 서울특별시 강남구" },
    { label: "발급일", placeholder: "YYYY-MM-DD", type: "date" },
    { label: "발급기관", placeholder: "예: 대한민국 법원" },
  ],
  family_cert: [
    { label: "성명", placeholder: "예: 홍길동" },
    { label: "등록기준지", placeholder: "예: 서울특별시 강남구" },
    { label: "가족 수", placeholder: "예: 4명" },
    { label: "발급일", placeholder: "YYYY-MM-DD", type: "date" },
    { label: "발급기관", placeholder: "예: 대한민국 법원" },
  ],
  resident_reg: [
    { label: "세대주 성명", placeholder: "예: 홍길동" },
    { label: "주소", placeholder: "현재 주소지" },
    { label: "세대원 수", placeholder: "예: 3명" },
    { label: "발급일", placeholder: "YYYY-MM-DD", type: "date" },
    { label: "발급기관", placeholder: "예: 안성시청" },
  ],
  seal_cert: [
    { label: "성명", placeholder: "예: 홍길동" },
    { label: "주민등록번호 앞자리", placeholder: "예: 800101" },
    { label: "주소", placeholder: "등록된 주소" },
    { label: "발급일", placeholder: "YYYY-MM-DD", type: "date" },
    { label: "발급기관", placeholder: "예: 안성시청" },
  ],
  id_card: [
    { label: "신분증 종류", placeholder: "예: 주민등록증 / 운전면허증 / 여권" },
    { label: "성명", placeholder: "예: 홍길동" },
    { label: "생년월일", placeholder: "YYYY-MM-DD", type: "date" },
    { label: "발급기관", placeholder: "예: 서울지방경찰청" },
  ],
  seal_stamp: [
    { label: "도장 종류", placeholder: "예: 인감도장 / 막도장" },
    { label: "도장 상태", placeholder: "예: 선명함 / 일부 번짐" },
  ],
};

/** 숫자 입력 시 자동 하이픈 삽입 (YYYY-MM-DD) */
function formatDateInput(raw: string): string {
  // 숫자만 추출
  const digits = raw.replace(/[^\d]/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

/** 날짜 형식 검증 함수 */
function validateDateField(value: string): { valid: boolean; message: string } {
  if (!value || value.trim().length === 0) {
    return { valid: true, message: "" }; // 빈 값은 검증 안 함
  }
  // YYYY-MM-DD 형식 체크
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return { valid: false, message: "YYYY-MM-DD 형식으로 입력해주세요 (예: 2024-03-15)" };
  }
  // 실제 유효한 날짜인지 확인
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { valid: false, message: "존재하지 않는 날짜입니다" };
  }
  // 미래 날짜 체크
  if (date > new Date()) {
    return { valid: false, message: "미래 날짜는 입력할 수 없습니다" };
  }
  // 너무 오래된 날짜 체크 (1900년 이전)
  if (year < 1900) {
    return { valid: false, message: "1900년 이전 날짜는 입력할 수 없습니다" };
  }
  return { valid: true, message: "" };
}

/** 수동 입력 폼 컴포넌트 */
function ManualInputForm({
  docId,
  manualData,
  onChange,
  onSubmit,
}: {
  docId: string;
  manualData: ManualFormData;
  onChange: (docId: string, field: string, value: string) => void;
  onSubmit: (docId: string) => void;
}) {
  const fields = MANUAL_FIELDS[docId] || [];

  // 모든 필드 채워졌는지 + 날짜 필드 유효성 확인
  const allFilled = fields.every((f) => (manualData[f.label] || "").trim().length > 0);
  const allDatesValid = fields
    .filter((f) => f.type === "date")
    .every((f) => validateDateField(manualData[f.label] || "").valid);
  const canSubmit = allFilled && allDatesValid;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-3 p-4 rounded-lg bg-amber-50 border border-amber-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-amber-600" />
        <span className="text-xs font-bold text-amber-800">수동 입력</span>
        <span className="text-[10px] text-amber-600 ml-auto">AI 분석 대신 직접 확인</span>
      </div>
      <p className="text-[11px] text-amber-700 mb-3">
        서류에 표시된 정보를 직접 입력해주세요. 정확한 정보 입력이 필요합니다.
      </p>
      <div className="space-y-2">
        {fields.map((field) => {
          const value = manualData[field.label] || "";
          const isDateField = field.type === "date";
          const dateValidation = isDateField ? validateDateField(value) : { valid: true, message: "" };
          const showError = isDateField && value.length > 0 && !dateValidation.valid;

          return (
            <div key={field.label}>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-medium text-gray-700 w-24 shrink-0">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={value}
                  maxLength={isDateField ? 10 : undefined}
                  onChange={(e) => {
                    const newVal = isDateField ? formatDateInput(e.target.value) : e.target.value;
                    onChange(docId, field.label, newVal);
                  }}
                  className={`flex-1 text-xs px-2.5 py-1.5 rounded-md border bg-white focus:outline-none focus:ring-1 transition-colors ${
                    showError
                      ? "border-red-300 focus:ring-red-300 focus:border-red-400"
                      : isDateField && value.length > 0 && dateValidation.valid
                      ? "border-green-300 focus:ring-green-300 focus:border-green-400"
                      : "border-gray-200 focus:ring-[#1F3864]/30 focus:border-[#1F3864]/50"
                  }`}
                />
              </div>
              {/* 날짜 검증 에러 메시지 */}
              {showError && (
                <div className="flex items-center gap-1 mt-0.5 ml-[104px]">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] text-red-500">{dateValidation.message}</span>
                </div>
              )}
              {/* 날짜 유효 확인 표시 */}
              {isDateField && value.length > 0 && dateValidation.valid && (
                <div className="flex items-center gap-1 mt-0.5 ml-[104px]">
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-green-600">유효한 날짜입니다</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onSubmit(docId)}
          disabled={!canSubmit}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
            canSubmit
              ? "bg-[#1F3864] text-white hover:bg-[#1F3864]/90"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          입력 완료
        </button>
        {!canSubmit && allFilled && !allDatesValid && (
          <span className="text-[10px] text-red-500">날짜 형식을 확인해주세요</span>
        )}
        {!allFilled && (
          <span className="text-[10px] text-gray-400">모든 항목을 입력해주세요</span>
        )}
      </div>
    </motion.div>
  );
}

/** AI 분석 진행 상태 애니메이션 컴포넌트 */
function AnalysisProgressAnimation({ step }: { step: number }) {
  const steps = [
    { label: "이미지 스캔 중...", icon: "scan" },
    { label: "선명도 분석 중...", icon: "clarity" },
    { label: "서류 종류 확인 중...", icon: "type" },
    { label: "유효기간 · 필수항목 검증 중...", icon: "verify" },
    { label: "분석 완료!", icon: "done" },
  ];

  const progress = Math.min(((step + 1) / steps.length) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
    >
      {/* 상단: AI 분석 중 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative w-5 h-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-blue-600"
          />
        </div>
        <span className="text-xs font-bold text-[#1F3864]">AI 서류 분석</span>
        <span className="text-[10px] text-blue-500 ml-auto font-medium">{Math.round(progress)}%</span>
      </div>

      {/* 프로그레스 바 */}
      <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* 단계별 체크리스트 */}
      <div className="space-y-1.5">
        {steps.map((s, i) => {
          const isActive = i === step;
          const isDone = i < step;
          const isPending = i > step;

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                opacity: isPending ? 0.4 : 1,
                x: isActive ? 2 : 0,
              }}
              className="flex items-center gap-2"
            >
              {/* 상태 아이콘 */}
              {isDone && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>
              )}
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </motion.div>
              )}
              {isPending && (
                <div className="w-4 h-4 rounded-full border border-gray-300 bg-white" />
              )}
              {/* 레이블 */}
              <span className={`text-[11px] ${
                isDone ? "text-green-700 font-medium" :
                isActive ? "text-blue-700 font-semibold" :
                "text-gray-400"
              }`}>
                {s.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/** AI 분석 결과 카드 컴포넌트 */
function AnalysisResultCard({ analysis }: { analysis: AnalysisResult }) {
  const statusConfig = {
    pass: { bg: "bg-green-50", border: "border-green-200", icon: ShieldCheck, iconColor: "text-green-600", label: "검증 통과", labelColor: "text-green-700" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: ShieldAlert, iconColor: "text-amber-600", label: "주의사항 있음", labelColor: "text-amber-700" },
    fail: { bg: "bg-red-50", border: "border-red-200", icon: ShieldX, iconColor: "text-red-600", label: "재업로드 필요", labelColor: "text-red-700" },
  };

  const config = statusConfig[analysis.overallStatus as keyof typeof statusConfig] || statusConfig.warning;
  const StatusIcon = config.icon;

  return (
    <div className={`mt-3 p-3 rounded-lg ${config.bg} border ${config.border}`}>
      {/* 전체 판정 */}
      <div className="flex items-center gap-2 mb-2">
        <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
        <span className={`text-xs font-bold ${config.labelColor}`}>{config.label}</span>
        <span className="text-[10px] text-gray-400 ml-auto">신뢰도: {analysis.confidence}</span>
      </div>
      <p className="text-xs text-gray-700 mb-3">{analysis.overallMessage}</p>

      {/* 4가지 항목 상세 */}
      <div className="grid grid-cols-2 gap-2">
        <AnalysisItem label="선명도" status={analysis.clarity.status} message={analysis.clarity.message} />
        <AnalysisItem label="서류 종류" status={analysis.docTypeMatch.status} message={analysis.docTypeMatch.message} />
        <AnalysisItem label="유효기간" status={analysis.validity.status} message={analysis.validity.message} />
        <AnalysisItem label="필수 항목" status={analysis.requiredElements.status} message={analysis.requiredElements.message} />
      </div>

      {/* 누락 항목 경고 */}
      {analysis.requiredElements.missing.length > 0 && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>누락 항목: {analysis.requiredElements.missing.join(", ")}</span>
        </div>
      )}
    </div>
  );
}

/** 개별 분석 항목 */
function AnalysisItem({ label, status, message }: { label: string; status: string; message: string }) {
  const dotColor = status === "pass" ? "bg-green-500" : status === "fail" ? "bg-red-500" : status === "warning" ? "bg-amber-500" : "bg-gray-400";
  return (
    <div className="flex items-start gap-1.5">
      <div className={`w-2 h-2 rounded-full ${dotColor} shrink-0 mt-1`} />
      <div>
        <span className="text-[10px] font-semibold text-gray-600">{label}</span>
        <p className="text-[10px] text-gray-500 leading-tight">{message}</p>
      </div>
    </div>
  );
}

/** 화살표 아이콘 */
function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
