/**
 * 개인정보처리방침 페이지 (/privacy)
 * 개인정보보호법·정보통신망법 기준 작성
 * 회사명: 주식회사 사람 / 서비스명: EverWill
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
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
            <Shield className="w-8 h-8 text-[#C9A961]" />
            <div>
              <h1 className="text-2xl font-bold">개인정보처리방침</h1>
              <p className="text-white/60 text-sm mt-1">최종 수정일: 2025년 8월 1일 | 시행일: 2025년 8월 1일</p>
            </div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10 text-[#1A1A1A]">

        {/* 개요 */}
        <section className="bg-[#C9A961]/10 rounded-xl p-5 border border-[#C9A961]/30">
          <p className="text-sm leading-7 text-gray-700">
            주식회사 사람(이하 "회사")은 개인정보보호법 제30조에 따라 정보 주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>
        </section>

        {/* 제1조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제1조 (개인정보의 처리 목적)</h2>
          <p className="text-sm leading-7 text-gray-700 mb-3">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#1F3864] text-white">
                  <th className="p-3 text-left font-semibold rounded-tl-lg">처리 목적</th>
                  <th className="p-3 text-left font-semibold rounded-tr-lg">수집 항목</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-white">
                  <td className="p-3 text-gray-700">회원 가입 및 관리</td>
                  <td className="p-3 text-gray-600">이름, 이메일, 휴대폰 번호, 생년월일, 주소, 국적</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 text-gray-700">유언장 작성 및 보관</td>
                  <td className="p-3 text-gray-600">유언 내용, 자산 정보, 상속자 정보, 서명 이미지</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 text-gray-700">본인인증</td>
                  <td className="p-3 text-gray-600">성명, 생년월일, 휴대폰 번호, 인증 결과값</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 text-gray-700">결제 처리</td>
                  <td className="p-3 text-gray-600">결제 수단 정보(카드사 처리, 회사 미보관)</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 text-gray-700">고객 지원</td>
                  <td className="p-3 text-gray-600">문의 내용, 이메일, 연락처</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 text-gray-700">마케팅 및 광고 (선택)</td>
                  <td className="p-3 text-gray-600">이메일, 휴대폰 번호</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 제2조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제2조 (개인정보의 처리 및 보유 기간)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① 회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보 주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1F3864] text-white">
                    <th className="p-3 text-left font-semibold rounded-tl-lg">항목</th>
                    <th className="p-3 text-left font-semibold">보유 기간</th>
                    <th className="p-3 text-left font-semibold rounded-tr-lg">근거</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white">
                    <td className="p-3 text-gray-700">회원 정보</td>
                    <td className="p-3 text-gray-600">탈퇴 후 30일</td>
                    <td className="p-3 text-gray-600">회사 정책</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 text-gray-700">유언장 데이터</td>
                    <td className="p-3 text-gray-600">회원 요청 삭제 시까지</td>
                    <td className="p-3 text-gray-600">서비스 특성</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-3 text-gray-700">전자상거래 기록</td>
                    <td className="p-3 text-gray-600">5년</td>
                    <td className="p-3 text-gray-600">전자상거래법</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 text-gray-700">접속 로그</td>
                    <td className="p-3 text-gray-600">3개월</td>
                    <td className="p-3 text-gray-600">통신비밀보호법</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 제3조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제3조 (개인정보의 제3자 제공)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① 회사는 정보 주체의 개인정보를 제1조에서 명시한 목적 범위 내에서만 처리하며, 정보 주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 제3자에게 제공합니다.</p>
            <p>② 서비스 이용 중 이용자가 직접 지정한 상속자·수익자에게는 이용자의 사후 또는 이용자의 명시적 요청에 따라 관련 정보가 제공될 수 있습니다.</p>
            <p>③ 변호사 매칭 서비스 이용 시, 이용자의 동의를 받아 매칭된 변호사에게 필요한 정보가 제공됩니다.</p>
          </div>
        </section>

        {/* 제4조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제4조 (개인정보의 안전성 확보 조치)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>개인정보 취급 직원의 최소화 및 교육</li>
              <li>개인정보에 대한 접근 제한</li>
              <li>개인정보를 저장하는 데이터베이스 시스템에 대한 접근 통제</li>
              <li>개인정보의 암호화 (비밀번호, 민감 정보 등)</li>
              <li>해킹 등에 대비한 기술적 대책 (보안 프로그램 설치, 주기적 갱신·점검)</li>
              <li>개인정보 처리 시스템 등의 접속 기록 보관 및 위·변조 방지</li>
            </ul>
          </div>
        </section>

        {/* 제5조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제5조 (정보 주체의 권리·의무 및 행사 방법)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① 정보 주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p>② 권리 행사는 서비스 내 마이페이지 또는 이메일(adoco98@gmail.com)을 통해 요청하실 수 있습니다.</p>
          </div>
        </section>

        {/* 제6조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제6조 (쿠키의 설치·운영 및 거부)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>① 회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 쿠키(cookie)를 사용합니다.</p>
            <p>② 이용자는 웹 브라우저 옵션 설정을 통해 쿠키 허용, 차단 등의 설정을 할 수 있습니다. 단, 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.</p>
          </div>
        </section>

        {/* 제7조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제7조 (개인정보 보호책임자)</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-700 space-y-2">
            <p className="font-semibold text-[#1F3864]">개인정보 보호책임자</p>
            <p><strong>성명:</strong> 라수환</p>
            <p><strong>직책:</strong> 대표이사</p>
            <p><strong>이메일:</strong> adoco98@gmail.com</p>
            <p className="pt-2 text-gray-500 text-xs">정보 주체는 서비스를 이용하면서 발생한 모든 개인정보 보호 관련 문의, 불만 처리, 피해 구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.</p>
          </div>
        </section>

        {/* 제8조 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제8조 (권익 침해 구제 방법)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-2">
            <p>정보 주체는 개인정보 침해로 인한 구제를 받기 위하여 아래 기관에 분쟁 해결이나 상담 등을 신청할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 / www.kopico.go.kr</li>
              <li>개인정보침해신고센터: (국번없이) 118 / privacy.kisa.or.kr</li>
              <li>대검찰청: (국번없이) 1301 / www.spo.go.kr</li>
              <li>경찰청: (국번없이) 182 / ecrm.cyber.go.kr</li>
            </ul>
          </div>
        </section>

        {/* 제9조 - 마케팅 수신 동의 */}
        <section>
          <h2 className="text-lg font-bold text-[#1F3864] mb-3 pb-2 border-b border-[#C9A961]/30">제9조 (마케팅 정보 수신 동의)</h2>
          <div className="text-sm leading-7 text-gray-700 space-y-3">
            <p>① 회사는 이용자의 별도 동의를 받은 경우에 한하여 다음과 같은 마케팅 정보를 발송합니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1F3864] text-white">
                    <th className="p-3 text-left font-semibold rounded-tl-lg">수신 채널</th>
                    <th className="p-3 text-left font-semibold">발송 내용</th>
                    <th className="p-3 text-left font-semibold rounded-tr-lg">동의 여부</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white">
                    <td className="p-3 text-gray-700">이메일</td>
                    <td className="p-3 text-gray-600">신규 서비스 안내, 이벤트·할인 정보, 유언 관련 법률 정보</td>
                    <td className="p-3 text-gray-600">선택 동의</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 text-gray-700">SMS/카카오톡</td>
                    <td className="p-3 text-gray-600">이벤트 알림, 서비스 업데이트 안내</td>
                    <td className="p-3 text-gray-600">선택 동의</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-3 text-gray-700">앱 푸시</td>
                    <td className="p-3 text-gray-600">유언장 업데이트 알림, 서비스 공지</td>
                    <td className="p-3 text-gray-600">선택 동의</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>② 마케팅 수신 동의는 회원가입 시 또는 마이페이지에서 언제든지 변경할 수 있습니다.</p>
            <p>③ 마케팅 수신 동의를 철회하더라도 서비스 이용에는 불이익이 없습니다.</p>
            <p>④ 마케팅 정보 수신에 동의한 경우, 수집된 이메일 및 휴대폰 번호는 마케팅 목적으로만 활용되며 제3자에게 제공되지 않습니다.</p>
            <div className="bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-lg p-4 mt-2">
              <p className="text-xs text-gray-600"><strong>※ 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조</strong>에 따라 수신 동의를 받은 경우에만 광고성 정보를 발송하며, 수신 거부 방법을 명시합니다. 수신 거부는 이메일 하단의 '수신 거부' 링크 또는 마이페이지 &gt; 알림 설정에서 처리할 수 있습니다.</p>
            </div>
          </div>
        </section>

        {/* 부칙 */}
        <section className="bg-[#1F3864]/5 rounded-xl p-5">
          <h2 className="text-base font-bold text-[#1F3864] mb-2">부칙</h2>
          <p className="text-sm text-gray-600">이 개인정보처리방침은 2026년 6월 13일부터 시행합니다.</p>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p><strong>회사명:</strong> 주식회사 사람</p>
            <p><strong>대표이사:</strong> 라수환</p>
            <p><strong>사업자등록번호:</strong> 621-81-61690</p>
            <p><strong>법인등록번호:</strong> 180111-0511386</p>
            <p><strong>주소:</strong> 경기도 안성시</p>
            <p><strong>개인정보 보호책임자:</strong> 라수환</p>
            <p><strong>문의:</strong> adoco98@gmail.com</p>
          </div>
        </section>

        {/* 하단 링크 */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <Link href="/terms" className="text-sm text-[#1F3864] underline hover:text-[#C9A961] transition-colors">
            서비스 이용약관 보기
          </Link>
          <Link href="/login" className="text-sm text-[#1F3864] underline hover:text-[#C9A961] transition-colors">
            회원가입으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
