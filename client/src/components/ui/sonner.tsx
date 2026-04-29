import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * 전역 토스트 알림 코어넌트
 * next-themes 의존성 없이 light 테마로 고정
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      richColors
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
