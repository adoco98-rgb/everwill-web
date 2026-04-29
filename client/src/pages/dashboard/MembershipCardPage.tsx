/**
 * 멤버십 카드 페이지
 * - 내 개인 QR 코드 표시
 * - 멤버십 카드 미리보기 (인쇄용)
 * - QR 코드 다운로드
 * - QR 공개 여부 설정
 */
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import QRCode from "qrcode";
import { Download, Eye, EyeOff, Shield, CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function MembershipCardPage() {
  const { user } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const { data: qrData, isLoading } = trpc.qr.getMyQr.useQuery();
  const updatePublic = trpc.qr.updateQrPublic.useMutation({
    onSuccess: () => {
      toast.success("설정이 저장되었습니다.");
      utils.qr.getMyQr.invalidate();
    },
  });
  const utils = trpc.useUtils();

  // QR 코드 URL 생성
  const profileUrl = qrData?.qrCode
    ? `${window.location.origin}/profile/${qrData.qrCode}`
    : "";

  useEffect(() => {
    if (!profileUrl) return;
    QRCode.toDataURL(profileUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#1F3864", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [profileUrl]);

  // QR 코드 PNG 다운로드
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "everwill-qr.png";
    a.click();
  };

  // 멤버십 카드 인쇄
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1F3864]/30 border-t-[#1F3864] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]">나의 멤버십 카드</h1>
        <p className="text-gray-500 mt-1 text-sm">QR 코드를 스캔하면 EverWill 가입 확인 페이지로 연결됩니다.</p>
      </div>

      {/* 멤버십 카드 미리보기 (인쇄 시 이 영역만 출력) */}
      <div
        id="membership-card"
        className="bg-gradient-to-br from-[#1F3864] to-[#2a4a80] rounded-3xl p-8 text-white shadow-2xl print:shadow-none print:rounded-none"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-[#C9A961]" />
              <span className="text-[#C9A961] font-bold text-lg tracking-wide">EverWill</span>
            </div>
            <p className="text-white/60 text-xs">디지털 유언 보관 서비스</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-[#C9A961]" />
        </div>

        <div className="flex items-center gap-6">
          {/* QR 코드 */}
          <div className="bg-white rounded-2xl p-3 flex-shrink-0">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-28 h-28" />
            ) : (
              <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-400 text-xs">생성 중...</span>
              </div>
            )}
          </div>

          {/* 카드 정보 */}
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-xs mb-1">회원명</p>
            <p className="text-white font-bold text-xl mb-4 truncate">{user?.name ?? "회원"}</p>
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <p className="text-white/80 text-xs leading-relaxed">
                나는 <span className="text-[#C9A961] font-semibold">EverWill</span>에<br />
                나의 유언을 디지털 저장<br />
                인증하였습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20">
          <p className="text-white/40 text-xs text-center break-all">{profileUrl}</p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="grid grid-cols-2 gap-3 print:hidden">
        <Button
          onClick={handleDownloadQr}
          variant="outline"
          className="h-12 border-[#1F3864] text-[#1F3864] hover:bg-[#1F3864] hover:text-white"
          disabled={!qrDataUrl}
        >
          <Download className="w-4 h-4 mr-2" />
          QR 다운로드
        </Button>
        <Button
          onClick={handlePrint}
          className="h-12 bg-[#1F3864] hover:bg-[#162a4e] text-white"
        >
          <Printer className="w-4 h-4 mr-2" />
          카드 인쇄
        </Button>
      </div>

      {/* QR 공개 설정 */}
      <div className="bg-gray-50 rounded-2xl p-5 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {qrData?.qrPublic ? (
              <Eye className="w-5 h-5 text-green-500" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <Label className="text-sm font-semibold text-gray-700 cursor-pointer">
                QR 공개 프로필
              </Label>
              <p className="text-xs text-gray-400 mt-0.5">
                {qrData?.qrPublic
                  ? "QR 스캔 시 이름·주소(마스킹)가 표시됩니다."
                  : "QR 스캔 시 가입 확인만 표시됩니다."}
              </p>
            </div>
          </div>
          <Switch
            checked={!!qrData?.qrPublic}
            onCheckedChange={(checked) => updatePublic.mutate({ isPublic: checked })}
            disabled={updatePublic.isPending}
          />
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="bg-[#C9A961]/10 rounded-2xl p-4 print:hidden">
        <p className="text-sm text-[#8a6d30] leading-relaxed">
          <strong>멤버십 카드 사용 안내</strong><br />
          QR 코드를 멤버십 카드에 인쇄하여 소지하시면, 누구든 QR을 스캔하여 EverWill 가입 여부를 확인할 수 있습니다.
          카드 분실 시 실비로 재발급 가능합니다.
        </p>
      </div>
    </div>
  );
}
