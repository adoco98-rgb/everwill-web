import type { WillData } from "@/lib/willTypes";

export interface StepProps {
  will: WillData;
  update: (partial: Partial<WillData>) => void;
  onNext: () => void;
  onPrev: () => void;
  /** 기존 유언장 수정 시 DB willId */
  existingWillId?: number;
}
