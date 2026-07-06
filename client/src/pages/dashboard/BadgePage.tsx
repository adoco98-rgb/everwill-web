
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Package, QrCode, ShoppingCart, CheckCircle, Clock, Truck } from "lucide-react";
import { toast } from "sonner";

// 카드 라인업 정의
const CARD_LINEUP = [
  {
    id: "essential",
    name: "Essential 카드",
    subtitle: "실버 · 스테인레스",
    price: 168000,
    priceUsd: 49,
    color: "from-gray-300 to-gray-500",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
    features: ["QR 코드 내장", "신원 확인", "유언 인증", "응급 의료 정보"],
    badge: "기본",
    badgeColor: "bg-gray-100 text-gray-700",
  },
  {
    id: "gold",
    name: "Gold 카드",
    subtitle: "골드 · 티타늄",
    price: 168000,
    priceUsd: 99,
    color: "from-yellow-400 to-yellow-600",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-400",
    features: ["QR + NFC 내장", "신원 확인", "유언 인증", "응급 의료 정보", "글로벌 인식"],
    badge: "인기",
    badgeColor: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "platinum",
    name: "Platinum 카드",
    subtitle: "플래티넘 · 프리미엄",
    price: 299000,
    priceUsd: 299,
    color: "from-slate-400 to-slate-700",
    textColor: "text-slate-800",
    borderColor: "border-slate-400",
    features: ["QR + NFC + 블루투스", "신원 확인", "유언 인증", "응급 의료 정보", "글로벌 인식", "VIP 지원"],
    badge: "프리미엄",
    badgeColor: "bg-slate-100 text-slate-700",
  },
];

export default function BadgePage() {
  // 내 카드 주문 내역 (추후 DB 연동 예정)
  const orders: any[] = [];
  const isLoading = false;

  const handleOrder = (_cardId: string) => {
    toast.info("카드 주문 기능은 곧 오픈됩니다. 관심 가져주셔서 감사합니다!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]">EverWill 카드 관리</h1>
        <p className="text-gray-500 mt-1">
          물리적 인증 카드로 신원 확인, 유언 인증, 응급 의료 정보를 한 번에 관리하세요.
        </p>
      </div>

      {/* 내 카드 현황 */}
      <Card className="border-[#1F3864]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1F3864]">
            <CreditCard className="w-5 h-5" />
            내 카드 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">불러오는 중...</div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1F3864] to-[#C9A961] flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{order.cardType}</p>
                      <p className="text-xs text-gray-500">주문번호: {order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === "delivered" && (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        <CheckCircle className="w-3 h-3 mr-1" /> 배송 완료
                      </Badge>
                    )}
                    {order.status === "shipping" && (
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        <Truck className="w-3 h-3 mr-1" /> 배송 중
                      </Badge>
                    )}
                    {order.status === "pending" && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-0">
                        <Clock className="w-3 h-3 mr-1" /> 제작 중
                      </Badge>
                    )}
                    {order.qrCode && (
                      <Button variant="outline" size="sm" className="text-xs">
                        <QrCode className="w-3 h-3 mr-1" /> QR 보기
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">아직 주문한 카드가 없습니다</p>
              <p className="text-gray-400 text-sm mt-1">아래에서 원하는 카드를 선택해 주세요</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 카드 라인업 */}
      <div>
        <h2 className="text-lg font-bold text-[#1F3864] mb-4">카드 라인업</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARD_LINEUP.map((card) => (
            <Card key={card.id} className={`border-2 ${card.borderColor} hover:shadow-lg transition-all cursor-pointer`}>
              <CardContent className="p-5">
                {/* 카드 미리보기 */}
                <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${card.color} mb-4 flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
                  <div className="text-center z-10">
                    <p className="text-white font-bold text-sm drop-shadow">EverWill</p>
                    <p className="text-white/80 text-xs">Digital Will OS</p>
                  </div>
                </div>

                {/* 카드 정보 */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-[#1F3864]">{card.name}</p>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                {/* 기능 목록 */}
                <ul className="space-y-1 mb-4">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* 가격 및 주문 버튼 */}
                <div className="border-t pt-3">
                  <p className="text-lg font-bold text-[#1F3864]">
                    ₩{card.price.toLocaleString()}
                    <span className="text-xs text-gray-400 font-normal ml-1">(${card.priceUsd})</span>
                  </p>
                  <Button
                    className="w-full mt-2 bg-[#1F3864] hover:bg-[#1F3864]/90 text-white text-sm"
                    size="sm"
                    onClick={() => handleOrder(card.id)}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                    주문하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 안내 */}
      <Card className="bg-[#1F3864]/5 border-[#1F3864]/20">
        <CardContent className="p-4 flex gap-3">
          <QrCode className="w-5 h-5 text-[#1F3864] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-[#1F3864] mb-1">카드 기능 안내</p>
            <p>카드에 내장된 QR 코드를 스캔하면 응급 시 의료진이 가족 연락처와 의료 정보를 확인할 수 있습니다. 또한 장례식장·병원에서 카드 발견 시 자동 사망 알림이 발송됩니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
