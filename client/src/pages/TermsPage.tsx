/**
 * 서비스 이용약관 페이지 (/terms)
 * 전자상거래법·정보통신망법 기준 작성
 * 회사명: 주식회사 사람 / 서비스명: EverWill
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#C9A961]" />
            <div>
              <h1 className="text-2xl font-bold">서비스 이용약관</h1>
              <p className="text-white/60 text-sm mt-1">최종 수정일: 2025년 8월 1일</p>
            </div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10 text-[#1A1A1A]">

        {/* 제1조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제1조 (목적)</h2>
          <p className="text-sm leading-7 text-gray-700">
            이 약관은 주식회사 사람(이하 "회사")이 운영하는 EverWill 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        {/* 제2조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제2조 (정의)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li><strong>"서비스"</strong>란 회사가 제공하는 디지털 유언장 작성·보관·인증 및 관련 부가 서비스 일체를 말합니다.</li>
              <li><strong>"이용자"</strong>란 이 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
              <li><strong>"회원"</strong>이란 회사에 개인정보를 제공하여 회원 등록을 한 자로서, 서비스를 지속적으로 이용할 수 있는 자를 말합니다.</li>
              <li><strong>"유언장"</strong>이란 이용자가 서비스를 통해 작성·저장한 디지털 유언 문서를 말합니다.</li>
              <li><strong>"Badge"</strong>란 회사가 제공하는 물리적 인증 패(카드·팔찌·목걸이 등)를 말합니다.</li>
            </ol>
          </div>
        </section>

        {/* 제3조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제3조 (약관의 효력 및 변경)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① 이 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.</p>
            <p>② 회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경 시 최소 7일 전에 서비스 내 공지사항을 통해 안내합니다. 단, 이용자에게 불리한 변경의 경우 30일 전에 공지합니다.</p>
            <p>③ 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.</p>
          </div>
        </section>

        {/* 제4조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제4조 (회원 가입)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① 이용자는 회사가 정한 가입 양식에 따라 회원 정보를 기입한 후 이 약관에 동의함으로써 회원 가입을 신청합니다.</p>
            <p>② 회사는 다음 각 호에 해당하는 경우 가입 신청을 거부하거나 사후에 이용 계약을 해지할 수 있습니다.</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>타인의 명의를 도용하거나 허위 정보를 기재한 경우</li>
              <li>만 14세 미만인 경우</li>
              <li>이전에 서비스 이용 자격을 상실한 경우</li>
              <li>기타 관련 법령에 위반되는 경우</li>
            </ol>
          </div>
        </section>

        {/* 제5조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제5조 (서비스 이용)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 원칙으로 합니다.</p>
            <p>② 회사는 서비스를 일정 범위로 분할하여 각 범위별로 이용 가능 시간을 별도로 정할 수 있으며, 이 경우 그 내용을 사전에 공지합니다.</p>
            <p>③ 회사는 컴퓨터 등 정보통신설비의 보수 점검, 교체 및 고장, 통신 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
          </div>
        </section>

        {/* 제6조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제6조 (유료 서비스 및 결제)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① 유언장 작성 및 기본 기능은 무료로 제공됩니다.</p>
            <p>② 전자 인증, 영상 유언, 자필 스캔 인증, Badge 구매 등 유료 서비스는 별도 요금이 부과됩니다.</p>
            <p>③ 결제는 신용카드, 계좌이체, 간편결제 등 회사가 지정한 방법으로 이루어집니다.</p>
            <p>④ 디지털 서비스 특성상 인증 완료 후에는 환불이 제한될 수 있으며, 구체적인 환불 정책은 별도 고지합니다.</p>
          </div>
        </section>

        {/* 제7조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제7조 (이용자의 의무)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 송신 또는 게시</li>
              <li>회사 및 제3자의 저작권 등 지식재산권 침해</li>
              <li>회사 및 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>허위 유언장 작성 또는 타인을 사칭한 유언장 작성</li>
              <li>기타 불법적이거나 부당한 행위</li>
            </ol>
          </div>
        </section>

        {/* 제8조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제8조 (법적 고지)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① EverWill 서비스는 유언장 작성을 위한 정보 제공 서비스이며, 법률 자문 서비스가 아닙니다.</p>
            <p>② 서비스를 통해 작성된 유언장의 법적 효력은 관련 법령 및 법원의 판단에 따르며, 회사는 이에 대한 법적 책임을 지지 않습니다.</p>
            <p>③ 복잡한 법률 문제에 대해서는 반드시 변호사 등 전문가와 상담하시기 바랍니다.</p>
          </div>
        </section>

        {/* 제9조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제9조 (면책 조항)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
            <p>② 회사는 이용자의 귀책 사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
            <p>③ 회사는 이용자가 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</p>
          </div>
        </section>

        {/* 제10조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제10조 (분쟁 해결)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① 회사는 이용자로부터 제출되는 불만 사항 및 의견을 우선적으로 처리합니다.</p>
            <p>② 이 약관에 관한 분쟁은 대한민국 법률을 준거법으로 하며, 분쟁 발생 시 서울중앙지방법원을 관할 법원으로 합니다.</p>
          </div>
        </section>

        {/* 부칙 */}
        <section className="bg-[#1F3864]/5 rounded-xl p-5">
          <h2 className="text-base font-bold text-[#1F3864] mb-2">부칙</h2>
          <p className="text-sm text-gray-600">이 약관은 2025년 8월 1일부터 시행합니다.</p>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p><strong>회사명:</strong> 주식회사 사람</p>
            <p><strong>서비스명:</strong> EverWill</p>
            <p><strong>문의:</strong> adoco98@gmail.com</p>
          </div>
        </section>

        {/* 하단 링크 */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <Link href="/privacy" className="text-sm text-[#1F3864] underline hover:text-[#C9A961] transition-colors">
            개인정보처리방침 보기
          </Link>
          <Link href="/login" className="text-sm text-[#1F3864] underline hover:text-[#C9A961] transition-colors">
            회원가입으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
