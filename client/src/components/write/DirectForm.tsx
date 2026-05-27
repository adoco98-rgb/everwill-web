/**
 * EverWill 직접 작성 모드
 * 한국 민법 제1065조 기준 7개 섹션 법적 양식
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Eye, EyeOff, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import Step10Sign from "./steps/Step10Sign";
import { initialWillData } from "@/lib/willTypes";
import type { WillData } from "@/lib/willTypes";

const SECTIONS = [
  { id: 1, title: "유언자 정보", law: "민법 제1066조", icon: "👤" },
  { id: 2, title: "유언 전문", law: "민법 제1065조", icon: "📜" },
  { id: 3, title: "상속인 지정", law: "민법 제1000조", icon: "👨‍👩‍👧‍👦" },
  { id: 4, title: "재산 분배", law: "민법 제1078조", icon: "🏠" },
  { id: 5, title: "특별 지시사항", law: "민법 제1093조", icon: "📝" },
  { id: 6, title: "결어 및 확인", law: "민법 제1066조", icon: "✅" },
  { id: 7, title: "서명 및 날인", law: "민법 제1066조", icon: "✍️" },
];

interface Props {
  onBack: () => void;
  existingWill?: {
    id: number;
    title: string | null;
    data: string | null;
    mode: "ai" | "direct" | null;
    status: string;
  };
}

export default function DirectForm({ onBack, existingWill }: Props) {
  const [will, setWill] = useState<WillData>(() => {
    if (existingWill?.data) {
      try {
        const parsed = JSON.parse(existingWill.data);
        return { ...initialWillData, ...parsed, mode: "direct" };
      } catch {}
    }
    return { ...initialWillData, mode: "direct" };
  });
  const [openSection, setOpenSection] = useState<number>(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showSign, setShowSign] = useState(false);

  const update = (partial: Partial<WillData>) => setWill((prev) => ({ ...prev, ...partial }));

  const today = new Date(will.writtenDate || Date.now());
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const issues: string[] = [];
  if (!will.testatorName) issues.push("유언자 성명");
  if (!will.testatorRRN) issues.push("주민등록번호");
  if (!will.testatorAddress) issues.push("주소");

  const handleSave = () => {
    localStorage.setItem("saram_will_draft_direct", JSON.stringify({ ...will, lastSaved: new Date().toISOString() }));
    toast.success("임시 저장 완료");
  };

  if (showSign) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => setShowSign(false)} className="flex items-center gap-2 text-gray-400 hover:text-[#1F3864] text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />작성으로 돌아가기
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#1F3864] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            ✍️ 서명 및 본인인증
          </h2>
          <Step10Sign will={will} update={update} onNext={() => {}} onPrev={() => setShowSign(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-[#1F3864] text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />모드 선택
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1.5 text-gray-400 hover:text-[#1F3864] text-sm transition-colors">
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? "편집" : "미리보기"}
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 text-gray-400 hover:text-[#1F3864] text-sm transition-colors">
            <Save className="w-4 h-4" />임시저장
          </button>
        </div>
      </div>

      {/* 법적 유효성 */}
      {issues.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2 text-amber-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          필수 항목 미입력: {issues.join(", ")}
        </div>
      )}

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* 유언장 미리보기 */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-[#1F3864] px-6 py-4 flex items-center gap-2">
                <span className="text-[#C9A961]">📄</span>
                <span className="text-white font-semibold text-sm">유언장 전문 미리보기</span>
              </div>
              <div className="p-8 font-serif text-sm text-gray-700 leading-loose space-y-6" style={{ fontFamily: "Georgia, serif" }}>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#1F3864] mb-1">유 언 장</h2>
                </div>
                <div className="border-t border-b border-gray-100 py-4 space-y-1">
                  <p><strong>유언자:</strong> {will.testatorName || "___"}</p>
                  <p><strong>주민등록번호:</strong> {will.testatorRRN ? will.testatorRRN.slice(0, 6) + "-*******" : "___"}</p>
                  <p><strong>주소:</strong> {will.testatorAddress || "___"}</p>
                  <p><strong>작성일:</strong> {dateStr}</p>
                </div>
                <p className="bg-gray-50 rounded-lg p-3">본인 {will.testatorName || "___"}은(는) 정신이 맑고 건강한 상태에서 다음과 같이 유언한다.</p>
                {will.heirs.length > 0 && (
                  <div>
                    <p className="font-bold text-[#1F3864] mb-2">【상속인 지정 및 재산 분배】</p>
                    {will.heirs.map((h, i) => (
                      <p key={h.id}>제{i + 1}항. 본인의 {h.relation} {h.name}에게 전체 재산의 {h.share}%를 상속한다.</p>
                    ))}
                  </div>
                )}
                {will.executor && <p><strong>유언집행자:</strong> {will.executor}</p>}
                {will.funeralWish && <p><strong>장례 방식:</strong> {will.funeralWish}</p>}
                {will.specialInstructions && (
                  <div className="bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{will.specialInstructions}</div>
                )}
                <div className="border-t border-gray-100 pt-4">
                  <p className="bg-gray-50 rounded-lg p-3">위 유언은 본인의 자유로운 의사에 따라 작성하였음을 확인한다.</p>
                </div>
                <div className="text-right space-y-1">
                  <p>{dateStr}</p>
                  <p>유언자: {will.testatorName || "___"} (서명/날인)</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {SECTIONS.map((section) => (
              <div key={section.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenSection(openSection === section.id ? 0 : section.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{section.icon}</span>
                    <div>
                      <div className="font-bold text-[#1F3864] text-sm">{section.title}</div>
                      <div className="text-gray-400 text-xs">{section.law}</div>
                    </div>
                  </div>
                  {openSection === section.id
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                <AnimatePresence>
                  {openSection === section.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-gray-50">
                        <SectionContent id={section.id} will={will} update={update} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 버튼 */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setShowSign(true)}
          disabled={issues.length > 0}
          className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            issues.length === 0 ? "btn-gold" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          ✍️ 서명 및 인증하기
        </button>
        <button onClick={handleSave} className="px-6 py-4 border-2 border-[#1F3864] text-[#1F3864] rounded-xl font-semibold text-sm hover:bg-[#1F3864]/5 transition-all">
          임시 저장
        </button>
      </div>
    </div>
  );
}

/* ─── 섹션별 콘텐츠 ─── */
function SectionContent({ id, will, update }: { id: number; will: WillData; update: (p: Partial<WillData>) => void }) {
  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all mt-1.5";
  const labelCls = "block text-xs font-semibold text-gray-500 mt-4 first:mt-0";

  if (id === 1) return (
    <div className="pt-4 space-y-1">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 mb-4">
        <strong>민법 제1066조</strong> — 자필증서 유언은 유언자가 전문·연월일·주소·성명을 자필로 기재하고 날인해야 합니다.
      </div>
      <div className="grid sm:grid-cols-2 gap-x-4">
        <div>
          <label className={labelCls}>성명 <span className="text-red-500">*</span></label>
          <input value={will.testatorName} onChange={(e) => update({ testatorName: e.target.value })} placeholder="홍길동" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>주민등록번호 <span className="text-red-500">*</span></label>
          <input value={will.testatorRRN} onChange={(e) => update({ testatorRRN: e.target.value })} placeholder="000000-0000000" maxLength={14} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>주소 <span className="text-red-500">*</span></label>
          <input value={will.testatorAddress} onChange={(e) => update({ testatorAddress: e.target.value })} placeholder="서울특별시 강남구 테헤란로 123" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>연락처</label>
          <input value={will.testatorPhone} onChange={(e) => update({ testatorPhone: e.target.value })} placeholder="010-0000-0000" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>작성일 <span className="text-red-500">*</span></label>
          <input type="date" value={will.writtenDate} onChange={(e) => update({ writtenDate: e.target.value })} className={inputCls} />
        </div>
      </div>
    </div>
  );

  if (id === 2) return (
    <div className="pt-4">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 font-serif text-sm text-gray-600 leading-relaxed">
        <p className="font-bold text-[#1F3864] mb-2">유언 전문 (법정 문구)</p>
        <p>본인 <strong>{will.testatorName || "___"}</strong>은(는) 정신이 맑고 건강한 상태에서 다음과 같이 유언한다.</p>
      </div>
      <p className="text-xs text-gray-400 mt-2">유언 전문은 법적 요건에 따라 자동 생성됩니다.</p>
    </div>
  );

  if (id === 3) return (
    <div className="pt-4 space-y-3">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
        <strong>유류분 주의</strong> — 배우자·자녀는 법정 상속분의 1/2, 부모는 1/3이 최소 보장됩니다.
      </div>
      <textarea
        value={will.heirs.map((h) => `${h.relation} ${h.name} — 전체 재산의 ${h.share}%`).join("\n") || ""}
        onChange={(e) => {
          // 직접 작성 모드에서는 자유 텍스트로 입력
        }}
        placeholder={`예시:\n배우자 홍길순 — 전체 재산의 50%\n장남 홍민준 — 전체 재산의 30%\n장녀 홍민지 — 전체 재산의 20%`}
        rows={6}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 resize-none mt-1"
      />
      <p className="text-xs text-gray-400">각 줄에 상속인 정보와 지분을 입력하세요. 지분 합계는 100%가 되어야 합니다.</p>
    </div>
  );

  if (id === 4) return (
    <div className="pt-4 space-y-4">
      <div>
        <label className={labelCls}>부동산</label>
        <textarea
          value={will.realEstates.map((r) => `${r.type} — ${r.address}`).join("\n") || ""}
          placeholder={`예시:\n아파트 — 서울시 강남구 테헤란로 123, 101동 1001호 (약 10억 원)\n토지 — 경기도 용인시 처인구 xxx번지 (약 2억 원)`}
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 resize-none mt-1.5"
        />
      </div>
      <div>
        <label className={labelCls}>금융자산</label>
        <textarea
          placeholder={`예시:\nKB국민은행 예금 (계좌 ****1234) — 약 5,000만 원\n삼성증권 주식 — 약 3,000만 원`}
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 resize-none mt-1.5"
        />
      </div>
      <div>
        <label className={labelCls}>기타 자산</label>
        <textarea
          placeholder={`예시:\n자동차 — 2022년식 현대 아반떼 (차량번호 12가3456)\n귀금속 — 다이아몬드 반지 1점`}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 resize-none mt-1.5"
        />
      </div>
    </div>
  );

  if (id === 5) return (
    <div className="pt-4 space-y-4">
      <div>
        <label className={labelCls}>유언집행자 지정</label>
        <input value={will.executor} onChange={(e) => update({ executor: e.target.value })} placeholder="홍길동 (관계: 장남, 연락처: 010-0000-0000)" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>미성년 자녀 후견인</label>
        <input value={will.guardian} onChange={(e) => update({ guardian: e.target.value })} placeholder="홍길순 (관계: 이모, 연락처: 010-0000-0000)" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>장례 방식</label>
        <input value={will.funeralWish} onChange={(e) => update({ funeralWish: e.target.value })} placeholder="화장 후 납골당 안치" className={inputCls} />
      </div>
      {/* 기부 내역은 /charity 페이지에서 별도 관리 - 여기서 제거 */}
      <div>
        <label className={labelCls}>기타 특별 지시사항</label>
        <textarea value={will.specialInstructions} onChange={(e) => update({ specialInstructions: e.target.value })} placeholder="가족들이 화목하게 지내기를 바란다." rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 resize-none mt-1.5" />
      </div>
    </div>
  );

  if (id === 6) return (
    <div className="pt-4">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 font-serif text-sm text-gray-600 leading-relaxed">
        <p className="font-bold text-[#1F3864] mb-2">결어 (법정 문구)</p>
        <p>위 유언은 본인의 자유로운 의사에 따라 작성하였음을 확인한다.</p>
        <p className="mt-2 text-gray-400">{new Date(will.writtenDate || Date.now()).getFullYear()}년 {new Date(will.writtenDate || Date.now()).getMonth() + 1}월 {new Date(will.writtenDate || Date.now()).getDate()}일</p>
        <p className="text-gray-400">유언자: {will.testatorName || "___"} (서명/날인)</p>
      </div>
      <p className="text-xs text-gray-400 mt-2">결어는 법적 요건에 따라 자동 생성됩니다.</p>
    </div>
  );

  if (id === 7) return (
    <div className="pt-4">
      <div className="bg-[#1F3864]/5 rounded-xl p-4 text-sm text-[#1F3864]">
        <p className="font-semibold mb-2">서명 및 날인 방법</p>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• <strong>자필 서명:</strong> 유언자 본인이 직접 서명합니다.</li>
          <li>• <strong>날인:</strong> 인감도장 또는 무인(지장)을 날인합니다.</li>
          <li>• <strong>전자서명:</strong> EverWill 플랫폼의 전자서명으로 대체 가능합니다.</li>
          <li>• <strong>분산 암호화 보안 기록:</strong> 서명 완료 시 Polygon 네트워크에 해시가 기록됩니다.</li>
        </ul>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        아래 "서명 및 인증하기" 버튼을 눌러 PASS/카카오/네이버/공동인증서 중 선택하여 전자서명을 완료하세요.
      </p>
    </div>
  );

  return null;
}
