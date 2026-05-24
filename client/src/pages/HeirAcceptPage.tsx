import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Crown, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Banknote } from "lucide-react";

/**
 * 상속인 초대 수락 페이지
 * - URL: /heir/accept/:token
 * - 사망 감지 후 자동 발송된 초대 링크로 접근
 * - 본인인증 후 자기 몫(또는 전체) 유언 내용 열람
 */
export default function HeirAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const [accepted, setAccepted] = useState(false);

  // 초대 정보 조회
  const { data: invitation, isLoading, error } = trpc.heirs.verifyInvitationToken.useQuery(
    { token: token ?? "" },
    { enabled: !!token, retry: false }
  );

  // 초대 수락 뮤테이션
  const acceptMutation = trpc.heirs.acceptInvitation.useMutation({
    onSuccess: () => {
      setAccepted(true);
    },
  });

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#1F3864] mx-auto mb-4" />
          <p className="text-gray-500">초대 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 오류 (만료, 잘못된 토큰 등)
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <CardTitle className="text-red-600">초대 링크가 유효하지 않습니다</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              링크가 만료되었거나 이미 사용된 초대입니다.<br />
              문의가 필요하시면 EverWill 고객센터로 연락해주세요.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 수낙 완료
  if (accepted) {
    const inv = invitation?.heir;
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-green-200">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <CardTitle className="text-green-700">초대를 수낙했습니다</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              EverWill 계정을 만들거나 로그인하면<br />
              상속 내용을 확인할 수 있습니다.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
              <p className="text-xs text-gray-500 font-medium">확인 가능한 내용</p>
              {inv?.accessLevel === "full" ? (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Eye className="w-4 h-4" />
                  <span>전체 유언 내용 열람 (집행자 권한)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <EyeOff className="w-4 h-4" />
                  <span>본인 상속 내용만 열람</span>
                </div>
              )}
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-[#1F3864] hover:bg-[#162a4e] text-white"
            >
              로그인 / 회원가입
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 초대 수락 화면
  const heir = invitation.heir;
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-4">
        {/* EverWill 로고 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1F3864]">EverWill</h1>
          <p className="text-sm text-gray-500 mt-1">디지털 유언 플랫폼</p>
        </div>

        <Card className="border-[#1F3864]/20 shadow-md">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-[#1F3864]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              {heir.isExecutor ? (
                <ShieldCheck className="w-8 h-8 text-purple-600" />
              ) : heir.priority === 1 ? (
                <Crown className="w-8 h-8 text-[#C9A961]" />
              ) : (
                <Eye className="w-8 h-8 text-[#1F3864]" />
              )}
            </div>
            <CardTitle className="text-[#1F3864]">상속 초대장</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              유언자로부터 상속 초대를 받으셨습니다
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 초대 정보 */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">상속인 이름</span>
                <span className="text-sm font-semibold text-[#1F3864]">{heir.nameKo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">역할</span>
                <div className="flex items-center gap-2">
                  {heir.isExecutor ? (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 border text-xs">
                      유언 집행자
                    </Badge>
                  ) : (
                    <Badge variant="outline" className={heir.priority === 1 ? "border-[#C9A961] text-[#C9A961]" : "border-gray-300 text-gray-500"}>
                      제{heir.priority}상속인
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">열람 권한</span>
                <div className="flex items-center gap-1 text-sm">
                  {heir.accessLevel === "full" ? (
                    <><Eye className="w-3 h-3 text-green-600" /><span className="text-green-600">전체 열람</span></>
                  ) : (
                    <><EyeOff className="w-3 h-3 text-blue-600" /><span className="text-blue-600">본인 몶만</span></>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">가입 요금</span>
                <div className="flex items-center gap-1 text-sm font-semibold text-[#C9A961]">
                  <Banknote className="w-3 h-3" />
                  {heir.heirFee ? `₩${heir.heirFee.toLocaleString()}` : heir.isExecutor ? "₩149,000" : heir.priority === 1 ? "₩99,000" : "₩49,000"}
                </div>
              </div>
            </div>

            {/* 법적 고지 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700">
                ⚠️ 본 초대는 유언자의 사망이 확인된 후 발송됩니다.
                초대 수락 후 본인인증(eKYC)이 필요하며, 인증 완료 후 상속 내용을 확인할 수 있습니다.
              </p>
            </div>

            {/* 수락 버튼 */}
            <Button
              onClick={() => acceptMutation.mutate({ token: token ?? "" })}
              disabled={acceptMutation.isPending}
              className="w-full bg-[#1F3864] hover:bg-[#162a4e] text-white h-12 text-base font-semibold"
            >
              {acceptMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />처리 중...</>
              ) : (
                "초대 수락하기"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full text-gray-400 hover:text-gray-600"
            >
              거절하기
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400">
          EverWill은 개인정보를 E2E 암호화하여 안전하게 보호합니다.
        </p>
      </div>
    </div>
  );
}
