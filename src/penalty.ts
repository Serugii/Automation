const GRACE_PERIOD_DAYS = 3;
const DAILY_RATE = 0.001;
const MAX_PENALTY_RATE = 0.5;
const round2 = (n: number): number => Math.round(n * 100) / 100;

function assertValidDebt(debt: number): void {
  if (!Number.isFinite(debt) || debt < 0) {
    throw new Error('INVALID_DEBT');
  }
}

function assertValidDays(daysOverdue: number): void {
  if (!Number.isInteger(daysOverdue) || daysOverdue < 0) {
    throw new Error('INVALID_DAYS');
  }
}

export function calcPenalty(debt: number, daysOverdue: number): number {
  assertValidDebt(debt);
  assertValidDays(daysOverdue);
  return round2(calcRawPenalty(debt, daysOverdue));
}

export function calcRawPenalty(debt: number, daysOverdue: number): number {
  if (daysOverdue <= GRACE_PERIOD_DAYS) return 0;
  const chargeableDays = daysOverdue - GRACE_PERIOD_DAYS;
  return Math.min(debt * DAILY_RATE * chargeableDays, debt * MAX_PENALTY_RATE);
}
