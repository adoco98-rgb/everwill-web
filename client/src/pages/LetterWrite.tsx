/**
 * 유서 작성 페이지 — 5단계 가이드 질문 위자드
 * 각 단계마다 안내 질문 + 자유 텍스트 입력
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, Heart, Users, Star, Gift, FileText,
  Plus, Trash2, Upload, Image, X, Check, Loader2, Lock
} from "lucide-react";

// ─── 5단계 가이드 질문 ──────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    icon: Heart,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    title: "내 삶에서 가장 빛났던 순간들 ✨",
    subtitle: "눈을 감고 지나온 날들을 천천히 떠올려 보세요. 어떤 장면이 가장 먼저 떠오르나요?",
    guide: "예) '아이가 처음 걸음마를 뗐던 날', '퇴직하던 날 동료들이 박수를 쳐줬을 때', '작은 텃밭에서 첫 수확을 했을 때'처럼 구체적인 장면을 적어 주세요.",
    questions: [
      "💛 살면서 가장 행복했던 순간을 딱 하나만 꼽는다면? (어떤 날, 어디서, 누구와 함께였나요?)",
      "🙏 내 삶에 큰 힘이 되어준 사람이 있다면 누구인가요? 그 사람에게 아직 못 한 말이 있다면?",
      "🏆 스스로 '정말 잘했다'고 느끼는 일이 있나요? 아무리 작은 것이라도 괜찮아요.",
    ],
  },
  {
    id: 2,
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    title: "사랑하는 사람들에게 💌",
    subtitle: "평소엔 쑥스러워서 못 했던 말, 지금 이 자리에서 편하게 꺼내 보세요.",
    guide: "예) '여보, 평생 나만 바라봐줘서 고마워요', '아들아, 네가 태어난 날이 내 인생 최고의 날이었어', '엄마, 철없던 시절에 상처 드려서 미안해요'처럼 솔직하게 적어 주세요.",
    questions: [
      "💑 배우자나 가장 가까운 사람에게 — 살면서 가장 감사했던 것, 미안했던 것, 사랑한다는 말을 전해 주세요.",
      "👨‍👩‍👧‍👦 자녀나 손주에게 — '이것만은 꼭 알아줬으면 해'라고 남기고 싶은 말이 있나요?",
      "👨‍👩‍👦 부모님, 형제자매, 친구에게 — 살면서 차마 말 못 했던 것이 있다면 지금 전해 주세요.",
    ],
  },
  {
    id: 3,
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    title: "내가 살면서 배운 것들 📖",
    subtitle: "긴 인생을 살며 깨달은 것들, 후회되는 것들, 꼭 전해주고 싶은 것들을 나눠 주세요.",
    guide: "예) '돈보다 건강이 먼저야', '하고 싶은 말은 그날 바로 해라, 내일이 없을 수도 있으니', '실패해도 괜찮아, 일어서면 돼'처럼 솔직한 경험담을 적어 주세요.",
    questions: [
      "🌱 살면서 가장 중요하다고 느낀 것은 무엇인가요? (돈, 건강, 관계, 시간... 무엇이든)",
      "🔄 다시 20대로 돌아간다면 꼭 다르게 하고 싶은 일이 있나요? 왜 그런가요?",
      "🌟 자녀나 손주에게 '이것만은 꼭 기억해줘'라고 전하고 싶은 삶의 교훈이 있나요?",
    ],
  },
  {
    id: 4,
    icon: Gift,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "마지막 부탁 몇 가지 🙏",
    subtitle: "내가 떠난 뒤 가족들이 어떻게 해줬으면 하는지, 솔직하게 남겨 주세요.",
    guide: "예) '꼭 화장해줘, 바다에 뿌려줘도 좋아', '기일에 너무 슬퍼하지 말고 맛있는 거 먹어', '막내가 대학 갈 때까지 형제들이 도와줬으면 해'처럼 구체적으로 적어 주세요.",
    questions: [
      "⚱️ 장례나 마지막 배웅에 대해 바라는 것이 있나요? (화장/매장, 종교 의식, 규모 등 편하게 적어 주세요)",
      "📅 기일이나 명절, 특별한 날에 가족들이 해줬으면 하는 것이 있나요?",
      "💬 남은 가족들에게 꼭 부탁하고 싶은 것이 있나요? (사이좋게 지내줘, 건강 챙겨, 꿈을 포기하지 마 등)",
    ],
  },
  {
    id: 5,
    icon: FileText,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    title: "마지막으로, 진심을 담아 💜",
    subtitle: "이 편지를 읽을 사람에게 마음 속 가장 깊은 곳에 있는 말을 전해 주세요.",
    guide: "예) '사랑한다는 말을 자주 못 해서 미안해. 하지만 매일 네 생각을 했어', '우리 함께한 시간이 내 인생에서 가장 빛나는 날들이었어', '잘 살아줘서 고마워. 행복하게 살아줘'처럼 솔직하게 적어 주세요.",
    questions: [
      "💌 이 유서를 읽는 사람에게 가장 하고 싶은 말은 무엇인가요? (사랑, 감사, 미안함, 응원... 무엇이든)",
      "🕊️ 마음속에 오래 담아두었던 말 — 용서하고 싶거나, 용서를 구하고 싶은 것이 있나요?",
      "🌈 마지막 인사를 전해 주세요. 당신의 진심이 그대로 전달될 거예요.",
    ],
  },
];

// ─── 수신자 타입 ──────────────────────────────────────────────────
interface Recipient {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export default function LetterWrite() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // 현재 단계 (1~5 + 6=수신자 + 7=첨부 + 8=결제)
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");

  // 각 단계 내용
  const [contents, setContents] = useState<Record<number, string>>({
    1: "", 2: "", 3: "", 4: "", 5: "",
  });

  // 수신자
  const [recipientMode, setRecipientMode] = useState<"all" | "specific">("all");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipient, setNewRecipient] = useState<Recipient>({ name: "", relationship: "", phone: "", email: "" });

  // 첨부파일
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // 저장 상태
  const [savedId, setSavedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const createMutation = trpc.farewell.create.useMutation();
  const updateMutation = trpc.farewell.update.useMutation();
  const addRecipientMutation = trpc.farewell.addRecipient.useMutation();
  const paymentMutation = trpc.farewell.createPaymentSession.useMutation();

  const totalSteps = 8;

  // 로그인 체크
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="w-12 h-12 text-[#C9A961] mx-auto" />
          <p className="text-white text-lg">유서 작성은 로그인 후 이용 가능합니다</p>
          <Button onClick={() => window.location.href = getLoginUrl()}
            className="bg-[#C9A961] hover:bg-[#b8944d] text-[#1F3864]">
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  // 내용 변경
  const handleContentChange = (stepId: number, value: string) => {
    setContents(prev => ({ ...prev, [stepId]: value }));
  };

  // 수신자 추가
  const addRecipient = () => {
    if (!newRecipient.name.trim()) {
      toast.error("이름을 입력해 주세요");
      return;
    }
    setRecipients(prev => [...prev, { ...newRecipient }]);
    setNewRecipient({ name: "", relationship: "", phone: "", email: "" });
  };

  // 파일 업로드 (S3 via tRPC 업로드 엔드포인트)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
        if (res.ok) {
          const { url } = await res.json();
          const type = file.type.startsWith("image/") ? "image" : "document";
          setAttachments(prev => [...prev, { name: file.name, url, type }]);
        }
      }
      toast.success("파일이 업로드됐습니다");
    } catch {
      toast.error("파일 업로드 실패");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 저장 후 결제
  const handleSaveAndPay = async () => {
    setSaving(true);
    try {
      let letterId = savedId;

      if (!letterId) {
        const result = await createMutation.mutateAsync({
          title: title || `${user?.name ?? "나"}의 유서`,
          step1Content: contents[1],
          step2Content: contents[2],
          step3Content: contents[3],
          step4Content: contents[4],
          step5Content: contents[5],
          recipientMode,
        });
        letterId = result.id;
        setSavedId(letterId);
      } else {
        await updateMutation.mutateAsync({
          id: letterId,
          title: title || `${user?.name ?? "나"}의 유서`,
          step1Content: contents[1],
          step2Content: contents[2],
          step3Content: contents[3],
          step4Content: contents[4],
          step5Content: contents[5],
          recipientMode,
        });
      }

      // 수신자 저장
      for (const r of recipients) {
        await addRecipientMutation.mutateAsync({
          letterId,
          name: r.name,
          relationship: r.relationship,
          phone: r.phone,
          email: r.email,
        });
      }

      // 결제 세션 생성
      const { url } = await paymentMutation.mutateAsync({
        letterId,
        origin: window.location.origin,
      });
      if (url) window.open(url, "_blank");
    } catch (err: any) {
      toast.error("오류 발생: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 임시 저장
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      if (!savedId) {
        const result = await createMutation.mutateAsync({
          title: title || `${user?.name ?? "나"}의 유서`,
          step1Content: contents[1],
          step2Content: contents[2],
          step3Content: contents[3],
          step4Content: contents[4],
          step5Content: contents[5],
          recipientMode,
        });
        setSavedId(result.id);
      } else {
        await updateMutation.mutateAsync({
          id: savedId,
          title: title || `${user?.name ?? "나"}의 유서`,
          step1Content: contents[1],
          step2Content: contents[2],
          step3Content: contents[3],
          step4Content: contents[4],
          step5Content: contents[5],
          recipientMode,
        });
      }
      toast.success("임시 저장됐습니다");
    } catch (err: any) {
      toast.error("저장 실패: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const progressPct = Math.round((step / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-10 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/letter")} className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> 나의 유서
          </button>
          <div className="text-center">
            <p className="text-xs text-white/50">유서 작성</p>
            <p className="text-sm font-medium text-[#C9A961]">
              {step <= 5 ? `${step}/5단계` : step === 6 ? "수신자 설정" : step === 7 ? "파일 첨부" : "저장 및 결제"}
            </p>
          </div>
          <button onClick={handleSaveDraft} disabled={saving} className="text-xs text-white/60 hover:text-white transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "임시저장"}
          </button>
        </div>
        {/* 진행바 */}
        <div className="max-w-2xl mx-auto mt-2">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#C9A961] to-[#e8c97a] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ─── 1~5단계: 가이드 질문 ─────────────────────────────── */}
        {step >= 1 && step <= 5 && (() => {
          const s = STEPS[step - 1];
          const Icon = s.icon;
          return (
            <div className="space-y-6">
              {/* 단계 헤더 */}
              <div className={`flex items-center gap-3 p-4 rounded-xl ${s.bg} border border-white/10`}>
                <div className={`p-2 rounded-lg bg-white/10`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{s.title}</h2>
                  <p className="text-sm text-white/60">{s.subtitle}</p>
                </div>
              </div>

              {/* 가이드 질문 목록 */}
              <div className="space-y-2">
                {s.questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/70 bg-white/5 rounded-lg px-3 py-2">
                    <span className={`mt-0.5 text-xs font-bold ${s.color}`}>Q{i + 1}</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>

              {/* 제목 (1단계에서만) */}
              {step === 1 && (
                <div>
                  <label className="text-sm text-white/60 mb-1 block">유서 제목 (선택)</label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={`${user?.name ?? "나"}의 유서`}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
              )}

              {/* 텍스트 입력 */}
              <div>
                <label className="text-sm text-white/60 mb-1 block">
                  자유롭게 작성해 주세요 <span className="text-white/30">(위 질문들을 참고하세요)</span>
                </label>
                <Textarea
                  value={contents[step]}
                  onChange={e => handleContentChange(step, e.target.value)}
                  placeholder={s.guide}
                  rows={10}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 resize-none leading-relaxed"
                />
                <p className="text-right text-xs text-white/30 mt-1">{contents[step].length}자</p>
              </div>
            </div>
          );
        })()}

        {/* ─── 6단계: 수신자 설정 ──────────────────────────────── */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-white/10">
              <div className="p-2 rounded-lg bg-white/10">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">수신자 설정</h2>
                <p className="text-sm text-white/60">유서를 전달받을 사람을 지정하세요</p>
              </div>
            </div>

            {/* 수신 방식 선택 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "all", label: "전체 공개", desc: "등록된 모든 가족에게 전달" },
                { value: "specific", label: "특정인 지정", desc: "선택한 사람에게만 전달" },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => setRecipientMode(opt.value as "all" | "specific")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    recipientMode === opt.value
                      ? "border-[#C9A961] bg-[#C9A961]/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {recipientMode === opt.value && <Check className="w-4 h-4 text-[#C9A961]" />}
                    <span className="font-medium text-white text-sm">{opt.label}</span>
                  </div>
                  <p className="text-xs text-white/50">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* 수신자 추가 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white/80">수신자 추가</h3>
              <div className="grid grid-cols-2 gap-2">
                <Input value={newRecipient.name} onChange={e => setNewRecipient(p => ({ ...p, name: e.target.value }))}
                  placeholder="이름 *" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
                <Input value={newRecipient.relationship} onChange={e => setNewRecipient(p => ({ ...p, relationship: e.target.value }))}
                  placeholder="관계 (예: 아들)" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
                <Input value={newRecipient.phone} onChange={e => setNewRecipient(p => ({ ...p, phone: e.target.value }))}
                  placeholder="휴대폰 번호" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
                <Input value={newRecipient.email} onChange={e => setNewRecipient(p => ({ ...p, email: e.target.value }))}
                  placeholder="이메일" className="bg-white/5 border-white/20 text-white placeholder:text-white/30" />
              </div>
              <Button onClick={addRecipient} variant="outline" size="sm"
                className="border-[#C9A961]/50 text-[#C9A961] hover:bg-[#C9A961]/10 bg-transparent">
                <Plus className="w-4 h-4 mr-1" /> 수신자 추가
              </Button>
            </div>

            {/* 수신자 목록 */}
            {recipients.length > 0 && (
              <div className="space-y-2">
                {recipients.map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-white text-sm font-medium">{r.name}</span>
                      {r.relationship && <Badge variant="outline" className="ml-2 text-xs border-white/20 text-white/60">{r.relationship}</Badge>}
                      {r.phone && <span className="text-white/40 text-xs ml-2">{r.phone}</span>}
                    </div>
                    <button onClick={() => setRecipients(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-white/30 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300">
              사망 후 자동으로 문자·이메일 알림이 발송됩니다 (무료)
            </div>
          </div>
        )}

        {/* ─── 7단계: 파일 첨부 ────────────────────────────────── */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-white/10">
              <div className="p-2 rounded-lg bg-white/10">
                <Upload className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">파일 첨부 (선택)</h2>
                <p className="text-sm text-white/60">사진, 문서 등을 첨부할 수 있습니다</p>
              </div>
            </div>

            {/* 업로드 영역 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#C9A961]/50 hover:bg-[#C9A961]/5 transition-all">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-[#C9A961] animate-spin mx-auto mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
              )}
              <p className="text-white/60 text-sm">클릭하여 파일 선택</p>
              <p className="text-white/30 text-xs mt-1">사진, PDF, 문서 파일 지원</p>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload} className="hidden" />

            {/* 첨부 목록 */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      {a.type === "image"
                        ? <Image className="w-4 h-4 text-blue-400" />
                        : <FileText className="w-4 h-4 text-amber-400" />}
                      <span className="text-white/80 text-sm truncate max-w-[200px]">{a.name}</span>
                    </div>
                    <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-white/30 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── 8단계: 저장 및 결제 ─────────────────────────────── */}
        {step === 8 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-[#C9A961]" />
              </div>
              <h2 className="text-xl font-bold text-white">유서 작성 완료</h2>
              <p className="text-white/60 text-sm">작성하신 유서를 안전하게 보관하겠습니다</p>
            </div>

            {/* 요약 */}
            <div className="bg-white/5 rounded-xl border border-white/10 divide-y divide-white/10">
              {STEPS.map(s => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-white/60 text-sm">{s.title}</span>
                  {contents[s.id].trim()
                    ? <Check className="w-4 h-4 text-emerald-400" />
                    : <span className="text-white/30 text-xs">미작성</span>}
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-white/60 text-sm">수신자</span>
                <span className="text-white/80 text-sm">
                  {recipientMode === "all" ? "전체 공개" : `${recipients.length}명 지정`}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-white/60 text-sm">첨부파일</span>
                <span className="text-white/80 text-sm">{attachments.length}개</span>
              </div>
            </div>

            {/* 가격 안내 */}
            <div className="bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-xl p-4 space-y-3">
              <h3 className="text-[#C9A961] font-bold text-sm">결제 안내</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">유서 작성 및 보관</span>
                  <span className="text-white font-bold">₩9,900</span>
                </div>
                <div className="flex justify-between text-white/40 text-xs">
                  <span>사망 후 자동 알림 (문자·이메일)</span>
                  <span className="text-emerald-400">무료</span>
                </div>
                <div className="flex justify-between text-white/40 text-xs">
                  <span>수신자 열람·프린트</span>
                  <span>₩6,900 (수신자 결제)</span>
                </div>
                <div className="flex justify-between text-white/40 text-xs">
                  <span>우편 발송</span>
                  <span>₩19,900 (수신자 결제)</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-white/40 text-xs">
                  <span>수정 시</span>
                  <span>₩4,900/회</span>
                </div>
              </div>
            </div>

            {/* 결제 버튼 */}
            <Button onClick={handleSaveAndPay} disabled={saving}
              className="w-full bg-[#C9A961] hover:bg-[#b8944d] text-[#1F3864] font-bold py-4 text-base">
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              ₩9,900 결제하고 유서 보관하기
            </Button>
            <p className="text-center text-xs text-white/30">
              결제 후 유서는 암호화되어 안전하게 보관됩니다
            </p>
          </div>
        )}

        {/* ─── 네비게이션 버튼 ─────────────────────────────────── */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button onClick={() => setStep(s => s - 1)} variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent">
              <ChevronLeft className="w-4 h-4 mr-1" /> 이전
            </Button>
          )}
          {step < totalSteps && (
            <Button onClick={() => setStep(s => s + 1)}
              className="flex-1 bg-[#1F3864] hover:bg-[#2a4a7f] text-white border border-[#C9A961]/30">
              다음 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
