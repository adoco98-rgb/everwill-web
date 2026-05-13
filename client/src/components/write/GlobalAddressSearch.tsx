/**
 * 글로벌 주소 자동검색 컴포넌트
 * - 한국(KR): 카카오 우편번호 API (도로명 주소)
 * - 해외: Google Places Autocomplete (전 세계 주소)
 */
import { useEffect, useRef, useState } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";

// 카카오 우편번호 API 타입
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

// Google Places Autocomplete 타입 (window.google는 Map.tsx에서 선언됨)
interface GoogleAutocomplete {
  addListener: (event: string, handler: () => void) => void;
  getPlace: () => { formatted_address?: string; name?: string };
}

interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  apartment: string;
  autoJibunAddress: string;
}

interface GlobalAddressSearchProps {
  value: string;
  onChange: (address: string, zonecode?: string) => void;
  countryCode?: string; // "KR" | "US" | "JP" | ...
  placeholder?: string;
  label?: string;
  required?: boolean;
  showLabel?: boolean;
}

// Google Maps Places 스크립트 로드 (전역 1회)
let googleScriptLoaded = false;
let googleScriptLoading = false;
const googleScriptCallbacks: (() => void)[] = [];

function loadGooglePlacesScript(callback: () => void) {
  if (googleScriptLoaded) {
    callback();
    return;
  }
  googleScriptCallbacks.push(callback);
  if (googleScriptLoading) return;
  googleScriptLoading = true;

  // Manus 내장 Google Maps 프록시 사용
  const script = document.createElement("script");
  script.src = "/api/maps/js?libraries=places&language=ko";
  script.async = true;
  script.onload = () => {
    googleScriptLoaded = true;
    googleScriptLoading = false;
    googleScriptCallbacks.forEach((cb) => cb());
    googleScriptCallbacks.length = 0;
  };
  script.onerror = () => {
    googleScriptLoading = false;
  };
  document.head.appendChild(script);
}

export default function GlobalAddressSearch({
  value,
  onChange,
  countryCode = "KR",
  placeholder,
  label = "주소",
  required = false,
  showLabel = true,
}: GlobalAddressSearchProps) {
  const isKorea = countryCode === "KR";

  // ── 카카오 (한국) 상태 ──
  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const [kakaoOpen, setKakaoOpen] = useState(false);
  const [baseAddress, setBaseAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [zonecode, setZonecode] = useState("");
  const embedRef = useRef<HTMLDivElement>(null);

  // ── Google Places (해외) 상태 ──
  const googleInputRef = useRef<HTMLInputElement>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleValue, setGoogleValue] = useState(value || "");

  // ── 카카오 스크립트 로드 ──
  useEffect(() => {
    if (!isKorea) return;
    if (window.daum?.Postcode) {
      setKakaoLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => setKakaoLoaded(true);
    document.head.appendChild(script);
  }, [isKorea]);

  // ── 카카오 팝업 embed ──
  useEffect(() => {
    if (!kakaoOpen || !kakaoLoaded || !embedRef.current) return;
    if (!window.daum?.Postcode) return;
    const postcode = new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        const road = data.roadAddress || data.jibunAddress;
        setBaseAddress(road);
        setZonecode(data.zonecode);
        setKakaoOpen(false);
        setTimeout(() => {
          document.getElementById("global-detail-address")?.focus();
        }, 100);
      },
      onclose: () => setKakaoOpen(false),
      width: "100%",
      height: "100%",
    });
    postcode.embed(embedRef.current);
  }, [kakaoOpen, kakaoLoaded]);

  // ── 카카오 주소 변경 시 부모에 전달 ──
  useEffect(() => {
    if (!isKorea || !baseAddress) return;
    const full = detailAddress ? `${baseAddress} ${detailAddress}` : baseAddress;
    onChange(full, zonecode);
  }, [baseAddress, detailAddress]);

  // ── Google Places Autocomplete 초기화 ──
  useEffect(() => {
    if (isKorea) return;
    loadGooglePlacesScript(() => {
      setGoogleReady(true);
    });
  }, [isKorea]);

  useEffect(() => {
    if (isKorea || !googleReady || !googleInputRef.current) return;
    // google maps 체크는 위에서 처리

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const googleMaps = (window as any).google?.maps;
    if (!googleMaps?.places?.Autocomplete) return;
    const autocomplete: GoogleAutocomplete = new googleMaps.places.Autocomplete(
      googleInputRef.current,
      {
        types: ["address"],
        fields: ["formatted_address", "name"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const addr = place.formatted_address || place.name || "";
      setGoogleValue(addr);
      onChange(addr);
    });
  }, [isKorea, googleReady]);

  // ── 외부 value 변경 시 동기화 ──
  useEffect(() => {
    if (!isKorea) {
      setGoogleValue(value || "");
    } else if (value && !baseAddress) {
      setBaseAddress(value);
    }
  }, [value]);

  const handleClear = () => {
    if (isKorea) {
      setBaseAddress("");
      setDetailAddress("");
      setZonecode("");
    } else {
      setGoogleValue("");
    }
    onChange("", "");
  };

  const defaultPlaceholder = isKorea
    ? "주소 검색 버튼을 눌러주세요"
    : "Start typing your address...";

  // ── 렌더: 한국 (카카오) ──
  if (isKorea) {
    return (
      <div className="space-y-2">
        {showLabel && (
          <label className="block text-sm font-semibold text-[#1F3864] mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        {/* 우편번호 + 검색 버튼 */}
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 min-w-[110px]">
            <MapPin className="w-3.5 h-3.5 text-[#C9A961]" />
            <span className="font-mono">{zonecode || "우편번호"}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!kakaoLoaded) {
                alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
                return;
              }
              setKakaoOpen(true);
            }}
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
            placeholder={placeholder || defaultPlaceholder}
            onClick={() => setKakaoOpen(true)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 cursor-pointer focus:outline-none focus:border-[#1F3864] transition-all"
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
        {/* 상세주소 */}
        {baseAddress && (
          <input
            id="global-detail-address"
            type="text"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            placeholder="상세 주소 입력 (동·호수, 층 등)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] transition-all"
          />
        )}
        {/* 카카오 주소검색 팝업 */}
        {kakaoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C9A961]" />
                  <span className="font-bold text-[#1F3864]">주소 검색</span>
                </div>
                <button onClick={() => setKakaoOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div ref={embedRef} style={{ width: "100%", height: "460px" }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 렌더: 해외 (Google Places) ──
  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="block text-sm font-semibold text-[#1F3864] mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {!googleReady && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
        <input
          ref={googleInputRef}
          type="text"
          value={googleValue}
          onChange={(e) => {
            setGoogleValue(e.target.value);
            // 수동 입력도 허용
            onChange(e.target.value);
          }}
          placeholder={placeholder || defaultPlaceholder}
          className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] transition-all ${!googleReady ? "pl-10" : ""}`}
        />
        {googleValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {!googleReady && (
        <p className="text-xs text-gray-400">주소 자동완성 로딩 중... 직접 입력도 가능합니다.</p>
      )}
    </div>
  );
}
