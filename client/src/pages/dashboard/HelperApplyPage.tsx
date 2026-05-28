/**
 * 헬퍼(셀러) 신청 페이지
 * - 주민등록등본, 신분증, 통장사본 업로드
 * - AI OCR 자동 데이터 추출 후 확인
 * - 신청 완료 → 관리자 검토 대기
 */
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Upload, FileText, CreditCard, Building2,
  CheckCircle, Clock, XCircle, ChevronRight,
  Camera, AlertCircle, Info, Shield
} from "lucide-react";

type DocType = "resident" | "id_card" | "bankbook";

interface UploadedDoc {
  file: File;
  base64: string;
  preview: string;
}

const DOC_INFO = {
  resident: {
    label: "주민등록등본",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    hint: "정부24 또는 주민센터 발급 (3개월 이내)",
    accepts: "image/*,.pdf",
  },
  id_card: {
    label: "신분증 (앞면)",
    icon: CreditCard,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    hint: "주민등록증 또는 운전면허증 앞면",
    accepts: "image/*",
  },
  bankbook: {
    label: "통장 사본",
    icon: Building2,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    hint: "계좌번호, 은행명, 예금주가 보이는 통장 첫 페이지",
    accepts: "image/*,.pdf",
  },
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/jpeg;base64,... 에서 base64 부분만 추출
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function HelperApplyPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: myStatus, refetch } = trpc.helper.getMyStatus.useQuery();

  const [docs, setDocs] = useState<Partial<Record<DocType, UploadedDoc>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const fileInputRefs = {
    resident: useRef<HTMLInputElement>(null),
    id_card: useRef<HTMLInputElement>(null),
    bankbook: useRef<HTMLInputElement>(null),
  };

  const submitMutation = trpc.helper.submitApplication.useMutation({
    onSuccess: () => {
      toast.success("헬퍼 신청이 완료되었습니다. 검토 후 승인 알림을 드립니다.");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
      setSubmitting(false);
    },
  });

  const handleFileChange = async (docType: DocType, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    const base64 = await fileToBase64(file);
    const preview = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : "/pdf-icon.png";

    setDocs((prev) => ({
      ...prev,
      [docType]: { file, base64, preview },
    }));
  };

  const handleSubmit = async () => {
    if (!docs.resident || !docs.id_card || !docs.bankbook) {
      toast.error("3가지 서류를 모두 업로드해 주세요.");
      return;
    }
    if (!agreed) {
      toast.error("개인정보 수집·이용 동의가 필요합니다.");
      return;
    }
    setSubmitting(true);
    submitMutation.mutate({
      residentFileBase64: docs.resident.base64,
      residentFileName: docs.resident.file.name,
      idCardFileBase64: docs.id_card.base64,
      idCardFileName: docs.id_card.file.name,
      bankbookFileBase64: docs.bankbook.base64,
      bankbookFileName: docs.bankbook.file.name,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 이미 신청/승인된 경우
  if (myStatus) {
    const statusMap = {
      pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", label: "검토 중", desc: "관리자가 서류를 검토하고 있습니다. 승인 후 판매 코드가 발급됩니다." },
      approved: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "승인 완료", desc: "헬퍼로 승인되었습니다. 대시보드에서 판매 코드를 확인하세요." },
      rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "거절됨", desc: myStatus.helper.adminNote ?? "서류 검토 결과 승인이 어렵습니다. 다시 신청하실 수 있습니다." },
      suspended: { icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-50", label: "정지됨", desc: "계정이 정지되었습니다. 고객센터에 문의해 주세요." },
    };
    const s = statusMap[myStatus.helper.status];
    const Icon = s.icon;

    if (myStatus.helper.status === "approved") {
      navigate("/dashboard/helper");
      return null;
    }

    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className={`rounded-2xl border ${s.bg} p-8 text-center`}>
          <Icon className={`w-14 h-14 ${s.color} mx-auto mb-4`} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">신청 {s.label}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
          {myStatus.helper.status === "rejected" && (
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-[#1F3864] text-white rounded-xl text-sm font-semibold"
            >
              재신청하기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span>마이페이지</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1F3864] font-medium">헬퍼 신청</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1F3864]">EverWill 헬퍼 신청</h1>
        <p className="text-gray-500 text-sm mt-1">서비스 판매를 통해 커미션을 받으세요</p>
      </div>

      {/* 커미션 안내 */}
      <div className="bg-[#1F3864] rounded-2xl p-6 text-white">
        <h3 className="font-bold text-[#C9A961] mb-3">커미션 등급 안내</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { range: "기본", sales: "~500만원 미만", rate: "15%" },
            { range: "실버", sales: "500만~2,000만원", rate: "20%" },
            { range: "골드", sales: "2,000만~5,000만원", rate: "25%" },
            { range: "플래티넘", sales: "5,000만원 이상", rate: "30%" },
          ].map((tier) => (
            <div key={tier.range} className="bg-white/10 rounded-xl p-3">
              <div className="text-[#C9A961] font-bold text-lg">{tier.rate}</div>
              <div className="text-white/80 text-xs">{tier.range}</div>
              <div className="text-white/60 text-xs">{tier.sales}</div>
            </div>
          ))}
        </div>
        <p className="text-white/60 text-xs mt-3">* 누적 매출 기준 자동 등급 상향 · 3.3% 원천징수 후 지급</p>
      </div>

      {/* 서류 업로드 */}
      <div className="space-y-4">
        <h2 className="font-bold text-gray-800">서류 업로드 (3종 필수)</h2>

        {(["resident", "id_card", "bankbook"] as DocType[]).map((docType) => {
          const info = DOC_INFO[docType];
          const Icon = info.icon;
          const uploaded = docs[docType];

          return (
            <div key={docType} className={`rounded-xl border-2 ${uploaded ? "border-green-400 bg-green-50" : `${info.border} ${info.bg}`} p-4`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${uploaded ? "bg-green-100" : "bg-white"} flex items-center justify-center flex-shrink-0`}>
                  {uploaded ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Icon className={`w-6 h-6 ${info.color}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800">{info.label}</span>
                    {uploaded && (
                      <span className="text-xs text-green-600 font-medium">업로드 완료</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{info.hint}</p>

                  {uploaded && uploaded.file.type.startsWith("image/") && (
                    <img
                      src={uploaded.preview}
                      alt="미리보기"
                      className="mt-2 w-full max-h-32 object-cover rounded-lg border"
                    />
                  )}
                  {uploaded && !uploaded.file.type.startsWith("image/") && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="w-4 h-4" />
                      {uploaded.file.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {/* 카메라 촬영 (모바일) */}
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.capture = "environment";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleFileChange(docType, file);
                    };
                    input.click();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4" />
                  촬영
                </button>

                {/* 파일 선택 */}
                <button
                  onClick={() => fileInputRefs[docType].current?.click()}
                  className={`flex items-center gap-1.5 px-3 py-2 ${uploaded ? "bg-white border border-gray-200 text-gray-700" : `bg-[#1F3864] text-white`} rounded-lg text-xs font-medium hover:opacity-90`}
                >
                  <Upload className="w-4 h-4" />
                  {uploaded ? "다시 선택" : "파일 선택"}
                </button>

                <input
                  ref={fileInputRefs[docType]}
                  type="file"
                  accept={info.accepts}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(docType, file);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 개인정보 동의 */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#1F3864] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 mb-1">개인정보 수집·이용 동의 (필수)</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              수집 항목: 이름, 생년월일, 주소, 계좌정보 (주민등록등본·신분증·통장사본 OCR 추출)<br />
              수집 목적: 헬퍼 신청 심사, 커미션 지급, 원천징수 세금 신고<br />
              보유 기간: 계약 종료 후 5년 (세법 기준)<br />
              제3자 제공: 세무 신고 목적으로 국세청에 제공될 수 있습니다.
            </p>
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 accent-[#1F3864]"
              />
              <span className="text-sm text-gray-700 font-medium">위 내용에 동의합니다</span>
            </label>
          </div>
        </div>
      </div>

      {/* 안내 */}
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>서류 검토는 영업일 기준 1~3일 소요됩니다. 승인 완료 시 이메일 및 알림으로 안내드립니다.</p>
      </div>

      {/* 신청 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !docs.resident || !docs.id_card || !docs.bankbook || !agreed}
        className="w-full py-4 bg-[#1F3864] text-white rounded-xl font-bold text-base hover:bg-[#1a3057] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            서류 업로드 중...
          </span>
        ) : (
          "헬퍼 신청하기"
        )}
      </button>
    </div>
  );
}
