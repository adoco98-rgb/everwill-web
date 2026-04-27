/**
 * 만족도 평가 완료 페이지
 * URL: /feedback?id=123&token=xxx&score=5
 * 이메일의 이모지 링크 클릭 시 이 페이지로 이동, API 호출 후 결과 표시
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const scoreLabels: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: "😞", label: "매우 불만족", color: "#DC2626" },
  2: { emoji: "😕", label: "불만족", color: "#F97316" },
  3: { emoji: "😐", label: "보통", color: "#EAB308" },
  4: { emoji: "😊", label: "만족", color: "#22C55E" },
  5: { emoji: "😄", label: "매우 만족", color: "#16A34A" },
};

export default function Feedback() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const inquiryId = parseInt(params.get("id") ?? "0");
  const token = params.get("token") ?? "";
  const score = parseInt(params.get("score") ?? "0");

  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");

  const submitMutation = trpc.inquiry.submitSatisfaction.useMutation({
    onSuccess: () => setStatus("success"),
    onError: (err) => {
      if (err.message.includes("이미 평가")) {
        setStatus("already");
      } else {
        setStatus("error");
      }
    },
  });

  useEffect(() => {
    if (!inquiryId || !token || score < 1 || score > 5) {
      setStatus("error");
      return;
    }
    submitMutation.mutate({ inquiryId, token, score });
  }, []);

  const scoreInfo = scoreLabels[score];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f4f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Apple SD Gothic Neo', Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "48px 40px",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* 로고 */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#C9A961", letterSpacing: "2px" }}>
            EverWill
          </div>
          <div style={{ fontSize: "10px", color: "#9CA3AF", letterSpacing: "3px", marginTop: "2px" }}>
            DIGITAL WILL OS
          </div>
        </div>

        {status === "loading" && (
          <>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <h2 style={{ color: "#1F3864", fontSize: "20px", margin: "0 0 8px" }}>평가 처리 중...</h2>
            <p style={{ color: "#6B7280", fontSize: "14px" }}>잠시만 기다려 주세요.</p>
          </>
        )}

        {status === "success" && scoreInfo && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>{scoreInfo.emoji}</div>
            <h2 style={{ color: "#1F3864", fontSize: "22px", margin: "0 0 8px" }}>
              소중한 의견 감사합니다!
            </h2>
            <div
              style={{
                display: "inline-block",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "8px 20px",
                margin: "12px 0 20px",
                fontSize: "16px",
                fontWeight: "600",
                color: scoreInfo.color,
              }}
            >
              {scoreInfo.label}으로 평가해 주셨습니다
            </div>
            <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.6" }}>
              고객님의 피드백은 EverWill 서비스 개선에<br />
              소중하게 활용됩니다. 감사합니다.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                marginTop: "24px",
                background: "#1F3864",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              EverWill 홈으로
            </a>
          </>
        )}

        {status === "already" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ color: "#1F3864", fontSize: "20px", margin: "0 0 8px" }}>
              이미 평가하셨습니다
            </h2>
            <p style={{ color: "#6B7280", fontSize: "14px" }}>
              만족도 평가는 1회만 가능합니다.<br />
              소중한 의견 감사합니다!
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                marginTop: "24px",
                background: "#1F3864",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              EverWill 홈으로
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
            <h2 style={{ color: "#DC2626", fontSize: "20px", margin: "0 0 8px" }}>
              평가 링크가 유효하지 않습니다
            </h2>
            <p style={{ color: "#6B7280", fontSize: "14px" }}>
              링크가 만료되었거나 잘못된 접근입니다.<br />
              문의 사항은 adoco98@gmail.com으로 연락해 주세요.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                marginTop: "24px",
                background: "#6B7280",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              홈으로
            </a>
          </>
        )}
      </div>
    </div>
  );
}
