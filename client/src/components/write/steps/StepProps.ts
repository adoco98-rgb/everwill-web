import type { WillData } from "@/lib/willTypes";

export interface StepProps {
  will: WillData;
  update: (partial: Partial<WillData>) => void;
  onNext: () => void;
  onPrev: () => void;
}
