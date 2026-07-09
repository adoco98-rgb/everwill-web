/**
 * WillDocumentPreview - 법적 유언장 문서 형식 실시간 미리보기
 * 한국 민법 제1066조 자필증서 유언 형식 기준
 * 입력한 내용이 실제 유언장 문서 형태로 즉시 표시됨
 */
import type { WillData } from "@/lib/willTypes";

interface Props {
  will: WillData;
}

// 금액 포맷 (숫자 → 한국어 단위)
function formatAmount(raw: string): string {
  const n = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  if (isNaN(n) || n === 0) return raw || "미기재";
  if (n >= 100_000_000) {
    const eok = Math.floor(n / 100_000_000);
    const man = Math.floor((n % 100_000_000) / 10_000);
    return man > 0 ? `금 ${eok}억 ${man}만 원 (₩${n.toLocaleString()})` : `금 ${eok}억 원 (₩${n.toLocaleString()})`;
  }
  if (n >= 10_000) {
    const man = Math.floor(n / 10_000);
    const rest = n % 10_000;
    return rest > 0 ? `금 ${man}만 ${rest} 원 (₩${n.toLocaleString()})` : `금 ${man}만 원 (₩${n.toLocaleString()})`;
  }
  return `금 ${n.toLocaleString()} 원`;
}

// 날짜 포맷
function formatDate(dateStr?: string | number): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 상속인 이름 찾기
function getHeirName(will: WillData, heirId: string): string {
  const heir = will.heirs.find((h) => h.id === heirId);
  return heir ? heir.name : "미지정";
}

export default function WillDocumentPreview({ will }: Props) {
  const today = formatDate(will.writtenDate);
  const name = will.testatorName || "성명 미입력";
  const rrn = will.testatorRRN || "주민등록번호 미입력";
  const address = will.testatorAddress || "주소 미입력";
  const phone = will.testatorPhone || "";
  // 유언집행자 정보
  const executorName = will.executorType === 'heir1'
    ? (will.heirs[0]?.name ? `${will.heirs[0].name} (제1상속인)` : "제1상속인")
    : will.executorCustomName || will.executor || "";
  const executorRelation = will.executorCustomRelation || "";
  const executorPhone = will.executorCustomPhone || "";

  // 조항 번호 카운터
  let articleNo = 1;

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
      style={{ fontFamily: "'Noto Serif KR', 'Noto Serif', Georgia, serif" }}
    >
      {/* 문서 헤더 */}
      <div className="bg-[#1F3864] text-white text-center py-5 px-6">
        <div className="text-xs tracking-[0.3em] text-[#C9A961] mb-1 font-sans">LAST WILL AND TESTAMENT</div>
        <h2 className="text-2xl font-bold tracking-widest">유 언 장</h2>
        <div className="text-xs text-white/60 mt-1 font-sans">한국 민법 제1066조 자필증서 유언</div>
      </div>

      <div className="p-6 space-y-5 text-sm leading-loose text-gray-800">

        {/* 전문 */}
        <div className="border-b border-gray-100 pb-4">
          <p className="text-[15px] leading-8">
            본인 <strong className="text-[#1F3864]">{name}</strong>
            {rrn !== "주민등록번호 미입력" && (
              <span className="text-gray-500 text-xs ml-1">(생년월일: {rrn.slice(0, 6)})</span>
            )}
            은(는) 정신이 맑고 건강한 상태에서 자유로운 의사에 따라 다음과 같이 유언합니다.
          </p>
        </div>

        {/* 유언자 정보 */}
        <section>
          <h3 className="font-bold text-[#1F3864] text-base border-b border-[#1F3864]/20 pb-1 mb-3 tracking-wide">
            ◆ 유언자 인적사항
          </h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-1.5 text-gray-500 w-28 shrink-0">성 명</td>
                <td className="py-1.5 font-semibold">{name}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-gray-500">주민등록번호</td>
                <td className="py-1.5">{rrn}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-gray-500">주 소</td>
                <td className="py-1.5">{address}</td>
              </tr>
              {phone && (
                <tr>
                  <td className="py-1.5 text-gray-500">연락처</td>
                  <td className="py-1.5">{phone}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* 상속인 목록 */}
        {will.heirs.length > 0 && (
          <section>
            <h3 className="font-bold text-[#1F3864] text-base border-b border-[#1F3864]/20 pb-1 mb-3 tracking-wide">
              ◆ 상속인 지정
            </h3>
            {will.heirs.map((heir, i) => (
              <div key={heir.id} className="mb-3 pl-3 border-l-2 border-[#C9A961]/40">
                <p className="font-semibold text-[#1F3864]">
                  제{articleNo++}조 (상속인 {i + 1})
                </p>
                <table className="w-full text-sm mt-1">
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className="py-1 text-gray-500 w-24">성 명</td>
                      <td className="py-1.5 font-semibold">{heir.name || "미기재"}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-500">관 계</td>
                      <td className="py-1.5">{heir.relation || "미기재"}</td>
                    </tr>
                    {heir.birthDate && (
                      <tr>
                        <td className="py-1 text-gray-500">생년월일</td>
                        <td className="py-1">{heir.birthDate}</td>
                      </tr>
                    )}
                    {heir.phone && (
                      <tr>
                        <td className="py-1 text-gray-500">연락처</td>
                        <td className="py-1">{heir.phone}</td>
                      </tr>
                    )}
                    {heir.address && (
                      <tr>
                        <td className="py-1 text-gray-500">주 소</td>
                        <td className="py-1">{heir.address}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-1 text-gray-500">상속 지분</td>
                      <td className="py-1 font-semibold text-[#1F3864]">{heir.share}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </section>
        )}

        {/* 부동산 */}
        {will.realEstates.length > 0 && (
          <section>
            <h3 className="font-bold text-[#1F3864] text-base border-b border-[#1F3864]/20 pb-1 mb-3 tracking-wide">
              ◆ 부동산 상속
            </h3>
            {will.realEstates.map((re) => (
              <div key={re.id} className="mb-3 pl-3 border-l-2 border-[#C9A961]/40">
                <p className="font-semibold text-[#1F3864]">제{articleNo++}조 (부동산 상속)</p>
                <p className="mt-1 leading-7">
                  본인 소유의 {re.type} (<strong>{re.address || "주소 미기재"}</strong>
                  {re.area ? `, 면적 ${re.area}㎡` : ""}
                  {re.registrationNo ? `, 등기 고유번호 ${re.registrationNo}` : ""})
                  {re.estimatedValue ? ` 시가 ${formatAmount(re.estimatedValue)}` : ""}을(를){" "}
                  <strong className="text-[#1F3864]">{getHeirName(will, re.heirId)}</strong>에게 상속한다.
                  {re.distributionMode === "amount" && re.shareAmount
                    ? ` 단, 상속 금액은 ${formatAmount(re.shareAmount)}으로 한다.`
                    : re.sharePercent !== undefined && re.sharePercent !== 100
                    ? ` 단, 상속 지분은 ${re.sharePercent}%로 한다.`
                    : ""}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* 금융자산 */}
        {will.financialAssets.length > 0 && (
          <section>
            <h3 className="font-bold text-[#1F3864] text-base border-b border-[#1F3864]/20 pb-1 mb-3 tracking-wide">
              ◆ 금융자산 상속
            </h3>
            {will.financialAssets.map((fa) => (
              <div key={fa.id} className="mb-3 pl-3 border-l-2 border-[#C9A961]/40">
                <p className="font-semibold text-[#1F3864]">제{articleNo++}조 (금융자산 상속)</p>
                <p className="mt-1 leading-7">
                  {fa.institution} {fa.type}
                  {fa.accountNo ? ` (계좌번호 끝 ${fa.accountNo.slice(-4)})` : ""}
                  {fa.estimatedValue ? ` 약 ${formatAmount(fa.estimatedValue)}` : ""}을(를){" "}
                  <strong className="text-[#1F3864]">{getHeirName(will, fa.heirId)}</strong>에게 상속한다.
                  {fa.distributionMode === "amount" && fa.shareAmount
                    ? ` 상속 금액은 ${formatAmount(fa.shareAmount)}으로 한다.`
                    : fa.sharePercent !== undefined && fa.sharePercent !== 100
                    ? ` 상속 지분은 ${fa.sharePercent}%로 한다.`
                    : ""}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* 기타 자산 */}
        {will.otherAssets.length > 0 && (
          <section>
            <h3 className="font-bold text-[#1F3864] text-base border-b border-[#1F3864]/20 pb-1 mb-3 tracking-wide">
              ◆ 기타 자산 상속
            </h3>
            {will.otherAssets.map((oa) => (
              <div key={oa.id} className="mb-3 pl-3 border-l-2 border-[#C9A961]/40">
                <p className="font-semibold text-[#1F3864]">제{articleNo++}조 (기타 자산 상속)</p>
                <p className="mt-1 leading-7">
                  {oa.type} ({oa.description})
                  {oa.estimatedValue ? ` 약 ${formatAmount(oa.estimatedValue)}` : ""}을(를){" "}
                  <strong className="text-[#1F3864]">{getHeirName(will, oa.heirId)}</strong>에게 상속한다.
                </p>
              </div>
            ))}
          </section>
        )}

        {/* 사회기부 */}
        {will.donationDetails && will.donationDetails.trim().length > 0 && (
          <section>
            <h3 className="font-bold text-[#1F3864] text-base border-b border-[#1F3864]/20 pb-1 mb-3 tracking-wide">
              ◆ 사회기부 유언
            </h3>
            <div className="mb-3 pl-3 border-l-2 border-[#C9A961]/40">
              <p className="font-semibold text-[#1F3864]">제{articleNo++}조 (사회기부)</p>
              <p className="mt-1 leading-7 whitespace-pre-wrap">{will.donationDetails}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mt-2">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>집행 원칙:</strong> 본 사회기부 유언의 집행은{" "}
                <strong>EverWill 사회적후원 운영위원회</strong>에 그 집행을 일임한다.
                운영위원회는 비영리·시민사회단체장 3명과 EverWill 일반 시민 위원 5명으로 구성되며,
                매년 연말 정기회의 또는 긴급 임시회의를 통해 집행을 결정한다.
              </p>
            </div>
          </section>
        )}

        {/* 유언집행자 */}
        {executorName && (
          <section>
            <h3 className="font-bold text-[#1F3864] text-base border-b border-[#1F3864]/20 pb-1 mb-3 tracking-wide">
              ◆ 유언집행자 지정
            </h3>
            <div className="pl-3 border-l-2 border-[#C9A961]/40">
              <p className="font-semibold text-[#1F3864]">제{articleNo++}조 (유언집행자)</p>
              <p className="mt-1 leading-7">
                본 유언의 집행자로{" "}
                <strong>{executorName}</strong>
                {executorRelation ? ` (${executorRelation})` : ""}
                {executorPhone ? `, 연락처 ${executorPhone}` : ""}
                을(를) 지정한다.
              </p>
            </div>
          </section>
        )}

        {/* 장례 의사 */}
        {will.funeralWish && (
          <section>
            <h3 className="font-bold text-[#1F3864] text-base border-b border-[#1F3864]/20 pb-1 mb-3 tracking-wide">
              ◆ 장례 및 사후 처리
            </h3>
            <div className="pl-3 border-l-2 border-[#C9A961]/40">
              <p className="font-semibold text-[#1F3864]">제{articleNo++}조 (장례 의사)</p>
              <p className="mt-1 leading-7">{will.funeralWish}</p>
            </div>
          </section>
        )}

        {/* 특별 지시 */}
        {will.specialInstructions && (
          <section>
            <div className="pl-3 border-l-2 border-[#C9A961]/40">
              <p className="font-semibold text-[#1F3864]">제{articleNo++}조 (특별 지시)</p>
              <p className="mt-1 leading-7">{will.specialInstructions}</p>
            </div>
          </section>
        )}

        {/* 서명란 */}
        <section className="border-t-2 border-[#1F3864]/20 pt-5 mt-6">
          <p className="text-center text-gray-500 text-xs mb-4">
            위 내용은 본인의 자유로운 의사에 따라 작성되었으며, 사실과 다름이 없습니다.
          </p>
          <div className="text-center space-y-3">
            <p className="text-base">작성일: <strong>{today}</strong></p>
            <div className="flex items-center justify-center gap-8 mt-4">
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">유언자</p>
                <p className="font-bold text-lg text-[#1F3864]">{name}</p>
                <div className="mt-2 w-24 h-8 border-b-2 border-[#1F3864]/30 mx-auto flex items-end justify-center">
                  <span className="text-gray-300 text-xs">(서명 또는 날인)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 법적 안내 */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>법적 안내:</strong> 자필증서 유언(민법 제1066조)은 전문·날짜·주소·성명을 자필로 작성하고 날인해야 효력이 있습니다.
            EverWill 전자인증을 완료하면 블록체인 타임스탬프와 함께 효력이 강화됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
