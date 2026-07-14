/**
 * 자필 유언장 스캔 업로드 + AI 검증 페이지
 * 경로: /will/scan
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, CheckCircle2, XCircle, AlertCircle,
  Camera, FileImage, ArrowLeft, Sparkles, Shield
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { GradeGate } from "@/components/GradeGate";

interface VerificationResult {
  isHandwritten: boolean;
  hasFullText: boolean;
  hasDate: boolean;
  hasAddress: boolean;
  hasName: boolean;
  hasSeal: boolean;
  isReadable: boolean;
  overallValid: boolean;
  missingItems: string[];
  warnings: string[];
  summary: string;
}

export default function ScanVerifyPage() {
  const [, navigate] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const verifyScan = trpc.will.verifyScan.useMutation({
    onSuccess: (data) => {
      if (data.success && data.verification) {
        setResult(data.verification as VerificationResult);
        if (data.verification.overallValid) {
          toast.success("유언장 검증 완료! 법적 요건을 충족합니다.");
        } else {
          toast.warning("일부 항목을 보완해야 합니다.");
        }
      } else {
        toast.error("검증에 실패했습니다. 다시 시도해주세요.");
      }
    },
    onError: () => {
      toast.error("이미지 분석 중 오류가 발생했습니다.");
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    setSelectedFile(file);
    setResult(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      toast.error("이미지를 먼저 업로드해주세요.");
      return;
    }

    // Base64로 변환하여 전송
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      verifyScan.mutate({ imageUrl: base64 });
    };
    reader.readAsDataURL(selectedFile);
  };

  const CheckItem = ({ label, value }: { label: string; value: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${value ? "bg-green-50" : "bg-red-50"}`}>
      {value
        ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      }
      <span className={`text-sm font-medium ${value ? "text-green-800" : "text-red-700"}`}>{label}</span>
    </div>
  );

  return (
    <GradeGate requiredGrade="platinum" featureName="자필 유언 스캔" description="자필 유언장 스캔 인증은 플래티넷 이상 회원만 이용할 수 있습니다." mode="block">
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/write")} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">자필 유언장 AI 검증</h1>
            <p className="text-white/60 text-xs">한국 민법 제1066조 요건 자동 확인</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 안내 배너 */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">자필증서 유언 필수 요건 (민법 제1066조)</p>
            <p>전문 자필 · 연월일 · 주소 · 성명 · 날인 — 5가지 모두 충족해야 법적 효력이 발생합니다.</p>
          </div>
        </div>

        {/* 작성 가이드 + 예시 양식 */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowGuide(prev => !prev)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-[#1F3864] flex items-center gap-2">
              <span className="text-lg">📝</span>
              자필 유언장 작성법 + 예시 양식 보기
            </span>
            <span className="text-gray-400 text-sm">{showGuide ? "접기 ▲" : "펼치기 ▼"}</span>
          </button>

          {showGuide && (
            <div className="px-5 pb-5 space-y-5 border-t border-gray-100">
              {/* 5대 필수 요건 */}
              <div className="pt-4">
                <p className="text-sm font-bold text-[#1F3864] mb-3">✅ 민법 제1066조 — 5가지 필수 요건</p>
                <div className="space-y-2">
                  {[
                    { no: "①", title: "전문 자필", desc: "유언 내용 전체를 반드시 손으로 직접 씁니다. 타이핑·프린트 불가." },
                    { no: "②", title: "연월일 기재", desc: "작성 날짜를 정확히 씁니다. 예: 2026년 7월 14일 (연도·월·일 모두 필수)" },
                    { no: "③", title: "주소 기재", desc: "유언자의 현재 주소를 씁니다. 예: 경기도 안성시 ○○로 123" },
                    { no: "④", title: "성명 기재", desc: "유언자 본인의 이름을 씁니다." },
                    { no: "⑤", title: "날인 (서명 또는 도장)", desc: "이름 옆에 도장을 찍거나 자필 서명을 합니다. 둘 다 해도 됩니다." },
                  ].map(item => (
                    <div key={item.no} className="flex gap-3 p-3 bg-blue-50 rounded-xl">
                      <span className="font-bold text-[#1F3864] w-5 shrink-0">{item.no}</span>
                      <div>
                        <span className="font-semibold text-[#1F3864] text-sm">{item.title}</span>
                        <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 예시 양식 */}
              <div>
                <p className="text-sm font-bold text-[#1F3864] mb-3">📄 예시 양식 (이대로 손으로 쓰세요)</p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 font-mono text-sm leading-8 text-gray-800 whitespace-pre-line select-all">
{`유  언  장

본인 홍길동(1950년 1월 1일생)은 정신이 명료한 상태에서
다음과 같이 유언합니다.

1. 서울시 강남구 ○○아파트 101동 201호(시가 약 5억원)는
   장남 홍철수(1980년 3월 5일생)에게 상속합니다.

2. 국민은행 계좌(계좌번호 000-00-000000)의
   예금 전액은 배우자 김순이에게 상속합니다.

3. 나머지 재산은 자녀들이 균등하게 나눕니다.

위와 같이 유언합니다.

2026년 7월 14일
주소: 경기도 안성시 ○○로 123
성명: 홍 길 동  (인)`}
                </div>
                <p className="text-xs text-amber-700 mt-2 flex items-start gap-1">
                  <span>⚠️</span>
                  <span>위 양식을 참고하여 <strong>A4 흰 종이에 볼펜으로 직접 손으로</strong> 작성하세요. 수정 시 두 줄 긋고 옆에 날인.</span>
                </p>
              </div>

              {/* 자주 하는 실수 */}
              <div>
                <p className="text-sm font-bold text-red-600 mb-2">❌ 자주 하는 실수 (무효 원인)</p>
                <div className="space-y-1.5">
                  {[
                    "컴퓨터로 작성 후 서명만 손으로 → 무효",
                    "날짜를 '2026년 7월'만 쓰고 일(日) 생략 → 무효",
                    "주소 없이 이름과 도장만 → 무효",
                    "대리인이 대신 써줌 → 무효",
                    "연필로 작성 → 위조 위험, 법원에서 기피",
                  ].map((item, i) => (
                    <p key={i} className="text-xs text-red-600 flex gap-1.5">
                      <span>•</span>{item}
                    </p>
                  ))}
                </div>
              </div>

              {/* 팁 */}
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-700">
                  <strong>💡 팁:</strong> 작성 후 사진을 찍을 때 — 밝은 곳에서 정면으로, 그림자 없이 촬영하세요.
                  글씨가 선명하게 보여야 AI가 정확히 검증할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 업로드 영역 */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#C9A961] bg-[#C9A961]/5"
              : previewUrl
              ? "border-[#1F3864]/30 bg-white"
              : "border-gray-300 hover:border-[#1F3864]/50 hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          {previewUrl ? (
            <div className="space-y-3">
              <img
                src={previewUrl}
                alt="업로드된 유언장"
                className="max-h-80 mx-auto rounded-xl shadow-md object-contain"
              />
              <p className="text-sm text-gray-500">{selectedFile?.name}</p>
              <p className="text-xs text-[#1F3864] font-medium">클릭하여 다른 이미지로 교체</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <FileImage className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">유언장 사진을 업로드하세요</p>
                <p className="text-sm text-gray-400">드래그 앤 드롭 또는 클릭하여 선택</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, HEIC · 최대 10MB</p>
              </div>
              <div className="flex justify-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Camera className="w-3.5 h-3.5" />
                  카메라 촬영
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Upload className="w-3.5 h-3.5" />
                  파일 선택
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 검증 버튼 */}
        {selectedFile && (
          <button
            onClick={handleVerify}
            disabled={verifyScan.isPending}
            className="w-full bg-[#1F3864] hover:bg-[#162d52] disabled:opacity-60 text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            {verifyScan.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI가 유언장을 분석 중입니다...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AI 법적 요건 검증하기
              </>
            )}
          </button>
        )}

        {/* 검증 결과 */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* 종합 결과 */}
              <div className={`rounded-2xl p-5 ${result.overallValid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <div className="flex items-center gap-3 mb-3">
                  {result.overallValid
                    ? <CheckCircle2 className="w-7 h-7 text-green-600" />
                    : <XCircle className="w-7 h-7 text-red-500" />
                  }
                  <div>
                    <p className={`font-bold text-lg ${result.overallValid ? "text-green-800" : "text-red-700"}`}>
                      {result.overallValid ? "법적 요건 충족" : "보완 필요"}
                    </p>
                    <p className={`text-sm ${result.overallValid ? "text-green-700" : "text-red-600"}`}>
                      {result.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* 항목별 체크 */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-[#1F3864] mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  항목별 검증 결과
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <CheckItem label="자필 여부 (손으로 직접 작성)" value={result.isHandwritten} />
                  <CheckItem label="전문 기재 (유언 내용 전체 자필)" value={result.hasFullText} />
                  <CheckItem label="연월일 기재" value={result.hasDate} />
                  <CheckItem label="주소 기재" value={result.hasAddress} />
                  <CheckItem label="성명 기재" value={result.hasName} />
                  <CheckItem label="날인 (서명 또는 도장)" value={result.hasSeal} />
                  <CheckItem label="내용 판독 가능" value={result.isReadable} />
                </div>
              </div>

              {/* 누락 항목 */}
              {result.missingItems.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <p className="font-semibold text-red-700 text-sm mb-2 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    누락된 항목
                  </p>
                  {result.missingItems.map((item, i) => (
                    <p key={i} className="text-red-600 text-sm flex gap-1.5">
                      <span>•</span>{item}
                    </p>
                  ))}
                </div>
              )}

              {/* 주의사항 */}
              {result.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <p className="font-semibold text-amber-700 text-sm mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    주의사항
                  </p>
                  {result.warnings.map((w, i) => (
                    <p key={i} className="text-amber-700 text-sm flex gap-1.5">
                      <span>•</span>{w}
                    </p>
                  ))}
                </div>
              )}

              {/* 다음 단계 */}
              {result.overallValid && (
                <button
                  onClick={() => navigate("/payment")}
                  className="w-full bg-[#C9A961] hover:bg-[#b8954f] text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  인증 및 결제 진행하기 (₩168,000)
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 법적 고지 */}
        <p className="text-center text-xs text-gray-400 leading-relaxed">
          본 AI 검증은 참고용 정보 제공이며 법률 자문이 아닙니다.<br />
          최종 법적 효력 판단은 전문가에게 문의하시기 바랍니다.
        </p>
      </div>
    </div>
    </GradeGate>
  );
}
