import { CalculatorDecision, CalculatorHead, CalculatorMcle } from '@/components/postbar/CalculatorSlots';
import { CalculatorLive } from '@/components/postbar/CalculatorLive';
import type { McleGroup } from '@/lib/caCalc';

export function SwearingInCalculator({ mcle, compact = false }: { mcle?: { groups: McleGroup[]; source: { label: string; url: string } }; compact?: boolean } = {}) {
  return (
    <CalculatorLive mcle={mcle} compact={compact} head={<CalculatorHead />} decision={<CalculatorDecision />} mcleCards={<CalculatorMcle mcle={mcle} />} />
  );
}
