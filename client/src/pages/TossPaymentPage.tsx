/**
 * EverWill 토스페이먼츠 결제 페이지 (/payment/toss)
 * 한국 사용자 전용 - 카드, 가상계좌, 계좌이체 지원
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Shield, ArrowLeft, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Link, useSearch, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { loadTossPayments } from "@tosspayments/payment-sdk";

type ProductCode =
  | "cert_basic"
  | "cert_gold"
  | "cert_platinum"
  | "cert_vip"
  | "cert_renewal"
  | "video_will"
  | "handwriting_scan"
  | "badge_essential"
  | "badge_wearable"
  | "badge_necklace"
  | "badge_premium";

interface CartItem {
  code: ProductCode;
  name: string;
  amount: number;
}

const PRODUCTS: {
  code: ProductCode;
  name: string;
  desc: string;
  amount: number;
  category: string;
  recommended?: boolean;
  badge?: string;
  includes?: string[];
}[] = [
  {
    code: "cert_basic",
    name: "전자 인증 (1년 보관)",
    desc: "유언장 전자 인증 · 블록체인 해시 기록 · 인증서 발급",
    amount: 168000,
    category: "인증",
    includes: ["무료 수정 1회", "추가 수정 ₩5,000/회"],
  },
  {
    code: "cert_gold",
    name: "전자 인증 Gold (3년 보관)",
    desc: "3년 보관 + 무료 수정 2회",
    amount: 79000,
    category: "인증",
    includes: ["무료 수정 2회", "추가 수정 ₩5,000/회"],
  },
  {
    code: "cert_platinum",
    name: "전자 인증 Platinum (5년 보관)",
    desc: "5년 보관 + 무료 수정 3회 + 모든 서비스 포함",
    amount: 168000,
    category: "인증",
    recommended: true,
    includes: ["무료 수정 3회", "영상 유언장", "자필 스캔"],
  },
  {
    code: "cert_vip",
    name: "전자 인증 VIP (영구 보관)",
    desc: "평생 보관 · 수정 무제한 무료 · 모든 서비스 포함",
    amount: 199000,
    category: "인증",
    badge: "VIP",
    includes: ["수정 무제한", "영상 유언장", "자필 스캔", "Life Story"],
  },
  {
    code: "cert_renewal",
    name: "유언장 재인증",
    desc: "기존 유언장 수정 후 재인증 (1회)",
    amount: 15000,
    category: "인증",
  },
  {
    code: "video_will",
    name: "영상 유언장",
    desc: "법적 녹음 유언 + 가족 감성 메시지 · 평생 보관",
    amount: 29000,
    category: "부가서비스",
  },
  {
    code: "handwriting_scan",
    name: "자필 유언장 스캔",
    desc: "자필 원본 업로드 · AI 형식 검증 · 블록체인 기록",
    amount: 19000,
    category: "부가서비스",
  },
  {
    code: "badge_essential",
    name: "Badge Essential",
    desc: "스테인레스 카드형 · QR + NFC",
    amount: 168000,
    category: "Badge",
  },
  {
    code: "badge_wearable",
    name: "Badge Wearable",
    desc: "실리콘·티타늄 팔찌형 · QR + NFC",
    amount: 79000,
    category: "Badge",
  },
  {
    code: "badge_necklace",
    name: "Badge Necklace",
    desc: "스테인레스·로즈골드 목걸이형 · QR + NFC",
    amount: 168000,
    category: "Badge",
  },
  {
    code: "badge_premium",
    name: "Badge Premium",
    desc: "티타늄·플래티넘 · QR + NFC",
    amount: 299000,
    category: "Badge",
    badge: "VIP",
  },
];

const CATEGORIES = ["인증", "부가서비스", "Badge"];
const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || "";

export default function TossPaymentPage() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("인증");
  const [isLoading, setIsLoading] = useState(false);
  const search = useSearch();

  // URL 파라미터에서 product 추출
  const params = new URLSearchParams(search);
  const productParam = params.get("product") as ProductCode | null;

  // 진입 시 상품 자동 선택
  useEffect(() => {
    if (productParam && PRODUCTS.find((p) => p.code === productParam)) {
      const product = PRODUCTS.find((p) => p.code === productParam)!;
      setCart([{ code: productParam, name: product.name, amount: product.amount }]);
      setActiveCategory(product.category);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createOrderMutation = trpc.tossPayment.createOrder.useMutation();

  const addToCart = (code: ProductCode) => {
    const product = PRODUCTS.find((p) => p.code === code)!;
    setCart((prev) => {
      if (prev.find((i) => i.code === code)) return prev;
      return [...prev, { code, name: product.name, amount: product.amount }];
    });
    toast.success(`${product.name} 추가됨`);
  };

  const removeFromCart = (code: ProductCode) => {
    setCart((prev) => prev.filter((i) => i.code !== code));
  };

  const total = cart.reduce((sum, item) => sum + item.amount, 0);
  const inCart = (code: ProductCode) => cart.some((i) => i.code === code);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다.");
      window.location.href = getLoginUrl();
      return;
    }

    if (cart.length === 0) {
      toast.error("결제할 상품을 선택해주세요.");
      return;
    }

    // 복수 상품은 첫 번째 상품으로 결제 (토스페이먼츠는 단건 결제)
    const firstItem = cart[0];
    setIsLoading(true);

    try {
      // 1. 서버에서 주문 ID 발급
      const order = await createOrderMutation.mutateAsync({
        productCode: firstItem.code,
      });

      // 2. 토스페이먼츠 SDK 로드
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

      // 3. 결제 요청
      await tossPayments.requestPayment("카드", {
        amount: order.amount,
        orderId: order.orderId,
        orderName: order.orderName,
        customerName: order.customerName || user?.name || "고객",
        customerEmail: order.customerEmail || user?.email || "",
        successUrl: `${window.location.origin}/payment/toss/success`,
        failUrl: `${window.location.origin}/payment/toss/fail`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "결제 오류가 발생했습니다.";
      if (msg !== "결제가 취소되었습니다.") {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <span
              className="text-[#C9A961] font-bold text-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              EverWill
            </span>
            <span className="text-white/60 text-sm">결제</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-white/60 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>토스페이먼츠 보안 결제</span>
            <Lock className="w-3.5 h-3.5 ml-2" />
            <span>SSL 암호화</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 상품 목록 */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1
                className="text-2xl font-bold text-[#1F3864]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                서비스 선택
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                원하는 서비스를 선택하고 토스페이먼츠로 안전하게 결제하세요.
              </p>
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
                  key={product.code}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative bg-white rounded-2xl border-2 p-5 transition-all ${
                    inCart(product.code)
                      ? "border-[#1F3864] shadow-md"
                      : "border-gray-100 hover:border-[#1F3864]/20 hover:shadow-sm"
                  }`}
                >
                  {product.recommended && (
                    <span className="absolute -top-2.5 left-4 bg-[#C9A961] text-white text-xs font-bold px-3 py-0.5 rounded-full">
                      추천
                    </span>
                  )}
                  {product.badge && (
                    <span className="absolute -top-2.5 right-4 bg-[#1F3864] text-[#C9A961] text-xs font-bold px-3 py-0.5 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1F3864] text-sm">{product.name}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">{product.desc}</p>
                      {product.includes && product.includes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.includes.map((item) => (
                            <span
                              key={item}
                              className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full"
                            >
                              <Check className="w-3 h-3" />
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <span className="text-[#1F3864] font-bold text-sm whitespace-nowrap">
                        ₩{product.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      inCart(product.code)
                        ? removeFromCart(product.code)
                        : addToCart(product.code)
                    }
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      inCart(product.code)
                        ? "bg-[#1F3864] text-white"
                        : "bg-[#1F3864]/5 text-[#1F3864] hover:bg-[#1F3864]/10"
                    }`}
                  >
                    {inCart(product.code) ? (
                      <>
                        <Check className="w-4 h-4" />
                        선택됨 (제거)
                      </>
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
                지원 결제 수단 (토스페이먼츠)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: "💳", name: "신용/체크카드", desc: "국내 모든 카드" },
                  { icon: "🏦", name: "계좌이체", desc: "실시간 이체" },
                  { icon: "🏧", name: "가상계좌", desc: "무통장 입금" },
                  { icon: "📱", name: "간편결제", desc: "카카오페이, 토스" },
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
                    <div key={item.code} className="flex items-center justify-between">
                      <div className="text-sm font-medium text-[#1F3864] flex-1 pr-2">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold">
                          ₩{item.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.code)}
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
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1F3864]">합계</span>
                    <span className="text-[#C9A961] font-bold text-xl">
                      ₩{total.toLocaleString()}
                    </span>
                  </div>
                  {user && (
                    <p className="text-xs text-gray-400 mt-1">
                      결제자: {user.name || user.email}
                    </p>
                  )}
                </div>
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
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    토스페이먼츠로 결제
                  </>
                )}
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Shield className="w-3 h-3" />
                <span>토스페이먼츠 보안 결제 · SSL 암호화</span>
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
