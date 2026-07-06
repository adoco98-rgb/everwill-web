/**
 * 6단계: 개인 전자서명 + 인증 결제
 * 서명 캔버스 + ₩99,000 결제 (Stripe/Toss)
 */
import { useState, useRef } from "react";
import { PenLine, CreditCard, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
}

export default function Step6Signature({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [paying, setPaying] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    if (!pos || !lastPos.current) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1F3864";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasSigned(true);
  };

  const endDraw = () => { setIsDrawing(false); lastPos.current = null; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handlePayment = async () => {
    if (!hasSigned) { toast.error("서명을 먼저 입력해주세요."); return; }
    if (!consent1 || !consent2) { toast.error("모든 동의 항목에 체크해주세요."); return; }

    setPaying(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: [{ key: "will_certification", quantity: 1 }],
          metadata: { type: "initial_certification" },
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("결제 페이지가 새 탭에서 열렸습니다.");
        // 결제 완료 후 다음 단계로 이동 (실제로는 webhook으로 처리)
        setTimeout(() => onComplete(), 2000);
      } else {
        toast.error("결제 페이지를 열 수 없습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch {
      toast.error("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-[#1F3864] to-[#2d4f8a] p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <PenLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">6단계: 전자서명 + 인증</h3>
            <p className="text-white/60 text-xs">서명 후 전자 인증을 완료하세요</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* 최종 확인 */}
        <div className="bg-[#1F3864]/5 rounded-xl p-4 space-y-2">
          <h4 className="text-sm font-bold text-[#1F3864] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            유언장 최종 확인
          </h4>
          <div className="space-y-1.5">
            {[
              "개인 인증 (신분증 + 셀피)",
              "자산 등록 완료",
              "상속자 등록 완료",
              "유언장 작성 완료",
              "상속 내용 입력 완료",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 전자 서명 */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <PenLine className="w-4 h-4" />
            전자 서명
          </h4>
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">아래 영역에 서명해 주세요</span>
              <button onClick={clearCanvas} className="text-xs text-red-400 hover:text-red-600">지우기</button>
            </div>
            <canvas
              ref={canvasRef}
              width={500}
              height={120}
              className="w-full cursor-crosshair touch-none bg-white"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          {hasSigned && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />서명 완료</p>}
        </div>

        {/* 동의 체크박스 */}
        <div className="space-y-3">
          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            consent1 ? "border-[#1F3864] bg-[#1F3864]/5" : "border-gray-200"
          }`}>
            <input type="checkbox" checked={consent1} onChange={(e) => setConsent1(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#1F3864]" />
            <div>
              <p className="text-sm font-medium text-gray-700">유언장 내용 확인 동의 (필수)</p>
              <p className="text-xs text-gray-400 mt-0.5">작성된 유언장의 내용을 모두 확인하였으며, 본인의 자유로운 의사에 따라 작성하였음을 확인합니다.</p>
            </div>
          </label>
          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            consent2 ? "border-[#1F3864] bg-[#1F3864]/5" : "border-gray-200"
          }`}>
            <input type="checkbox" checked={consent2} onChange={(e) => setConsent2(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#1F3864]" />
            <div>
              <p className="text-sm font-medium text-gray-700">전자 인증 서비스 이용 동의 (필수)</p>
              <p className="text-xs text-gray-400 mt-0.5">EverWill 전자 인증 서비스 이용약관 및 개인정보처리방침에 동의합니다.</p>
            </div>
          </label>
        </div>

        {/* 결제 정보 */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700">전자 인증 비용</span>
            <span className="text-xl font-bold text-[#1F3864]">₩99,000</span>
          </div>
          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />블록체인 해시 기록 (Polygon)</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />RFC 3161 타임스탬프 인증</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />EverWill 인증 카드 발급</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />PDF 유언장 발급</div>
          </div>
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={handlePayment}
          disabled={paying || !hasSigned || !consent1 || !consent2}
          className="w-full bg-[#C9A961] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#b8963a] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {paying ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />결제 처리 중...</>
          ) : (
            <><CreditCard className="w-4 h-4" />₩99,000 결제 후 인증 완료</>
          )}
        </button>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL 암호화 · 안전한 결제</span>
        </div>
      </div>
    </div>
  );
}
