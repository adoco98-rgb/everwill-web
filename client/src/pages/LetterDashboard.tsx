/**
 * 유서 대시보드 — 작성한 유서 목록 + 열람/프린트/우편 결제 모달
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Heart, Plus, FileText, Users, Printer, Mail, Lock,
  ChevronRight, Clock, CheckCircle, Loader2, Package
} from "lucide-react";

// 상태 레이블
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:    { label: "작성 중",   color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  paid:     { label: "보관 중",   color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  archived: { label: "보관 완료", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
};

export default function LetterDashboard() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: letters, isLoading, refetch } = trpc.farewell.list.useQuery();
  const paymentMutation = trpc.farewell.createPaymentSession.useMutation();
  const viewPaymentMutation = trpc.farewell.createViewPaymentSession.useMutation();
  const postalPaymentMutation = trpc.farewell.createMailPaymentSession.useMutation();

  // 모달 상태
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [modalType, setModalType] = useState<"view" | "postal" | null>(null);
  const [paying, setPaying] = useState(false);

  // 로그인 체크
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="w-12 h-12 text-[#C9A961] mx-auto" />
          <p className="text-white text-lg">로그인 후 이용 가능합니다</p>
          <Button onClick={() => window.location.href = "/login"}
            className="bg-[#C9A961] hover:bg-[#b8944d] text-[#1F3864]">
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  // 결제 처리
  const handlePay = async (type: "view" | "postal") => {
    if (!selectedLetter) return;
    setPaying(true);
    try {
      let url: string | null = null;
      if (type === "view") {
        const res = await viewPaymentMutation.mutateAsync({
          letterId: selectedLetter.id,
          recipientId: 0,
          origin: window.location.origin,
        });
        url = res.url;
      } else {
        const res = await postalPaymentMutation.mutateAsync({
          letterId: selectedLetter.id,
          recipientId: 0,
          origin: window.location.origin,
        });
        url = res.url;
      }
      if (url) {
        toast.success("결제 페이지로 이동합니다");
        window.open(url, "_blank");
      }
      setModalType(null);
    } catch (err: any) {
      toast.error("결제 오류: " + err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#C9A961]" />
            <h1 className="text-lg font-bold text-white">나의 유서</h1>
          </div>
          <Button onClick={() => navigate("/letter/write")}
            className="bg-[#C9A961] hover:bg-[#b8944d] text-[#1F3864] font-bold text-sm">
            <Plus className="w-4 h-4 mr-1" /> 새 유서 작성
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 안내 배너 */}
        <div className="bg-[#1F3864]/50 border border-[#C9A961]/20 rounded-xl p-4 space-y-1">
          <p className="text-[#C9A961] font-bold text-sm">유서란 무엇인가요?</p>
          <p className="text-white/60 text-xs leading-relaxed">
            유서는 자산 배분과 무관하게 <strong className="text-white">누구나</strong> 작성할 수 있는 감성적 작별 메시지입니다.
            사랑하는 가족에게 마지막 인사, 삶의 지혜, 특별한 부탁을 남길 수 있습니다.
            사망 후 지정한 수신자에게 자동으로 알림이 전달됩니다.
          </p>
        </div>

        {/* 가격 안내 카드 */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: FileText, label: "작성·보관", price: "₩9,900", color: "text-[#C9A961]", desc: "최초 1회" },
            { icon: Printer,  label: "열람·프린트", price: "₩6,900", color: "text-blue-400", desc: "수신자 결제" },
            { icon: Package,  label: "우편 발송", price: "₩19,900", color: "text-purple-400", desc: "수신자 결제" },
          ].map(item => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
              <p className="text-white text-xs font-bold">{item.price}</p>
              <p className="text-white/50 text-xs">{item.label}</p>
              <p className="text-white/30 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 수정 안내 */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/50">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>유서 수정 시 ₩4,900이 부과됩니다 (내용 변경 횟수 무제한)</span>
        </div>

        {/* 유서 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#C9A961] animate-spin" />
          </div>
        ) : !letters || letters.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Heart className="w-12 h-12 text-white/20 mx-auto" />
            <p className="text-white/40">아직 작성한 유서가 없습니다</p>
            <Button onClick={() => navigate("/letter/write")}
              className="bg-[#C9A961] hover:bg-[#b8944d] text-[#1F3864] font-bold">
              첫 유서 작성하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {letters.map((letter: any) => {
              const statusInfo = STATUS_MAP[letter.status] ?? STATUS_MAP.draft;
              return (
                <div key={letter.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{letter.title}</h3>
                      <p className="text-white/40 text-xs mt-0.5">
                        {new Date(letter.createdAt).toLocaleDateString("ko-KR")} 작성
                      </p>
                    </div>
                    <Badge className={`text-xs border ml-2 flex-shrink-0 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* 작성 단계 진행 표시 */}
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(n => {
                      const key = `step${n}Content` as keyof typeof letter;
                      const filled = letter[key] && String(letter[key]).trim().length > 0;
                      return (
                        <div key={n} className={`h-1 flex-1 rounded-full ${filled ? "bg-[#C9A961]" : "bg-white/10"}`} />
                      );
                    })}
                  </div>

                  {/* 수신자 정보 */}
                  <div className="flex items-center gap-1 text-xs text-white/40 mb-3">
                    <Users className="w-3 h-3" />
                    <span>{letter.recipientMode === "all" ? "전체 공개" : "특정인 지정"}</span>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    {letter.status === "draft" && (
                      <Button onClick={() => navigate(`/letter/write?id=${letter.id}`)}
                        size="sm" variant="outline"
                        className="flex-1 border-[#C9A961]/30 text-[#C9A961] hover:bg-[#C9A961]/10 bg-transparent text-xs">
                        이어서 작성 <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                    {letter.status === "paid" && (
                      <>
                        <Button onClick={() => { setSelectedLetter(letter); setModalType("view"); }}
                          size="sm" variant="outline"
                          className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent text-xs">
                          <Printer className="w-3 h-3 mr-1" /> 열람·프린트
                        </Button>
                        <Button onClick={() => { setSelectedLetter(letter); setModalType("postal"); }}
                          size="sm" variant="outline"
                          className="flex-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent text-xs">
                          <Mail className="w-3 h-3 mr-1" /> 우편 발송
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 열람·프린트 모달 ─────────────────────────────────── */}
      <Dialog open={modalType === "view"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-[#0f1729] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Printer className="w-5 h-5 text-blue-400" /> 열람 및 프린트
            </DialogTitle>
            <DialogDescription className="text-white/50">
              수신자가 유서를 열람하고 프린트할 수 있습니다
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">열람·프린트 이용권</span>
                <span className="text-white font-bold">₩6,900</span>
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>사망 후 알림 발송</span>
                <span className="text-emerald-400">무료</span>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-white/60">
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-400" /> 유서 전문 열람</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-400" /> PDF 다운로드 및 프린트</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-400" /> 첨부 파일·사진 열람</li>
            </ul>
            <Button onClick={() => handlePay("view")} disabled={paying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
              {paying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              ₩6,900 결제하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── 우편 발송 모달 ───────────────────────────────────── */}
      <Dialog open={modalType === "postal"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-[#0f1729] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Package className="w-5 h-5 text-purple-400" /> 우편 발송
            </DialogTitle>
            <DialogDescription className="text-white/50">
              유서를 인쇄하여 수신자에게 우편으로 발송합니다
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">우편 발송 서비스</span>
                <span className="text-white font-bold">₩19,900</span>
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>프린트 + 우편요금 포함</span>
                <span className="text-white/60">국내 기준</span>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-white/60">
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-400" /> 고품질 인쇄 (A4 봉투 포함)</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-400" /> 등기 우편 발송</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-400" /> 배송 추적 번호 제공</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-400" /> 첨부 사진 인쇄 포함</li>
            </ul>
            <Button onClick={() => handlePay("postal")} disabled={paying}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold">
              {paying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              ₩19,900 결제하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
