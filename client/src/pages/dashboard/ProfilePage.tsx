/**
 * EverWill 프로필 설정 페이지 (/dashboard/profile)
 * - 기본 프로필 정보
 * - 나의 추천인 코드 (소셜 공유 포함)
 * - 포인트 잔액 및 적립 내역
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { MemberGradeCard } from "@/components/MemberGradeBadge";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Calendar, Shield, LogOut, Gift, Copy, Check,
  TrendingUp, Clock, ChevronRight, Coins, Share2, X as XIcon,
  Pencil, Save, Phone, MapPin, Briefcase, Camera, CheckCircle2, AlertCircle
} from "lucide-react";
import FaceVerification from "@/components/FaceVerification";
import { useState, useEffect } from "react";
import { toast } from "sonner";

/** 포인트 유형 한국어 라벨 */
const POINT_TYPE_LABEL: Record<string, string> = {
  referral_reward: "추천 보상",
  referral_bonus: "가입 보너스",
  use: "포인트 사용",
  expire: "포인트 만료",
  admin: "관리자 지급",
};

/** 포인트 유형별 색상 */
const POINT_TYPE_COLOR: Record<string, string> = {
  referral_reward: "text-green-600",
  referral_bonus: "text-blue-600",
  use: "text-red-500",
  expire: "text-gray-400",
  admin: "text-purple-600",
};

/** 소셜 공유 채널 정의 */
interface ShareChannel {
  id: string;
  label: string;
  bgColor: string;
  textColor: string;
  /** SVG path 또는 이미지 URL */
  icon: "kakao" | "line" | "whatsapp" | "wechat" | "x" | "facebook" | "link";
  getUrl: (text: string, code: string) => string | null;
}

const SHARE_CHANNELS: ShareChannel[] = [
  {
    id: "kakao",
    label: "카카오톡",
    bgColor: "bg-[#FEE500]",
    textColor: "text-[#3A1D1D]",
    icon: "kakao",
    getUrl: () => null, // 카카오는 SDK 방식 (Web Share API fallback)
  },
  {
    id: "line",
    label: "LINE",
    bgColor: "bg-[#06C755]",
    textColor: "text-white",
    icon: "line",
    getUrl: (text) => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    bgColor: "bg-[#25D366]",
    textColor: "text-white",
    icon: "whatsapp",
    getUrl: (text) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  {
    id: "x",
    label: "X (Twitter)",
    bgColor: "bg-black",
    textColor: "text-white",
    icon: "x",
    getUrl: (text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    bgColor: "bg-[#1877F2]",
    textColor: "text-white",
    icon: "facebook",
    getUrl: (_text, code) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(`EverWill 추천 코드: ${code}`)}`,
  },
  {
    id: "link",
    label: "링크 복사",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    icon: "link",
    getUrl: () => null,
  },
];

/** 소셜 아이콘 SVG */
function SocialIcon({ type, size = 20 }: { type: ShareChannel["icon"]; size?: number }) {
  const s = size;
  if (type === "kakao") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.62 5.1 4.08 6.6l-1.08 3.96 4.56-2.88C10.44 18.6 11.22 18.72 12 18.72c5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z"/>
    </svg>
  );
  if (type === "line") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
  );
  if (type === "whatsapp") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
  if (type === "x") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
  if (type === "facebook") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
  // link
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const utils = trpc.useUtils();
  const [codeCopied, setCodeCopied] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [loadingChannel, setLoadingChannel] = useState<string | null>(null);

  // 프로필 수정 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    addressDetail: "",
    birthDate: "",
    occupation: "",
  });

  // user 데이터가 로드되면 폼 초기화
  useEffect(() => {
    if (user) {
      setEditForm({
        name: (user as any).name || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
        addressDetail: "",
        birthDate: (user as any).birthDate || "",
        occupation: (user as any).occupation || "",
      });
    }
  }, [user]);

  // 카카오 주소 검색 API 열기
  function openKakaoPostcode() {
    if (typeof window === 'undefined') return;
    const daum = (window as any).daum;
    if (!daum?.Postcode) {
      // 스크립트가 아직 로드되지 않은 경우 동적 로드
      const script = document.createElement('script');
      script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => {
        new (window as any).daum.Postcode({
          oncomplete: (data: any) => {
            const addr = data.roadAddress || data.jibunAddress;
            setEditForm(f => ({ ...f, address: addr, addressDetail: '' }));
          }
        }).open();
      };
      document.head.appendChild(script);
      return;
    }
    new daum.Postcode({
      oncomplete: (data: any) => {
        const addr = data.roadAddress || data.jibunAddress;
        setEditForm(f => ({ ...f, address: addr, addressDetail: '' }));
      }
    }).open();
  }

  // 이메일 가입자 프로필 업데이트
  const updateEmailProfileMutation = trpc.auth.email.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("정보가 저장되었습니다.");
      setIsEditing(false);
      utils.auth.me.invalidate();
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "저장에 실패했습니다.");
    },
  });

  // 휴대폰 가입자 프로필 업데이트
  const updatePhoneProfileMutation = trpc.auth.phone.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("정보가 저장되었습니다.");
      setIsEditing(false);
      utils.auth.me.invalidate();
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "저장에 실패했습니다.");
    },
  });

  const isSaving = updateEmailProfileMutation.isPending || updatePhoneProfileMutation.isPending;

  // 프로필 사진 업로드 상태
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [showKycSection, setShowKycSection] = useState(false);

  // 인증 상태 조회
  const { data: verificationStatus, refetch: refetchVerification } = trpc.verification.getStatus.useQuery();

  // 프로필 사진 업로드 mutation
  const uploadPhotoMutation = trpc.verification.uploadProfilePhoto.useMutation({
    onSuccess: (data) => {
      toast.success("프로필 사진이 업데이트되었습니다.");
      setProfilePhotoPreview(data.url);
      refetchVerification();
    },
    onError: (err) => {
      toast.error(err.message || "사진 업로드에 실패했습니다.");
    },
  });

  // 프로필 사진 선택 처리
  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB 이하여야 합니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      // 리사이즈
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 400;
        let { width, height } = img;
        if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
        else { width = Math.round(width * maxSize / height); height = maxSize; }
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        const resized = canvas.toDataURL("image/jpeg", 0.85);
        setProfilePhotoPreview(resized);
        uploadPhotoMutation.mutate({ photoBase64: resized });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  function handleCancelEdit() {
    // 취소 시 폼을 현재 user 정보로 재초기화
    if (user) {
      setEditForm({
        name: (user as any).name || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
        addressDetail: "",
        birthDate: (user as any).birthDate || "",
        occupation: (user as any).occupation || "",
      });
    }
    setIsEditing(false);
  }

  function handleSaveProfile() {
    const loginMethod = (user as any)?.loginMethod;
    const country = (user as any)?.country || "KR";
    // 주소 + 상세주소 합치기
    const fullAddress = editForm.addressDetail
      ? `${editForm.address} ${editForm.addressDetail}`.trim()
      : editForm.address;

    // 휴대폰 가입자
    if (loginMethod === "phone" || (!user?.email && editForm.phone)) {
      const phone = (user as any)?.phone || editForm.phone;
      if (!phone) {
        toast.error("휴대폰 번호를 확인할 수 없습니다.");
        return;
      }
      updatePhoneProfileMutation.mutate({
        phone,
        name: editForm.name,
        email: user?.email || undefined,
        address: fullAddress || undefined,
        birthDate: editForm.birthDate || undefined,
        occupation: editForm.occupation || undefined,
        country,
      });
      return;
    }

    // 이메일 가입자
    if (!user?.email) {
      toast.error("이메일 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
      return;
    }
    updateEmailProfileMutation.mutate({
      email: user.email,
      name: editForm.name,
      phone: editForm.phone || undefined,
      address: fullAddress || undefined,
      birthDate: editForm.birthDate || undefined,
      occupation: editForm.occupation || undefined,
      country,
    });
  }

  // 나의 추천인 코드 + 포인트 잔액 조회
  const { data: referralData, isLoading: referralLoading } = trpc.referral.getMyCode.useQuery();
  // 포인트 내역 조회
  const { data: historyData, isLoading: historyLoading } = trpc.referral.getHistory.useQuery();

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : "-";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const referralCode = referralData?.referralCode || "";

  /** 공유 메시지 텍스트 */
  function getShareText() {
    return `EverWill에서 유언장을 무료로 작성하세요! 🌍\n가입 시 추천인 코드 [${referralCode}]를 입력하면 특별 혜택이 있어요.\n👉 ${window.location.origin}`;
  }

  /** 코드 복사 */
  function copyCode() {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCodeCopied(true);
      toast.success("추천인 코드가 복사됐습니다!");
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  /** 링크 복사 */
  function copyLink() {
    const text = getShareText();
    navigator.clipboard.writeText(text).then(() => {
      setLinkCopied(true);
      toast.success("공유 링크가 복사됐습니다!");
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  /** 소셜 공유 실행 */
  async function handleShare(channel: ShareChannel) {
    if (!referralCode || loadingChannel) return;
    const text = getShareText();

    // 로딩 시작
    setLoadingChannel(channel.id);

    // 최소 700ms 로딩 표시 (UX 피드백)
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (channel.id === "link") {
      copyLink();
      setLoadingChannel(null);
      return;
    }

    // 카카오톡: Web Share API 사용 (모바일) 또는 URL scheme
    if (channel.id === "kakao") {
      if (navigator.share) {
        navigator.share({ title: "EverWill 추천", text, url: window.location.origin })
          .catch(() => {});
      } else {
        window.open(`https://story.kakao.com/share?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`, "_blank", "width=600,height=500");
      }
      setLoadingChannel(null);
      return;
    }

    const url = channel.getUrl(text, referralCode);
    if (url) {
      window.open(url, "_blank", "width=600,height=500,noopener,noreferrer");
    }
    setLoadingChannel(null);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
          나의 정보
        </h1>
        <p className="text-gray-400 text-sm mt-1">계정 정보와 포인트 내역을 확인하세요.</p>
      </div>

      {/* 프로필 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-5">
            {/* 프로필 사진 업로드 영역 */}
            <label className="relative cursor-pointer group shrink-0">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoChange}
              />
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#1F3864] flex items-center justify-center">
                {profilePhotoPreview || verificationStatus?.profilePhotoUrl ? (
                  <img
                    src={profilePhotoPreview || verificationStatus?.profilePhotoUrl || ""}
                    alt="프로필 사진"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-xl">{initials}</span>
                )}
              </div>
              {/* 호버 오버레이 */}
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadPhotoMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
              {/* 카메라 아이콘 배지 */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#C9A961] rounded-full flex items-center justify-center">
                <Camera className="w-2.5 h-2.5 text-white" />
              </div>
            </label>
            <div>
              <h2 className="font-bold text-[#1F3864] text-lg">{user?.name || "사용자"}</h2>
              <p className="text-gray-400 text-sm">{user?.email || "-"}</p>
              <span className="inline-block mt-1 bg-[#C9A961]/10 text-[#C9A961] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {user?.role === "admin" ? "관리자" : "일반 회원"}
              </span>
            </div>
          </div>
          {/* 수정 / 저장 버튼 */}
          <div className="shrink-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-sm text-[#1F3864] border border-[#1F3864]/20 hover:bg-[#1F3864]/5 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              수정
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="text-sm text-gray-400 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-1.5 text-sm text-white bg-[#1F3864] hover:bg-[#162d52] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
           )}
          </div>
        </div>
        {/* 회원 등급 카드 */}
        <MemberGradeCard className="mb-4" />
        <div className="space-y-4 border-t border-gray-50 pt-5">
          {/* 이름 */}
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-300 shrink-0" />
            <span className="text-gray-400 text-sm w-24 shrink-0">이름</span>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1F3864] focus:outline-none focus:border-[#1F3864]"
                placeholder="이름을 입력하세요"
              />
            ) : (
              <span className="text-[#1F3864] text-sm font-medium">{(user as any)?.name || "-"}</span>
            )}
          </div>

          {/* 이메일 (읽기 전용) */}
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-300 shrink-0" />
            <span className="text-gray-400 text-sm w-24 shrink-0">이메일</span>
            <span className="text-[#1F3864] text-sm font-medium">{user?.email || "-"}</span>
          </div>

          {/* 전화번호 */}
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-300 shrink-0" />
            <span className="text-gray-400 text-sm w-24 shrink-0">전화번호</span>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1F3864] focus:outline-none focus:border-[#1F3864]"
                placeholder="010-0000-0000"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[#1F3864] text-sm font-medium">{(user as any)?.phone || "-"}</span>
                {/* 인증 완료 배지: 전화번호가 등록된 경우 표시 */}
                {(user as any)?.phone && (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    인증완료
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 생년월일 */}
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-300 shrink-0" />
            <span className="text-gray-400 text-sm w-24 shrink-0">생년월일</span>
            {isEditing ? (
              <input
                type="date"
                value={editForm.birthDate}
                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1F3864] focus:outline-none focus:border-[#1F3864]"
              />
            ) : (
              <span className="text-[#1F3864] text-sm font-medium">{(user as any)?.birthDate || "-"}</span>
            )}
          </div>

          {/* 주소 */}
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-300 shrink-0 mt-2" />
            <span className="text-gray-400 text-sm w-24 shrink-0 mt-2">주소</span>
            {isEditing ? (
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editForm.address}
                    readOnly
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1F3864] bg-gray-50 cursor-pointer"
                    placeholder="주소 검색을 클릭하세요"
                    onClick={openKakaoPostcode}
                  />
                  <button
                    type="button"
                    onClick={openKakaoPostcode}
                    className="shrink-0 px-3 py-1.5 bg-[#1F3864] text-white text-xs rounded-lg hover:bg-[#162a4e] transition-colors whitespace-nowrap"
                  >
                    주소 검색
                  </button>
                </div>
                {/* 상세 주소 입력 (동/호수 등) */}
                <input
                  type="text"
                  value={editForm.addressDetail || ""}
                  onChange={(e) => setEditForm({ ...editForm, addressDetail: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1F3864] focus:outline-none focus:border-[#1F3864]"
                  placeholder="상세 주소 (동, 호수 등)"
                />
              </div>
            ) : (
              <span className="text-[#1F3864] text-sm font-medium">{(user as any)?.address || "-"}</span>
            )}
          </div>

          {/* 직업 */}
          <div className="flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-gray-300 shrink-0" />
            <span className="text-gray-400 text-sm w-24 shrink-0">직업</span>
            {isEditing ? (
              <input
                type="text"
                value={editForm.occupation}
                onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#1F3864] focus:outline-none focus:border-[#1F3864]"
                placeholder="직업을 입력하세요"
              />
            ) : (
              <span className="text-[#1F3864] text-sm font-medium">{(user as any)?.occupation || "-"}</span>
            )}
          </div>

          {/* 로그인 방식 / 가입일 (읽기 전용) */}
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-gray-300 shrink-0" />
            <span className="text-gray-400 text-sm w-24 shrink-0">로그인 방식</span>
            <span className="text-[#1F3864] text-sm font-medium">{(user as any)?.loginMethod || "OAuth"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-300 shrink-0" />
            <span className="text-gray-400 text-sm w-24 shrink-0">가입일</span>
            <span className="text-[#1F3864] text-sm font-medium">{joinDate}</span>
          </div>
        </div>
      </motion.div>

      {/* 본인 인증 (KYC) 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1F3864]" />
            <h3 className="font-bold text-[#1F3864] text-sm">본인 인증 (eKYC)</h3>
          </div>
          {verificationStatus?.faceVerified ? (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
              <CheckCircle2 className="w-3 h-3" /> 인증 완료
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-200">
              <AlertCircle className="w-3 h-3" /> 미인증
            </span>
          )}
        </div>

        {verificationStatus?.faceVerified ? (
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">본인 인증이 완료되었습니다</p>
                {verificationStatus.faceVerifiedAt && (
                  <p className="text-xs text-green-600 mt-0.5">
                    {new Date(verificationStatus.faceVerifiedAt).toLocaleDateString("ko-KR")} 인증됨
                  </p>
                )}
                <p className="text-xs text-green-600 mt-1">{verificationStatus.faceVerifyResult}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-sm mb-4">
              유언장 인증을 위해 신분증과 셀피(얼굴 사진)로 본인 인증을 완료해주세요.
            </p>
            {!showKycSection ? (
              <button
                onClick={() => setShowKycSection(true)}
                className="w-full py-3 border-2 border-dashed border-[#1F3864]/20 rounded-xl text-[#1F3864] text-sm font-medium hover:bg-[#1F3864]/5 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                본인 인증 시작하기
              </button>
            ) : (
              <FaceVerification onSuccess={() => { setShowKycSection(false); refetchVerification(); }} />
            )}
          </div>
        )}
      </motion.div>

      {/* 포인트 잔액 + 추천인 코드 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-[#1F3864] to-[#243d72] rounded-2xl p-6 text-white"
      >
        {/* 포인트 잔액 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">포인트 잔액</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">
                {referralLoading ? "..." : (referralData?.pointBalance || 0).toLocaleString()}
              </span>
              <span className="text-[#C9A961] font-semibold text-lg mb-0.5">P</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
            <Coins className="w-7 h-7 text-[#C9A961]" />
          </div>
        </div>

        {/* 나의 추천인 코드 */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#C9A961]" />
              <span className="text-white/80 text-xs font-medium">나의 추천인 코드</span>
            </div>
            {/* 공유 버튼 토글 */}
            <button
              onClick={() => setShowSharePanel(!showSharePanel)}
              disabled={!referralCode}
              className="flex items-center gap-1.5 text-white/60 hover:text-white disabled:opacity-30 text-xs transition-colors"
            >
              {showSharePanel ? (
                <XIcon className="w-3.5 h-3.5" />
              ) : loadingChannel ? (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              {showSharePanel ? "닫기" : loadingChannel ? "공유 중..." : "공유하기"}
            </button>
          </div>

          {/* 코드 + 복사 버튼 */}
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-2xl font-bold tracking-[0.2em] text-white flex-1">
              {referralLoading ? "------" : (referralCode || "------")}
            </span>
            <button
              onClick={copyCode}
              disabled={!referralCode}
              className="flex items-center gap-1.5 bg-[#C9A961] hover:bg-[#b8943f] disabled:opacity-40 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all"
            >
              {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {codeCopied ? "복사됨" : "복사"}
            </button>
          </div>

          <p className="text-white/50 text-xs">
            친구에게 이 코드를 공유하면 가입 시 <span className="text-[#C9A961] font-semibold">5,000P</span>가 적립됩니다.
          </p>

          {/* 소셜 공유 패널 */}
          <AnimatePresence>
            {showSharePanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-xs mb-3">소셜 미디어로 공유하기</p>
                  <div className="grid grid-cols-3 gap-2">
                    {SHARE_CHANNELS.map((channel) => {
                      const isLoading = loadingChannel === channel.id;
                      const isDone = channel.id === "link" && linkCopied;
                      return (
                        <button
                          key={channel.id}
                          onClick={() => handleShare(channel)}
                          disabled={!!loadingChannel}
                          className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl ${channel.bgColor} ${channel.textColor} transition-all text-xs font-semibold
                            ${loadingChannel && !isLoading ? "opacity-40 cursor-not-allowed" : "hover:opacity-90 active:scale-95"}
                          `}
                        >
                          {/* 로딩 링 오버레이 */}
                          {isLoading && (
                            <span className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/20">
                              <svg
                                className="animate-spin w-6 h-6"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12" cy="12" r="10"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                />
                                <path
                                  className="opacity-80"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                              </svg>
                            </span>
                          )}
                          {/* 완료 체크 */}
                          {isDone ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <SocialIcon type={channel.icon} size={22} />
                          )}
                          <span className="text-[10px] leading-tight text-center">
                            {isLoading ? "공유 중..." : isDone ? "복사됨!" : channel.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* 공유 미리보기 */}
                  <div className="mt-3 bg-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-[10px] mb-1">공유 메시지 미리보기</p>
                    <p className="text-white/70 text-xs leading-relaxed whitespace-pre-line">
                      {referralCode ? getShareText() : ""}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 포인트 적립 내역 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C9A961]" />
            <h3 className="font-bold text-[#1F3864] text-sm">포인트 적립 내역</h3>
          </div>
          <span className="text-gray-300 text-xs">{historyData?.length || 0}건</span>
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-3 py-3">
                <div className="w-8 h-8 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-2.5 bg-gray-50 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : !historyData || historyData.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">아직 포인트 내역이 없습니다.</p>
            <p className="text-gray-300 text-xs mt-1">친구를 추천하면 5,000P가 적립됩니다.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {historyData.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  item.amount > 0 ? "bg-green-50" : "bg-red-50"
                }`}>
                  <ChevronRight className={`w-4 h-4 ${item.amount > 0 ? "text-green-500" : "text-red-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1F3864] text-sm font-medium truncate">
                    {POINT_TYPE_LABEL[item.type] || item.type}
                  </p>
                  <p className="text-gray-400 text-xs truncate">{item.description || "-"}</p>
                  <p className="text-gray-300 text-xs">
                    {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${POINT_TYPE_COLOR[item.type] || "text-gray-600"}`}>
                    {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()}P
                  </p>
                  <p className="text-gray-300 text-xs">{item.balanceAfter.toLocaleString()}P</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  );
}
