/**
 * 상속세 신고서 PDF 자동 생성 페이지
 * 경로: /tax/report
 * 국세청 상속세 신고서 양식 기준
 */
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Download, Printer, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DeceasedInfo {
  name: string;
  residentId: string;
  address: string;
  deathDate: string;
  age: string;
}

interface ReporterInfo {
  name: string;
  relation: string;
  phone: string;
  address: string;
}

const formatKRW = (n: number) => {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(2)}억원`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
};

const parseAmount = (s: string): number => parseFloat(s.replace(/[^0-9.]/g, "")) * 10_000 || 0;

export default function TaxReportPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"form" | "preview">("form");
  const reportRef = useRef<HTMLDivElement>(null);

  const [deceased, setDeceased] = useState<DeceasedInfo>({
    name: "", residentId: "", address: "", deathDate: "", age: "70",
  });
  const [reporter, setReporter] = useState<ReporterInfo>({
    name: "", relation: "자녀", phone: "", address: "",
  });
  const [assets, setAssets] = useState({
    realEstate: "", financialAssets: "", businessAssets: "", otherAssets: "",
    debts: "", funeralExpenses: "150",
  });
  const [hasSpouse, setHasSpouse] = useState(false);
  const [childCount, setChildCount] = useState(1);

  const reportMutation = trpc.tax.generateReportData.useMutation({
    onSuccess: () => setStep("preview"),
    onError: () => toast.error("신고서 생성 중 오류가 발생했습니다."),
  });

  const handleGenerate = () => {
    if (!deceased.name || !deceased.deathDate || !reporter.name) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }
    const heirs = [];
    if (hasSpouse) heirs.push({ relation: "spouse" as const, count: 1 });
    if (childCount > 0) heirs.push({ relation: "child" as const, count: childCount });

    reportMutation.mutate({
      deceased: { ...deceased, age: parseInt(deceased.age) || 70 },
      reporter,
      assets: {
        realEstate: parseAmount(assets.realEstate),
        financialAssets: parseAmount(assets.financialAssets),
        businessAssets: parseAmount(assets.businessAssets),
        otherAssets: parseAmount(assets.otherAssets),
        debts: parseAmount(assets.debts),
        funeralExpenses: parseAmount(assets.funeralExpenses),
      },
      heirs,
      isGenerationSkip: false,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const data = reportMutation.data;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <header className="bg-[#1F3864] text-white px-4 py-4 sticky top-0 z-40 print:hidden">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => step === "preview" ? setStep("form") : navigate("/tax")} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-[#C9A961]/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#C9A961]" />
          </div>
          <div>
            <h1 className="font-bold text-base">상속세 신고서 자동 작성</h1>
            <p className="text-white/60 text-xs">국세청 상속세 신고서 양식 기준</p>
          </div>
          {step === "preview" && (
            <button onClick={handlePrint} className="ml-auto flex items-center gap-1.5 text-xs text-[#C9A961] border border-[#C9A961]/30 px-3 py-1.5 rounded-full hover:bg-[#C9A961]/10 transition-colors">
              <Printer className="w-3.5 h-3.5" />
              인쇄/PDF 저장
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {step === "form" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* 안내 */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                신고서는 <strong>사망일로부터 6개월 이내</strong>에 피상속인의 주소지 관할 세무서에 제출해야 합니다.
                생성된 PDF를 출력하여 세무서에 제출하거나, 홈택스(hometax.go.kr)에서 전자 신고하세요.
              </div>
            </div>

            {/* 피상속인 정보 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-[#1F3864] mb-4">피상속인 (돌아가신 분) 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", label: "성명 *", placeholder: "홍길동" },
                  { key: "residentId", label: "주민등록번호", placeholder: "000000-0000000" },
                  { key: "deathDate", label: "사망일 *", placeholder: "2024-01-01", type: "date" },
                  { key: "age", label: "사망 당시 나이", placeholder: "70", type: "number" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input
                      type={type || "text"}
                      value={deceased[key as keyof DeceasedInfo]}
                      onChange={e => setDeceased(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">주소 *</label>
                  <input
                    value={deceased.address}
                    onChange={e => setDeceased(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]"
                    placeholder="서울시 강남구 테헤란로 123"
                  />
                </div>
              </div>
            </div>

            {/* 신고인 정보 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-[#1F3864] mb-4">신고인 (상속인 대표) 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", label: "성명 *", placeholder: "홍길동" },
                  { key: "relation", label: "관계", placeholder: "자녀" },
                  { key: "phone", label: "연락처", placeholder: "010-0000-0000" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input
                      value={reporter[key as keyof ReporterInfo]}
                      onChange={e => setReporter(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">주소</label>
                  <input
                    value={reporter.address}
                    onChange={e => setReporter(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]"
                    placeholder="서울시 강남구 테헤란로 456"
                  />
                </div>
              </div>
            </div>

            {/* 재산 및 상속인 (간소화) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-[#1F3864] mb-4">상속 재산 (만원 단위)</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "realEstate", label: "부동산" },
                  { key: "financialAssets", label: "금융자산" },
                  { key: "businessAssets", label: "사업용 자산" },
                  { key: "otherAssets", label: "기타 자산" },
                  { key: "debts", label: "채무" },
                  { key: "funeralExpenses", label: "장례비용" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input
                      type="number"
                      value={assets[key as keyof typeof assets]}
                      onChange={e => setAssets(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hasSpouse} onChange={e => setHasSpouse(e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm text-gray-700">배우자 있음</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">자녀 수:</span>
                  <input type="number" value={childCount} onChange={e => setChildCount(parseInt(e.target.value) || 0)} className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[#1F3864]" min="0" />
                  <span className="text-sm text-gray-500">명</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGenerate}
              disabled={reportMutation.isPending}
              className="w-full bg-[#C9A961] hover:bg-[#b8954f] disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              {reportMutation.isPending ? "신고서 생성 중..." : "상속세 신고서 자동 작성"}
            </motion.button>
          </motion.div>
        )}

        {step === "preview" && data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* 완료 배너 */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3 print:hidden">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                신고서가 작성됐습니다. <strong>인쇄/PDF 저장</strong> 버튼을 눌러 저장 후 관할 세무서에 제출하세요.
                <br />신고 기한: <strong>{data.reportData.deadline}</strong>
              </div>
            </div>

            {/* 신고서 본문 */}
            <div ref={reportRef} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-none">
              {/* 제목 */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">상 속 세 신 고 서</h1>
                <p className="text-sm text-gray-500">상속세 및 증여세법 제67조에 따른 신고</p>
                <div className="mt-2 text-xs text-gray-400">신고일: {data.reportData.reportDate} | 관할 세무서: {data.reportData.taxOffice}</div>
              </div>

              {/* 피상속인 */}
              <section className="mb-6">
                <h2 className="font-bold text-gray-800 border-b-2 border-gray-800 pb-1 mb-3">1. 피상속인 인적사항</h2>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {[
                      ["성명", data.reportData.deceased.name],
                      ["주민등록번호", data.reportData.deceased.residentId || "기재 생략"],
                      ["주소", data.reportData.deceased.address],
                      ["사망일", data.reportData.deceased.deathDate],
                      ["사망 당시 나이", `${data.reportData.deceased.age}세`],
                    ].map(([label, value]) => (
                      <tr key={label} className="border border-gray-200">
                        <td className="bg-gray-50 px-3 py-2 font-medium w-32">{label}</td>
                        <td className="px-3 py-2">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* 신고인 */}
              <section className="mb-6">
                <h2 className="font-bold text-gray-800 border-b-2 border-gray-800 pb-1 mb-3">2. 신고인 인적사항</h2>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {[
                      ["성명", data.reportData.reporter.name],
                      ["피상속인과의 관계", data.reportData.reporter.relation],
                      ["연락처", data.reportData.reporter.phone || "-"],
                      ["주소", data.reportData.reporter.address || "-"],
                    ].map(([label, value]) => (
                      <tr key={label} className="border border-gray-200">
                        <td className="bg-gray-50 px-3 py-2 font-medium w-32">{label}</td>
                        <td className="px-3 py-2">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* 상속재산 명세 */}
              <section className="mb-6">
                <h2 className="font-bold text-gray-800 border-b-2 border-gray-800 pb-1 mb-3">3. 상속재산 명세</h2>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left">구분</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["부동산", data.reportData.taxResult.totalAssets - (data.reportData.taxResult.deductions.financialDeduction / 0.2)],
                      ["금융자산", data.reportData.taxResult.deductions.financialDeduction / 0.2],
                      ["채무 (-)",""],
                      ["장례비용 (-)",""],
                    ].map(([label, value]) => (
                      <tr key={label as string} className="border border-gray-200">
                        <td className="px-3 py-2">{label}</td>
                        <td className="px-3 py-2 text-right">{typeof value === "number" && value > 0 ? formatKRW(value) : "-"}</td>
                      </tr>
                    ))}
                    <tr className="border border-gray-200 font-bold bg-gray-50">
                      <td className="px-3 py-2">총 상속재산</td>
                      <td className="px-3 py-2 text-right">{formatKRW(data.reportData.taxResult.totalAssets)}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {/* 세액 계산 */}
              <section className="mb-6">
                <h2 className="font-bold text-gray-800 border-b-2 border-gray-800 pb-1 mb-3">4. 상속세 계산</h2>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {[
                      ["총 상속재산", formatKRW(data.reportData.taxResult.totalAssets)],
                      ["(-) 총 공제액", formatKRW(data.reportData.taxResult.deductions.totalDeduction)],
                      ["과세표준", formatKRW(data.reportData.taxResult.taxableAmount)],
                      ["산출세액", formatKRW(data.reportData.taxResult.calculatedTax)],
                      ["(-) 신고세액공제 (3%)", formatKRW(data.reportData.taxResult.reportingDeduction)],
                      ["납부할 세액", formatKRW(data.reportData.taxResult.finalTax)],
                    ].map(([label, value]) => (
                      <tr key={label} className={`border border-gray-200 ${label === "납부할 세액" ? "font-bold bg-yellow-50" : ""}`}>
                        <td className="bg-gray-50 px-3 py-2 font-medium w-40">{label}</td>
                        <td className="px-3 py-2 text-right">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* 서명란 */}
              <section className="mt-10">
                <p className="text-sm text-gray-600 mb-6 text-center">
                  위의 내용은 사실과 다름이 없음을 확인하며, 상속세 및 증여세법 제67조에 따라 신고합니다.
                </p>
                <div className="flex justify-end gap-12 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500 mb-8">신고일: {data.reportData.reportDate}</p>
                    <p>신고인: {data.reportData.reporter.name} <span className="text-gray-400 text-xs">(서명 또는 날인)</span></p>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">{data.reportData.taxOffice} 귀중</p>
                </div>
              </section>

              {/* 워터마크 */}
              <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-300">SARAM 유언 OS | 상속세 신고서 자동 작성 서비스 | 참고용 서류 (실제 세액은 세무사 확인 필요)</p>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="grid grid-cols-2 gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-[#1F3864] text-white font-bold py-4 rounded-2xl text-sm transition-colors hover:bg-[#162d52]"
              >
                <Printer className="w-4 h-4" />
                인쇄 / PDF 저장
              </button>
              <button
                onClick={() => navigate("/tax")}
                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-2xl text-sm transition-colors hover:bg-gray-50"
              >
                세액 다시 계산
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 print:hidden">
              <strong>홈택스 전자신고 안내:</strong> hometax.go.kr → 신고/납부 → 세금신고 → 상속세에서 전자 신고 가능합니다.
              본 서류는 참고용이며 실제 신고는 세무사 검토 후 진행하시기 바랍니다.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
