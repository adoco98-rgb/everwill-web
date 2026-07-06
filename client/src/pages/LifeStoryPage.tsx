import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { GradeGate } from "@/components/GradeGate";
import {
  BookOpen, Mail, Camera, Lock, Sparkles, Plus, Mic,
  ArrowLeft, Send, Image as ImageIcon, Trash2, ChevronRight,
  Calendar, User, Heart
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { VoiceInput } from "@/components/VoiceInput";

// 음성 입력 래퍼 컴포넌트 (안정적 콜백 보장)
function VoiceInputWrapper({ onAppend, disabled }: { onAppend: (text: string) => void; disabled?: boolean }) {
  return (
    <VoiceInput
      onTranscribed={onAppend}
      language="ko"
      size="sm"
      hint="마이크로 말씀하세요"
      disabled={disabled}
    />
  );
}

/**
 * Life Story 페이지
 * - 비로그인: 로그인 유도
 * - 로그인 + ₩99,000 구매자: 잠금 화면 + 업그레이드 유도
 * - 로그인 + ₩129,000 이상 구매자: 전체 기능 이용
 */

// ─── 잠금 화면 ───────────────────────────────────────────────
function LockedScreen({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1F3864 60%, #0d1b3e 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        {/* 잠금 아이콘 */}
        <div className="w-24 h-24 rounded-full bg-[#C9A961]/15 border border-[#C9A961]/30 flex items-center justify-center mx-auto mb-8">
          <Lock className="w-12 h-12 text-[#C9A961]" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Life Story
        </h1>
        <p className="text-[#C9A961] text-lg font-medium mb-6">
          당신의 이야기를 영원히 남기세요
        </p>

        {!isLoggedIn ? (
          <>
            <p className="text-white/60 mb-8 leading-relaxed">
              이 기능을 이용하려면 먼저 로그인이 필요합니다.
            </p>
            <a href={getLoginUrl()}>
              <Button className="bg-[#C9A961] text-[#1F3864] hover:bg-[#d4b56e] font-bold px-10 py-3 rounded-full text-lg">
                로그인하기
              </Button>
            </a>
          </>
        ) : (
          <>
            <p className="text-white/60 mb-4 leading-relaxed">
              이 기능은 <span className="text-[#C9A961] font-semibold">Badge Gold (₩79,000) 이상</span> 구매 회원 전용입니다.
            </p>
            <p className="text-white/40 text-sm mb-8">
              현재 플랜으로는 이용할 수 없습니다. 업그레이드 후 이용해주세요.
            </p>

            {/* 기능 미리보기 */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: <Mic className="w-5 h-5" />, label: "AI 일기" },
                { icon: <Camera className="w-5 h-5" />, label: "인물 앨범" },
                { icon: <Mail className="w-5 h-5" />, label: "레거시 편지" },
              ].map((f, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col items-center gap-2">
                  <div className="text-[#C9A961]/60">{f.icon}</div>
                  <span className="text-white/40 text-xs">{f.label}</span>
                  <Lock className="w-3 h-3 text-white/20" />
                </div>
              ))}
            </div>

            <Link href="/payment">
              <Button className="bg-[#C9A961] text-[#1F3864] hover:bg-[#d4b56e] font-bold px-10 py-3 rounded-full text-lg">
                Badge Gold 구매하기 →
              </Button>
            </Link>
            <p className="text-white/30 text-xs mt-3">₩79,000 · 1회 결제 · 3년 이용</p>
          </>
        )}

        <div className="mt-8">
          <Link href="/">
            <button className="text-white/40 text-sm hover:text-white/70 flex items-center gap-1 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              홈으로 돌아가기
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ─── 탭 타입 ─────────────────────────────────────────────────
type Tab = "journal" | "letters" | "album" | "autobiography";

// ─── 메인 Life Story 페이지 ───────────────────────────────────
function LifeStoryMain({ userId }: { userId: number }) {
  const [activeTab, setActiveTab] = useState<Tab>("journal");

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#1F3864] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#C9A961]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1F3864]">Life Story</h1>
              <p className="text-[#6B7280] text-sm">나의 이야기를 영원히 남기는 공간</p>
            </div>
            <Badge className="ml-auto bg-[#C9A961]/15 text-[#C9A961] border border-[#C9A961]/30 text-xs">
              Premium
            </Badge>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 pb-0">
          {[
            { id: "journal" as Tab, label: "AI 일기", icon: <BookOpen className="w-4 h-4" /> },
            { id: "letters" as Tab, label: "소중한 편지", icon: <Mail className="w-4 h-4" /> },
            { id: "album" as Tab, label: "인물 앨범", icon: <Camera className="w-4 h-4" /> },
            { id: "autobiography" as Tab, label: "나의 자서전", icon: <span className="text-sm">📖</span> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#1F3864] text-[#1F3864]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === "journal" && <JournalTab userId={userId} />}
        {activeTab === "letters" && <LettersTab userId={userId} />}
        {activeTab === "album" && <AlbumTab userId={userId} />}
        {activeTab === "autobiography" && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-[#1F3864] mb-3">나의 자서전 만들기</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              AI와 대화하며 나만의 인생 이야기를 책으로 만들어 보세요.<br />
              음성으로 말씀하시면 AI가 아름다운 자서전을 써드립니다.
            </p>
            <Link href="/life-story/autobiography">
              <button className="px-8 py-4 bg-[#1F3864] text-white font-bold text-lg rounded-2xl hover:bg-[#2a4d8a] transition-all shadow-lg">
                자서전 시작하기 →
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI 일기 탭 ───────────────────────────────────────────────
function JournalTab({ userId }: { userId: number }) {
  const [conversation, setConversation] = useState("");
  const [imageStyle, setImageStyle] = useState<"watercolor" | "illustration" | "oil_painting">("watercolor");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ diaryText: string; imageUrl?: string; emotionTags: string } | null>(null);

  const { data: journals, refetch } = trpc.lifeStory.getJournals.useQuery({ limit: 20, offset: 0 });
  const generateMutation = trpc.lifeStory.generateJournal.useMutation();

  const today = new Date().toISOString().split("T")[0];

  const handleGenerate = async () => {
    if (!conversation.trim()) {
      toast.error("오늘 있었던 일을 입력해주세요.");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await generateMutation.mutateAsync({
        journalDate: today,
        conversationText: conversation,
        imageStyle,
      });
      setResult(res);
      refetch();
      toast.success("일기가 완성됐습니다!");
    } catch (e: any) {
      toast.error(e.message ?? "오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 일기 작성 카드 */}
      <Card className="border-[#1F3864]/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1F3864] flex items-center gap-2 text-lg">
            <Mic className="w-5 h-5 text-[#C9A961]" />
            오늘의 이야기를 들려주세요
          </CardTitle>
          <p className="text-gray-500 text-sm">{today} · AI가 일기와 그림을 만들어 드립니다</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 음성 입력 영역 */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <VoiceInputWrapper onAppend={(text) => setConversation(prev => prev ? prev + " " + text : text)} disabled={isGenerating} />
            <span className="text-sm text-amber-700">마이크로 말씀하거나 아래에 직접 입력하세요</span>
          </div>
          <Textarea
            value={conversation}
            onChange={(e) => setConversation(e.target.value)}
            placeholder="오늘 있었던 일을 자유롭게 이야기해주세요. 예: '오늘 아들과 함께 뒷산을 올랐어. 오랜만에 둘이서 걸으며 많은 이야기를 나눴는데...'"
            className="min-h-[140px] resize-none border-gray-200 focus:border-[#1F3864]"
          />

          <div className="flex items-center gap-4">
            <Label className="text-sm text-gray-600 whitespace-nowrap">그림 스타일</Label>
            <Select value={imageStyle} onValueChange={(v: any) => setImageStyle(v)}>
              <SelectTrigger className="w-44 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="watercolor">수채화</SelectItem>
                <SelectItem value="illustration">일러스트</SelectItem>
                <SelectItem value="oil_painting">유화</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="ml-auto bg-[#1F3864] hover:bg-[#1a3057] text-white px-6"
            >
              {isGenerating ? (
                <><Sparkles className="w-4 h-4 mr-2 animate-spin" />생성 중...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />일기 만들기</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 생성 결과 */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-[#C9A961]/30 bg-gradient-to-br from-amber-50 to-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1F3864] flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-[#C9A961]" />
                오늘의 일기가 완성됐습니다
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.imageUrl && (
                <img src={result.imageUrl} alt="AI 생성 그림" className="w-full rounded-xl max-h-64 object-cover" />
              )}
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.diaryText}</p>
              {result.emotionTags && (
                <div className="flex flex-wrap gap-2">
                  {result.emotionTags.split(",").map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tag.trim()}</Badge>
                  ))}
                </div>
              )}
              {/* 인쇄·PDF 출력 버튼 */}
              <div className="flex gap-2 pt-2 border-t border-amber-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#1F3864]/30 text-[#1F3864] hover:bg-[#1F3864]/5"
                  onClick={() => window.print()}
                >
                  프린트 인쇄
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#C9A961]/50 text-[#C9A961] hover:bg-[#C9A961]/5"
                  onClick={() => {
                    const content = `나의 일기\n\n${result.diaryText}\n\n[감정 태그] ${result.emotionTags}`;
                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `나의_일기_${new Date().toISOString().split('T')[0]}.txt`;
                    a.click(); URL.revokeObjectURL(url);
                  }}
                >
                  텍스트 다운로드
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 일기 목록 */}
      {journals && journals.length > 0 && (
        <div>
          <h3 className="text-[#1F3864] font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            나의 일기 ({journals.length}개)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {journals.map((j) => (
              <Card key={j.id} className="border-gray-100 hover:border-[#1F3864]/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {j.imageUrl ? (
                      <img src={j.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 mb-1">{j.journalDate}</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{j.diaryText}</p>
                      {j.emotionTags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {j.emotionTags.split(",").slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {journals && journals.length === 0 && !result && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>아직 작성된 일기가 없습니다.</p>
          <p className="text-sm mt-1">오늘 있었던 일을 AI에게 이야기해보세요.</p>
        </div>
      )}
    </div>
  );
}

// ─── 소중한 편지 탭 ───────────────────────────────────────────
function LettersTab({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    recipientName: "",
    recipientRelationship: "",
    recipientEmail: "",
    title: "",
    content: "",
    releaseCondition: "after_death" as "after_death" | "specific_date" | "event",
    releaseEventDesc: "",
  });

  const { data: letters, refetch } = trpc.lifeStory.getLetters.useQuery();
  const createMutation = trpc.lifeStory.createLetter.useMutation();
  const deleteMutation = trpc.lifeStory.deleteLetter.useMutation();

  const handleCreate = async () => {
    if (!form.recipientName || !form.content) {
      toast.error("수신자 이름과 편지 내용을 입력해주세요.");
      return;
    }
    try {
      await createMutation.mutateAsync(form);
      setOpen(false);
      setForm({ recipientName: "", recipientRelationship: "", recipientEmail: "", title: "", content: "", releaseCondition: "after_death", releaseEventDesc: "" });
      refetch();
      toast.success("편지가 저장됐습니다. 조건 충족 시 자동으로 전달됩니다.");
    } catch (e: any) {
      toast.error(e.message ?? "오류가 발생했습니다.");
    }
  };

  const releaseLabel = (condition: string, eventDesc?: string | null) => {
    if (condition === "after_death") return "사후 즉시 공개";
    if (condition === "event") return eventDesc ?? "특정 이벤트";
    return "특정 날짜";
  };

  return (
    <div className="space-y-6">
      {/* 편지 작성 버튼 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-[#1F3864] font-semibold">소중한 사람에게 남기는 편지</h3>
          <p className="text-gray-500 text-sm mt-1">당신이 없어도 당신의 마음이 전해집니다.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1F3864] hover:bg-[#1a3057] text-white">
              <Plus className="w-4 h-4 mr-2" />
              편지 쓰기
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#1F3864]">소중한 사람에게 편지 쓰기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">수신자 이름 *</Label>
                  <Input value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} placeholder="예: 아들 민준" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">관계</Label>
                  <Input value={form.recipientRelationship} onChange={e => setForm(f => ({ ...f, recipientRelationship: e.target.value }))} placeholder="예: 아들" className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-sm">수신자 이메일</Label>
                <Input type="email" value={form.recipientEmail} onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))} placeholder="편지 전달 시 사용" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">편지 제목</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="자동 생성됩니다" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">편지 내용 *</Label>
                <Textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="마음을 담아 편지를 써주세요..."
                  className="mt-1 min-h-[160px] resize-none"
                />
              </div>
              <div>
                <Label className="text-sm">공개 조건</Label>
                <Select value={form.releaseCondition} onValueChange={(v: any) => setForm(f => ({ ...f, releaseCondition: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="after_death">사후 즉시 공개</SelectItem>
                    <SelectItem value="event">특정 이벤트 (결혼식, 성인 등)</SelectItem>
                    <SelectItem value="specific_date">특정 날짜</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.releaseCondition === "event" && (
                <div>
                  <Label className="text-sm">이벤트 설명</Label>
                  <Input value={form.releaseEventDesc} onChange={e => setForm(f => ({ ...f, releaseEventDesc: e.target.value }))} placeholder="예: 아들 결혼식 날, 손녀 성인이 되는 날" className="mt-1" />
                </div>
              )}
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full bg-[#1F3864] hover:bg-[#1a3057] text-white">
                {createMutation.isPending ? "저장 중..." : "편지 저장하기"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 편지 목록 */}
      {letters && letters.length > 0 ? (
        <div className="space-y-3">
          {letters.map((letter) => (
            <Card key={letter.id} className="border-gray-100 hover:border-[#1F3864]/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1F3864]">{letter.recipientName}</span>
                        {letter.recipientRelationship && (
                          <span className="text-xs text-gray-400">({letter.recipientRelationship})</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{letter.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Lock className="w-3 h-3 text-[#C9A961]" />
                        <span className="text-xs text-[#C9A961]">{releaseLabel(letter.releaseCondition, letter.releaseEventDesc)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* 인쇄 버튼 */}
                    <button
                      onClick={() => {
                        const content = `소중한 사람에게 남기는 편지\n\n수신자: ${letter.recipientName} ${letter.recipientRelationship ? `(${letter.recipientRelationship})` : ''}\n제목: ${letter.title ?? ''}\n공개 조건: ${releaseLabel(letter.releaseCondition, letter.releaseEventDesc)}\n\n${letter.content ?? ''}`;
                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `편지_${letter.recipientName}_${new Date().toISOString().split('T')[0]}.txt`;
                        a.click(); URL.revokeObjectURL(url);
                      }}
                      className="text-gray-300 hover:text-[#C9A961] transition-colors"
                      title="텍스트 다운로드"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="text-gray-300 hover:text-[#1F3864] transition-colors"
                      title="프린트 인쇄"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    </button>
                    <button
                      onClick={async () => {
                        await deleteMutation.mutateAsync({ letterId: letter.id });
                        refetch();
                        toast.success("편지가 삭제됐습니다.");
                      }}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>아직 작성된 편지가 없습니다.</p>
          <p className="text-sm mt-1">소중한 사람에게 마음을 전해보세요.</p>
        </div>
      )}
    </div>
  );
}

// ─── 인물 앨범 탭 ─────────────────────────────────────────────
function AlbumTab({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("self");
  const [photoUrl, setPhotoUrl] = useState("");

  const { data: profiles, refetch } = trpc.lifeStory.getPersonProfiles.useQuery();
  const addMutation = trpc.lifeStory.addPersonProfile.useMutation();
  const deleteMutation = trpc.lifeStory.deletePersonProfile.useMutation();

  const handleAdd = async () => {
    if (!name) {
      toast.error("이름을 입력해주세요.");
      return;
    }
    try {
      await addMutation.mutateAsync({ name, relationship, photoUrl: photoUrl || undefined });
      setOpen(false);
      setName(""); setRelationship("self"); setPhotoUrl("");
      refetch();
      toast.success("인물이 등록됐습니다. AI 일기 그림 생성 시 이 인물이 반영됩니다.");
    } catch (e: any) {
      toast.error(e.message ?? "오류가 발생했습니다.");
    }
  };

  const relationshipLabel: Record<string, string> = {
    self: "본인", spouse: "배우자", son: "아들", daughter: "딸",
    father: "아버지", mother: "어머니", sibling: "형제/자매", friend: "친구", other: "기타",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-[#1F3864] font-semibold">인물 앨범</h3>
          <p className="text-gray-500 text-sm mt-1">사진을 등록하면 AI 일기 그림에 실제 얼굴이 반영됩니다.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1F3864] hover:bg-[#1a3057] text-white">
              <Plus className="w-4 h-4 mr-2" />
              인물 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-[#1F3864]">인물 등록</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-sm">이름 *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="예: 아내 수진" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">관계</Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(relationshipLabel).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">사진 URL (선택)</Label>
                <Input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..." className="mt-1" />
                <p className="text-xs text-gray-400 mt-1">사진이 있으면 AI가 얼굴 특징을 분석합니다.</p>
              </div>
              <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full bg-[#1F3864] hover:bg-[#1a3057] text-white">
                {addMutation.isPending ? "등록 중..." : "등록하기"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {profiles && profiles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {profiles.map((p) => (
            <Card key={p.id} className="border-gray-100 hover:border-[#1F3864]/20 transition-colors">
              <CardContent className="p-4 text-center">
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt={p.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <p className="font-semibold text-[#1F3864] text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">{relationshipLabel[p.relationship ?? "other"] ?? p.relationship}</p>
                {p.facePrompt && (
                  <p className="text-xs text-green-600 mt-1">얼굴 분석 완료</p>
                )}
                <button
                  onClick={async () => {
                    await deleteMutation.mutateAsync({ profileId: p.id });
                    refetch();
                    toast.success("인물이 삭제됐습니다.");
                  }}
                  className="mt-2 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mx-auto" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>등록된 인물이 없습니다.</p>
          <p className="text-sm mt-1">본인과 가족 사진을 등록해보세요.</p>
        </div>
      )}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export default function LifeStoryPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1F3864 60%, #0d1b3e 100%)" }}>
        <div className="text-center">
          <Sparkles className="w-10 h-10 text-[#C9A961] mx-auto mb-3 animate-pulse" />
          <p className="text-white/60">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LockedScreen isLoggedIn={false} />;
  }

  return (
    <GradeGate requiredGrade="gold" featureName="AI 일기 / Life Story" description="AI 일기 쓰기와 편지 서비스는 골드 이상 회원만 이용할 수 있습니다." mode="block">
      <LifeStoryMain userId={user.id} />
    </GradeGate>
  );
}
