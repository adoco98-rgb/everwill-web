import { Video, PenLine, Check } from "lucide-react";
import type { StepProps } from "./StepProps";

export default function Step8Addons({ will, update }: StepProps) {
  return (
    <div className="space-y-5">
      <p className="text-gray-500 text-sm">
        선택 사항입니다. 나중에 추가할 수도 있습니다.
      </p>

      {/* 영상 유언장 */}
      <div
        onClick={() => update({ hasVideoWill: !will.hasVideoWill })}
        className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
          will.hasVideoWill
            ? "border-[#1F3864] bg-[#1F3864]/4"
            : "border-gray-200 bg-white hover:border-[#1F3864]/30"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-[#1F3864]">영상 유언장</h4>
              <p className="text-gray-400 text-sm">법적 녹음 유언 + 가족 감성 메시지</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-600 font-bold">+₩29,000</span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              will.hasVideoWill ? "bg-[#1F3864] border-[#1F3864]" : "border-gray-300"
            }`}>
              {will.hasVideoWill && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 ml-16">
          {["AI 낭독 스크립트 자동 생성", "녹화 중 실시간 가이드", "블록체인 해시 기록", '"손녀 성인 되는 날" 등 공개 타이밍 설정', "평생 보관"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
              <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />{f}
            </li>
          ))}
        </ul>
      </div>

      {/* 자필 유언장 스캔 */}
      <div
        onClick={() => update({ hasHandwrittenScan: !will.hasHandwrittenScan })}
        className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
          will.hasHandwrittenScan
            ? "border-[#1F3864] bg-[#1F3864]/4"
            : "border-gray-200 bg-white hover:border-[#1F3864]/30"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <PenLine className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-[#1F3864]">자필 유언장 스캔 인증</h4>
              <p className="text-gray-400 text-sm">자필 원본 업로드 + AI 형식 검증</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-600 font-bold">+₩19,000</span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              will.hasHandwrittenScan ? "bg-[#1F3864] border-[#1F3864]" : "border-gray-300"
            }`}>
              {will.hasHandwrittenScan && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 ml-16">
          {["자필 여부·날짜·서명·날인 자동 체크", "위조 탐지 알고리즘", "블록체인 무결성 기록", "원본 위치 추적"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
              <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />{f}
            </li>
          ))}
        </ul>
      </div>

      {/* 합계 */}
      {(will.hasVideoWill || will.hasHandwrittenScan) && (
        <div className="bg-[#1F3864] rounded-xl p-4 flex items-center justify-between">
          <span className="text-white/70 text-sm">
            전자 인증 ₩49,000
            {will.hasVideoWill && " + 영상 ₩29,000"}
            {will.hasHandwrittenScan && " + 자필 ₩19,000"}
          </span>
          <span className="text-[#C9A961] font-bold text-lg">
            ₩{(49000 + (will.hasVideoWill ? 29000 : 0) + (will.hasHandwrittenScan ? 19000 : 0)).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
