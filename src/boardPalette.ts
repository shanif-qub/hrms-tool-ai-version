export const BOARD_PALETTE: Record<string, { ref: string; label: string }[]> = {
  employee: [{ ref: 'myHours', label: 'My hours' }, { ref: 'myLeave', label: 'My leave' }, { ref: 'myGoals', label: 'My goals' }, { ref: 'myPay', label: 'My pay' }],
  manager: [{ ref: 'attendance', label: 'Attendance' }, { ref: 'workload', label: 'Team workload' }, { ref: 'comp', label: 'Compensation' }, { ref: 'retention', label: 'Retention' }],
  hr: [{ ref: 'attendance', label: 'Attendance' }, { ref: 'comp', label: 'Compensation' }, { ref: 'workload', label: 'Workload' }],
};
