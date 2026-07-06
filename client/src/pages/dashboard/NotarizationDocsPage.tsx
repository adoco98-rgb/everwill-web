/**
 * 공증서류 등록 페이지
 * 유언공증에 필요한 서류를 업로드하고, 발급 사이트 바로가기 제공
 * 신분증/인감도장은 이미지 미리보기 기능 포함
 */
import { useState, useRef } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

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
}

interface UploadedDoc {
  fileName: string;
  uploadedAt: string;
  /** 이미지 미리보기 URL (blob URL) */
  previewUrl?: string;
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
        helpLink: { label: "정부24에서 발급", url: "https://www.gov.kr/mw/SS/PUBR/insertPublicForm.do?formId=CERT_BASIC" },
      },
      {
        id: "family_cert",
        name: "가족관계증명서 (상세)",
        description: "부모·배우자·자녀 등 가족관계 확인",
        required: true,
        helpLink: { label: "정부24에서 발급", url: "https://www.gov.kr/mw/SS/PUBR/insertPublicForm.do?formId=CERT_FAMILY" },
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
        id: "id_card",
        name: "신분증 사본",
        description: "주민등록증, 운전면허증, 여권 중 택1",
        required: true,
        needsPreview: true,
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
];

export default function NotarizationDocsPage() {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDoc>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>("testator");
  // 미리보기 모달 상태
  const [previewModal, setPreviewModal] = useState<{ docId: string; url: string; name: string } | null>(null);
  // 제출 전 미리보기 상태 (파일 선택 직후)
  const [pendingPreview, setPendingPreview] = useState<{
    docId: string;
    file: File;
    url: string;
    docName: string;
  } | null>(null);

  /** 이미지 파일 선택 시 미리보기 표시 (제출 전 확인) */
  const handleImageSelect = (docId: string, docName: string, file: File) => {
    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다. (JPG, PNG, HEIC)");
      return;
    }
    const url = URL.createObjectURL(file);
    setPendingPreview({ docId, file, url, docName });
  };

  /** 미리보기 확인 후 업로드 확정 */
  const handleConfirmUpload = () => {
    if (!pendingPreview) return;
    const { docId, file, url } = pendingPreview;
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: {
        fileName: file.name,
        uploadedAt: new Date().toLocaleString("ko-KR"),
        previewUrl: url,
      },
    }));
    toast.success(`${file.name} 업로드 완료`);
    setPendingPreview(null);
  };

  /** 미리보기 취소 (다시 선택) */
  const handleCancelPreview = () => {
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview.url);
    }
    setPendingPreview(null);
  };

  /** 일반 파일 업로드 (미리보기 불필요 항목) */
  const handleFileUpload = (docId: string, file: File) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: { fileName: file.name, uploadedAt: new Date().toLocaleString("ko-KR") },
    }));
    toast.success(`${file.name} 업로드 완료`);
  };

  const handleRemoveDoc = (docId: string) => {
    const doc = uploadedDocs[docId];
    if (doc?.previewUrl) {
      URL.revokeObjectURL(doc.previewUrl);
    }
    setUploadedDocs((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
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
          유언공증에 필요한 서류를 업로드해주세요. 발급이 필요한 서류는 바로가기 링크를 이용하세요.
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
          <p className="font-semibold mb-1">서류 발급 안내</p>
          <p className="text-blue-600 text-xs">
            대부분의 서류는 <a href="https://www.gov.kr" target="_blank" rel="noopener noreferrer" className="underline font-medium">정부24</a>에서 
            공동인증서(구 공인인증서)로 온라인 발급 가능합니다. 각 서류 옆 "발급받기" 버튼을 클릭하면 해당 사이트로 바로 이동합니다.
          </p>
        </div>
      </div>

      {/* 섹션별 서류 목록 */}
      <div className="space-y-4">
        {SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSection === section.id;
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
                          isUploaded ? "border-green-200 bg-green-50/50" : "border-gray-100 bg-gray-50/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#1F3864]">{doc.name}</span>
                              {doc.required && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">필수</span>
                              )}
                              {isUploaded && <Check className="w-4 h-4 text-green-500" />}
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
                                {/* 미리보기 가능한 항목은 확대 보기 버튼 */}
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
            <li>업로드된 서류는 암호화되어 안전하게 보관됩니다.</li>
          </ul>
        </div>
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
              {/* 닫기 버튼 */}
              <button
                onClick={() => setPreviewModal(null)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 text-sm"
              >
                <X className="w-4 h-4" />
                닫기
              </button>
              {/* 제목 */}
              <div className="mb-2">
                <span className="text-white/90 text-sm font-medium">{previewModal.name}</span>
              </div>
              {/* 이미지 */}
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
