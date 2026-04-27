/**
 * 회원가입 이탈 추적 훅
 * - 브라우저 세션별 UUID 생성 (sessionStorage 유지)
 * - 각 단계 진입/이탈/완료 이벤트를 서버에 전송
 * - 단계 체류 시간 자동 측정
 */
import { useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

export type TrackingStep = "step1" | "step2" | "step3" | "step4" | "step5" | "complete";

/** 브라우저 세션 ID 생성 또는 재사용 */
function getOrCreateSessionId(): string {
  const key = "ew_signup_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

/** 기기 유형 감지 */
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

export function useSignupTracking() {
  const sessionId = useRef<string>("");
  const stepStartTime = useRef<number>(0);
  const currentStep = useRef<TrackingStep | null>(null);
  // beforeunload 시 최신 상태를 읽기 위한 ref
  const currentEmail = useRef<string | undefined>(undefined);
  const currentCountry = useRef<string | undefined>(undefined);

  const recordEvent = trpc.signupTracking.recordEvent.useMutation();

  useEffect(() => {
    sessionId.current = getOrCreateSessionId();
  }, []);

  /** 단계 진입 이벤트 기록 */
  const trackEnter = useCallback(
    (step: TrackingStep, email?: string, country?: string) => {
      stepStartTime.current = Date.now();
      currentStep.current = step;
      if (email) currentEmail.current = email;
      if (country) currentCountry.current = country;
      recordEvent.mutate({
        sessionId: sessionId.current,
        event: "enter",
        step,
        email,
        country,
        lang: navigator.language,
      });
    },
    [recordEvent]
  );

  /** 단계 이탈 이벤트 기록 */
  const trackLeave = useCallback(
    (step: TrackingStep, email?: string, country?: string) => {
      const durationSec = stepStartTime.current
        ? Math.round((Date.now() - stepStartTime.current) / 1000)
        : undefined;
      const resolvedEmail = email ?? currentEmail.current;
      const resolvedCountry = country ?? currentCountry.current;
      if (email) currentEmail.current = email;
      if (country) currentCountry.current = country;
      recordEvent.mutate({
        sessionId: sessionId.current,
        event: "leave",
        step,
        email: resolvedEmail,
        country: resolvedCountry,
        lang: navigator.language,
        durationSec,
      });
      currentStep.current = null;
    },
    [recordEvent]
  );

  /** beforeunload 시 현재 단계 이탈 이벤트 전송 (ref 기반으로 최신 상태 반영) */
  const trackUnload = useCallback(() => {
    const step = currentStep.current;
    if (!step || step === "complete") return;
    const durationSec = stepStartTime.current
      ? Math.round((Date.now() - stepStartTime.current) / 1000)
      : undefined;
    // tRPC 배치 포맷: /api/trpc/signupTracking.recordEvent?batch=1
    // input.0.json 형식으로 전송
    const payload = JSON.stringify({
      "0": {
        json: {
          sessionId: sessionId.current,
          event: "leave",
          step,
          email: currentEmail.current,
          country: currentCountry.current,
          lang: navigator.language,
          durationSec,
        }
      }
    });
    // sendBeacon: 페이지 닫힌 후에도 전송 보장
    const sent = navigator.sendBeacon
      ? navigator.sendBeacon(
          "/api/trpc/signupTracking.recordEvent?batch=1",
          new Blob([payload], { type: "application/json" })
        )
      : false;
    // sendBeacon 실패 시 fetch keepalive 폴백
    if (!sent) {
      try {
        fetch("/api/trpc/signupTracking.recordEvent?batch=1", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }
  }, []);

  /** 가입 완료 이벤트 기록 */
  const trackComplete = useCallback(
    (email?: string, country?: string) => {
      const durationSec = stepStartTime.current
        ? Math.round((Date.now() - stepStartTime.current) / 1000)
        : undefined;
      recordEvent.mutate({
        sessionId: sessionId.current,
        event: "complete",
        step: "complete",
        email,
        country,
        lang: navigator.language,
        durationSec,
      });
      currentStep.current = null;
      // 완료 후 세션 ID 초기화 (재가입 방지)
      sessionStorage.removeItem("ew_signup_sid");
    },
    [recordEvent]
  );

  return { trackEnter, trackLeave, trackComplete, trackUnload };
}
