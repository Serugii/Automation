const GRACE_PERIOD_DAYS = 3;
const DAILY_RATE = 0.001;

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
  if (daysOverdue <= GRACE_PERIOD_DAYS) return 0;
  return debt * DAILY_RATE * (daysOverdue - GRACE_PERIOD_DAYS);
}
