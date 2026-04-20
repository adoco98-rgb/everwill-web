/**
 * SARAM 결제 페이지 (/payment)
 * Stripe Checkout으로 글로벌 결제 (카드, 구글페이, 애플페이)
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Globe, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

type ProductKey =
  | "certification"
  | "video_will"
  | "handwritten_scan"
  | "storage_1y"
  | "storage_3y"
  | "storage_5y"
  | "storage_10y"
  | "storage_lifetime"
  | "badge_essential"
  | "badge_wearable"
  | "badge_necklace"
  | "badge_premium";

interface CartItem {
  key: ProductKey;
  name: string;
  amount: number;
  quantity: number;
}

const PRODUCTS: { key: ProductKey; name: string; desc: string; amount: number; category: string; recommended?: boolean }[] = [
  { key: "certification", name: "전자 인증", desc: "유언장 전자 인증 · 블록체인 해시 기록 · 인증서 발급", amount: 49000, category: "인증", recommended: true },
  { key: "video_will", name: "영상 유언장", desc: "법적 녹음 유언 + 가족 감성 메시지 · 평생 보관", amount: 29000, category: "부가서비스" },
  { key: "handwritten_scan", name: "자필 유언장 스캔", desc: "자필 원본 업로드 · AI 형식 검증 · 블록체인 기록", amount: 19000, category: "부가서비스" },
  { key: "storage_1y", name: "보관 1년", desc: "디지털 유언장 1년 보관 (2년차~)", amount: 9900, category: "보관" },
  { key: "storage_3y", name: "보관 3년", desc: "15% 할인 적용", amount: 25245, category: "보관" },
  { key: "storage_5y", name: "보관 5년", desc: "15% 할인 적용 · 추천", amount: 42075, category: "보관", recommended: true },
  { key: "storage_10y", name: "보관 10년", desc: "15% 할인 적용", amount: 84150, category: "보관" },
  { key: "storage_lifetime", name: "영구 보관", desc: "평생 보관 · 무제한", amount: 199000, category: "보관" },
  { key: "badge_essential", name: "Badge Essential", desc: "스테인레스 카드형 · QR + NFC", amount: 49000, category: "Badge" },
  { key: "badge_wearable", name: "Badge Wearable", desc: "티타늄 팔찌형 · QR + NFC", amount: 79000, category: "Badge" },
  { key: "badge_necklace", name: "Badge Necklace", desc: "로즈골드 목걸이형 · QR + NFC", amount: 99000, category: "Badge" },
  { key: "badge_premium", name: "Badge Premium", desc: "티타늄·플래티넘 · QR + NFC", amount: 299000, category: "Badge" },
];

const CATEGORIES = ["인증", "부가서비스", "보관", "Badge"];

export default function PaymentPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("인증");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const addToCart = (key: ProductKey) => {
    const product = PRODUCTS.find((p) => p.key === key)!;
    setCart((prev) => {
      const exists = prev.find((i) => i.key === key);
      if (exists) return prev;
      return [...prev, { key, name: product.name, amount: product.amount, quantity: 1 }];
    });
    toast.success(`${product.name} 추가됨`);
  };

  const removeFromCart = (key: ProductKey) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  };

  const total = cart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  const inCart = (key: ProductKey) => cart.some((i) => i.key === key);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("결제할 상품을 선택해주세요.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ key: i.key, quantity: i.quantity })),
          customerEmail: email || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "결제 세션 생성 실패");
      toast.success("Stripe 결제 페이지로 이동합니다...");
      window.open(data.url, "_blank");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "결제 오류가 발생했습니다.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />홈으로
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="text-[#C9A961] font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>SARAM</span>
            <span className="text-white/60 text-sm">결제</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-white/60 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Stripe 보안 결제</span>
            <Globe className="w-3.5 h-3.5 ml-2" />
            <span>195개국 지원</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 상품 목록 */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
                서비스 선택
              </h1>
              <p className="text-gray-400 text-sm mt-1">원하는 서비스를 선택하고 글로벌 결제로 진행하세요.</p>
            </div>

            {/* 카테고리 탭 */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-[#1F3864] text-white"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-[#1F3864]/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 상품 카드 */}
            <div className="grid sm:grid-cols-2 gap-4">
              {PRODUCTS.filter((p) => p.category === activeCategory).map((product) => (
                <motion.div
                  key={product.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative bg-white rounded-2xl border-2 p-5 transition-all ${
                    inCart(product.key)
                      ? "border-[#1F3864] shadow-md"
                      : "border-gray-100 hover:border-[#1F3864]/20 hover:shadow-sm"
                  }`}
                >
                  {product.recommended && (
                    <span className="absolute -top-2.5 left-4 bg-[#C9A961] text-white text-xs font-bold px-3 py-0.5 rounded-full">
                      추천
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[#1F3864] text-sm">{product.name}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">{product.desc}</p>
                    </div>
                    <span className="text-[#1F3864] font-bold text-sm ml-3 whitespace-nowrap">
                      ₩{product.amount.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => inCart(product.key) ? removeFromCart(product.key) : addToCart(product.key)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      inCart(product.key)
                        ? "bg-[#1F3864] text-white"
                        : "bg-[#1F3864]/5 text-[#1F3864] hover:bg-[#1F3864]/10"
                    }`}
                  >
                    {inCart(product.key) ? (
                      <><Check className="w-4 h-4" />선택됨 (제거)</>
                    ) : (
                      "선택하기"
                    )}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* 결제 수단 안내 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-[#1F3864] text-sm mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#C9A961]" />
                지원 결제 수단
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: "💳", name: "신용/체크카드", desc: "Visa, Mastercard, AMEX" },
                  { icon: "🔵", name: "구글 페이", desc: "Google Pay" },
                  { icon: "🍎", name: "애플 페이", desc: "Apple Pay" },
                  { icon: "🌍", name: "195개국", desc: "글로벌 결제" },
                ].map((method) => (
                  <div key={method.name} className="text-center p-3 bg-[#FAFAF8] rounded-xl">
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <div className="text-xs font-semibold text-[#1F3864]">{method.name}</div>
                    <div className="text-xs text-gray-400">{method.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6 shadow-sm">
              <h2 className="font-bold text-[#1F3864] mb-4">주문 요약</h2>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-300">
                  <CreditCard className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">선택된 상품이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-[#1F3864]">{item.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">₩{item.amount.toLocaleString()}</span>
                        <button
                          onClick={() => removeFromCart(item.key)}
                          className="text-gray-300 hover:text-red-400 text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <>
                  <div className="border-t border-gray-100 pt-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#1F3864]">합계</span>
                      <span className="text-[#C9A961] font-bold text-xl">₩{total.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">USD 환산: ~${(total / 1350).toFixed(2)}</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">이메일 (영수증 발송)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-all"
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || isLoading}
                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  cart.length > 0 && !isLoading
                    ? "bg-[#C9A961] hover:bg-[#b8944f] text-white shadow-md hover:shadow-lg"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />처리 중...</>
                ) : (
                  <><CreditCard className="w-4 h-4" />결제하기</>
                )}
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Shield className="w-3 h-3" />
                <span>Stripe 보안 결제 · SSL 암호화</span>
              </div>

              <p className="text-center text-xs text-gray-300 mt-2">
                테스트 카드: 4242 4242 4242 4242
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
