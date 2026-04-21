/**
 * 카카오 우편번호 API 주소 검색 컴포넌트
 * 도로명 주소 + 우편번호 자동 입력
 */
import { useEffect, useRef, useState } from "react";
import { Search, MapPin, X } from "lucide-react";

// 카카오 우편번호 API 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: DaumPostcodeData) => void;
        onclose?: () => void;
        width?: string | number;
        height?: string | number;
      }) => { open: () => void; embed: (el: HTMLElement) => void };
    };
  }
}

interface DaumPostcodeData {
  zonecode: string;       // 우편번호
  roadAddress: string;    // 도로명 주소
  jibunAddress: string;   // 지번 주소
  buildingName: string;   // 건물명
  apartment: string;      // 아파트 여부
  autoJibunAddress: string;
}

interface AddressSearchProps {
  value: string;
  onChange: (address: string, zonecode?: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function AddressSearch({
  value,
  onChange,
  placeholder = "주소를 검색해 주세요",
  label = "주소",
  required = false,
}: AddressSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detailAddress, setDetailAddress] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [zonecode, setZonecode] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const postcodeRef = useRef<InstanceType<typeof window.daum.Postcode> | null>(null);

  // 카카오 우편번호 스크립트 동적 로드
  useEffect(() => {
    if (window.daum?.Postcode) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
    return () => {
      // 스크립트는 전역이므로 제거하지 않음
    };
  }, []);

  // 팝업 열기
  const openSearch = () => {
    if (!scriptLoaded || !window.daum?.Postcode) {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setIsOpen(true);
  };

  // 팝업이 열릴 때 embed 방식으로 렌더링
  useEffect(() => {
    if (!isOpen || !scriptLoaded || !embedRef.current) return;
    if (!window.daum?.Postcode) return;

    postcodeRef.current = new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        const road = data.roadAddress || data.jibunAddress;
        setBaseAddress(road);
        setZonecode(data.zonecode);
        setIsOpen(false);
        // 상세주소 입력 포커스
        setTimeout(() => {
          document.getElementById("detail-address-input")?.focus();
        }, 100);
      },
      onclose: () => setIsOpen(false),
      width: "100%",
      height: "100%",
    });

    postcodeRef.current.embed(embedRef.current);
  }, [isOpen, scriptLoaded]);

  // 상세주소 변경 시 전체 주소 업데이트
  useEffect(() => {
    if (baseAddress) {
      const full = detailAddress ? `${baseAddress} ${detailAddress}` : baseAddress;
      onChange(full, zonecode);
    }
  }, [baseAddress, detailAddress]);

  // 초기값 파싱 (이미 값이 있을 때)
  useEffect(() => {
    if (value && !baseAddress) {
      setBaseAddress(value);
    }
  }, []);

  const handleClear = () => {
    setBaseAddress("");
    setDetailAddress("");
    setZonecode("");
    onChange("", "");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* 우편번호 + 검색 버튼 */}
      <div className="flex gap-2">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 min-w-[110px]">
          <MapPin className="w-3.5 h-3.5 text-[#C9A961]" />
          <span className="font-mono">{zonecode || "우편번호"}</span>
        </div>
        <button
          type="button"
          onClick={openSearch}
          className="flex items-center gap-2 bg-[#1F3864] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1F3864]/90 transition-all flex-shrink-0"
        >
          <Search className="w-4 h-4" />
          주소 검색
        </button>
      </div>

      {/* 도로명 주소 표시 */}
      <div className="relative">
        <input
          type="text"
          readOnly
          value={baseAddress}
          placeholder={placeholder}
          onClick={openSearch}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 cursor-pointer focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
        />
        {baseAddress && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 상세주소 입력 */}
      {baseAddress && (
        <input
          id="detail-address-input"
          type="text"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          placeholder="상세 주소 입력 (동·호수, 층 등)"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
        />
      )}

      {/* 카카오 우편번호 팝업 (인라인 embed) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#C9A961]" />
                <span className="font-bold text-[#1F3864]">주소 검색</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              ref={embedRef}
              style={{ width: "100%", height: "460px" }}
            />
          </div>
        </div>
      )}

      {value && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#C9A961]" />
          {value}
        </p>
      )}
    </div>
  );
}
