/**
 * 1단계: 기본정보 확인
 * 소셜 로그인 / 회원가입 시 입력된 정보를 자동으로 보여주고
 * 부족한 정보만 추가 입력 → DB에 영구 저장
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Mail,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Search,
  Loader2,
} from "lucide-react";

interface Props {
  onComplete: () => void;
}

export default function Step1BasicInfo({ onComplete }: Props) {
  const { user, refresh } = useAuth();
  const utils = trpc.useUtils();
  const [isEditing, setIsEditing] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [form, setForm] = useState({
    name: "",
    nameEn: "", // 영문 성명 (Latin Name)
    phone: "",
    address: "",
    addressDetail: "",
    birthDate: "",
    email: "",
    residentNumber: "", // 주민등록번호 (선택)
  });

  // DB에서 기본정보 조회
  const { data: profileData, isLoading: profileLoading } = trpc.profile.getBasicInfo.useQuery();

  // 저장 mutation
  const saveMutation = trpc.profile.saveBasicInfo.useMutation({
    onSuccess: (_data, variables) => {
      toast.success("기본정보가 저장되었습니다.");
      setIsEditing(false);
      // 저장한 값으로 폼 유지 (리셋 방지)
      setForm({
        name: variables.name,
        nameEn: (variables as any).nameEn || form.nameEn,
        phone: variables.phone || "",
        address: variables.address || "",
        addressDetail: variables.addressDetail || "",
        birthDate: variables.birthDate || "",
        email: form.email,
        residentNumber: form.residentNumber,
      });
      // 쿼리 무효화 (다음 새로고침 시 최신 데이터)
      utils.profile.getBasicInfo.invalidate();
      refresh();
    },
    onError: (err) => {
      toast.error(err.message || "저장에 실패했습니다.");
    },
  });

  // DB 데이터 또는 auth user 데이터로 폼 초기화 (최초 1회만)
  useEffect(() => {
    if (formInitialized) return;
    if (profileData) {
      setForm({
        name: profileData.name || "",
        nameEn: (profileData as any).nameEn || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        addressDetail: profileData.addressDetail || "",
        birthDate: profileData.birthDate || "",
        email: profileData.email || "",
        residentNumber: (profileData as any).residentNumberMasked || "",
      });
      setFormInitialized(true);
    } else if (user && !profileLoading) {
      setForm({
        name: (user as any).name || "",
        nameEn: (user as any).nameEn || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
        addressDetail: (user as any).addressDetail || "",
        birthDate: (user as any).birthDate || "",
        email: (user as any).email || "",
        residentNumber: "",
      });
      setFormInitialized(true);
    }
  }, [profileData, user, profileLoading, formInitialized]);

  // 주민번호 포맷 (000000-0000000)
  function formatRRN(val: string) {
    const raw = val.replace(/[^0-9]/g, "");
    if (raw.length <= 6) return raw;
    return raw.slice(0, 6) + "-" + raw.slice(6, 13);
  }

  // 필수 항목 체크
  const isNameFilled = form.name.trim().length > 0;
  const isPhoneFilled = form.phone.trim().length > 0;
  const isAddressFilled = form.address.trim().length > 0;
  // 주민번호(13자리) 또는 생년월일 중 하나만 있으면 통과
  const isRRNFilled = form.residentNumber.replace(/[^0-9]/g, "").length === 13;
  const isBirthFilled = form.birthDate.trim().length > 0;
  const allRequired = isNameFilled && isPhoneFilled && isAddressFilled && (isRRNFilled || isBirthFilled);

  // 카카오 주소 검색
  function openKakaoPostcode() {
    if (typeof window === "undefined") return;
    const daum = (window as any).daum;
    if (!daum?.Postcode) {
      const script = document.createElement("script");
      script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.onload = () => {
        new (window as any).daum.Postcode({
          oncomplete: (data: any) => {
            const addr = data.roadAddress || data.jibunAddress;
            setForm((f) => ({ ...f, address: addr, addressDetail: "" }));
          },
        }).open();
      };
      document.head.appendChild(script);
      return;
    }
    new daum.Postcode({
      oncomplete: (data: any) => {
        const addr = data.roadAddress || data.jibunAddress;
        setForm((f) => ({ ...f, address: addr, addressDetail: "" }));
      },
    }).open();
  }

  // 정보 저장 (DB에 영구 저장)
  const handleSave = () => {
    if (!allRequired) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }
    saveMutation.mutate({
      name: form.name.trim(),
      nameKo: form.name.trim(),
      nameEn: form.nameEn.trim() || undefined,
      phone: form.phone.trim(),
      address: form.address.trim(),
      addressDetail: form.addressDetail.trim(),
      birthDate: form.birthDate.trim(),
      residentNumber: form.residentNumber.trim() || undefined,
    } as any);
  };

  // 정보 확인 완료 (저장 후 다음 단계)
  const handleConfirm = () => {
    if (!allRequired) {
      toast.error("필수 항목을 모두 입력해주세요.");
      setIsEditing(true);
      return;
    }
    // 먼저 DB에 저장
    saveMutation.mutate(
      {
        name: form.name.trim(),
        nameKo: form.name.trim(),
        nameEn: form.nameEn.trim() || undefined,
        phone: form.phone.trim(),
        address: form.address.trim(),
        addressDetail: form.addressDetail.trim(),
        birthDate: form.birthDate.trim(),
        residentNumber: form.residentNumber.trim() || undefined,
      } as any,
      {
        onSuccess: () => {
          toast.success("기본정보 확인 완료!");
          onComplete();
        },
      }
    );
  };

  // 로딩 상태
  if (profileLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#1F3864] animate-spin" />
        <p className="text-sm text-gray-500">정보를 불러오는 중...</p>
      </div>
    );
  }

  // 정보 항목 표시 컴포넌트
  const InfoRow = ({
    icon: Icon,
    label,
    value,
    required,
  }: {
    icon: any;
    label: string;
    value: string;
    required?: boolean;
  }) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-[#1F3864]/5 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#1F3864]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">{label}</span>
          {required && <span className="text-red-400 text-xs">*</span>}
        </div>
        {value ? (
          <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
        ) : (
          <p className="text-sm text-red-400 italic">미입력</p>
        )}
      </div>
      {value ? (
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-[#1F3864] to-[#2d4a7a] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">1단계: 기본정보 확인</h3>
            <p className="text-white/70 text-sm">
              회원가입 시 입력한 정보가 자동으로 채워집니다
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                소셜 로그인 정보가 자동으로 입력되었습니다
              </p>
              <p className="text-xs text-blue-600 mt-1">
                아래 정보를 확인하고, 수정이 필요하면 "수정하기" 버튼을 눌러주세요.
                <br />
                유언장에 기재될 유언자 본인 정보입니다.
              </p>
            </div>
          </div>
        </div>

        {/* 정보 보기 모드 */}
        {!isEditing ? (
          <>
            <div className="space-y-0">
              <InfoRow icon={User} label="한글 성명" value={form.name} required />
              {form.nameEn && <InfoRow icon={User} label="영문 성명" value={form.nameEn} />}
              <InfoRow icon={Phone} label="연락처" value={form.phone} required />
              <InfoRow icon={MapPin} label="주소" value={form.address} required />
              {form.addressDetail && (
                <InfoRow icon={MapPin} label="상세주소" value={form.addressDetail} />
              )}
              {/* 주민번호 있으면 주민번호만, 없으면 생년월일 표시 */}
              {isRRNFilled ? (
                <InfoRow icon={User} label="주민등록번호" value={form.residentNumber.slice(0, 6) + "-*******"} required />
              ) : (
                <InfoRow icon={Calendar} label="생년월일" value={form.birthDate} required />
              )}
              <InfoRow icon={Mail} label="이메일" value={form.email} />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                수정하기
              </button>
              <button
                onClick={handleConfirm}
                disabled={!allRequired || saveMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1F3864] text-white text-sm font-bold hover:bg-[#162d52] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                정보 확인 완료
              </button>
            </div>
          </>
        ) : (
          /* 수정 모드 */
          <div className="space-y-4">
            {/* 한글 성명 + 영문 성명 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  한글 성명 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864] outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  영문 성명 <span className="text-gray-400 text-xs font-normal">(Latin Name)</span>
                </label>
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                  placeholder="HONG GIL DONG"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864] outline-none transition-all uppercase"
                />
                <p className="text-xs text-gray-400 mt-1">멤버십 카드 및 글로벌 서류에 사용</p>
              </div>
            </div>

            {/* 연락처 */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                연락처 <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864] outline-none transition-all"
              />
            </div>

            {/* 주소 */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                주소 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.address}
                  readOnly
                  placeholder="주소 검색을 클릭하세요"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none"
                />
                <button
                  onClick={openKakaoPostcode}
                  className="px-4 py-3 bg-[#1F3864] text-white rounded-xl text-sm font-medium hover:bg-[#162d52] transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  검색
                </button>
              </div>
              <input
                type="text"
                value={form.addressDetail}
                onChange={(e) => setForm((f) => ({ ...f, addressDetail: e.target.value }))}
                placeholder="상세주소 (동/호수)"
                className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864] outline-none transition-all"
              />
            </div>

            {/* 생년월일 - 주민번호 없을 때만 표시 */}
            {!isRRNFilled && <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                생년월일 <span className="text-red-400">*</span> <span className="text-gray-400 text-xs font-normal">(주민번호 입력 시 생략 가능)</span>
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.birthDate}
                  onChange={(e) => {
                    // 숫자만 추출
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    // 8자리 입력 시 자동 포맷: 19690812 → 1969-08-12
                    if (raw.length <= 8) {
                      let formatted = raw;
                      if (raw.length >= 5) {
                        formatted = raw.slice(0, 4) + "-" + raw.slice(4);
                      }
                      if (raw.length >= 7) {
                        formatted = raw.slice(0, 4) + "-" + raw.slice(4, 6) + "-" + raw.slice(6);
                      }
                      setForm((f) => ({ ...f, birthDate: formatted }));
                    }
                  }}
                  placeholder="연도-월-일"
                  maxLength={10}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864] outline-none transition-all"
                />
                <div className="relative">
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <Calendar className="w-6 h-6 text-[#1F3864]" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                예시: 19690812 입력 → 자동으로 1969-08-12 변환됩니다. 또는 달력 아이콘을 눌러 선택하세요.
              </p>
            </div>}

            {/* 주민등록번호 (필수) */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                주민등록번호 <span className="text-red-400">*</span> <span className="text-gray-400 text-xs font-normal">(또는 생년월일 입력)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.residentNumber}
                onChange={(e) => setForm((f) => ({ ...f, residentNumber: formatRRN(e.target.value) }))}
                placeholder="000000-0000000"
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864] outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">유언장 전문 및 인증서 PDF에 포함됩니다. 암호화하여 안전하게 보관됩니다.</p>
            </div>

            {/* 이메일 (자동) */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">이메일</label>
              <input
                type="email"
                value={form.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">소셜 로그인 이메일 (변경 불가)</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!allRequired || saveMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl bg-[#1F3864] text-white text-sm font-bold hover:bg-[#162d52] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                저장
              </button>
            </div>
          </div>
        )}

        {/* 하단 안내 */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            유언장 작성은 <strong>무료</strong>입니다. 기본정보를 확인한 후 자산 등록, 상속자 등록,
            유언장 작성까지 자유롭게 진행하세요.
            <br />
            전자유언 인증은 결제 완료 후 별도로 진행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
