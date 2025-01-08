import { AuthGuard } from '@nestjs/passport';
import { StrategyType } from '@/common/constants';

export const DynamicStrategyGuard = (name: StrategyType) => {
  return class GuardWrapper extends AuthGuard(name) {};
};
