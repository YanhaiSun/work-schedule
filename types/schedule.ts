export interface ScheduleEntry {
  date: string;           // YYYY-MM-DD
  employee: string | null;
  dayOfWeek: number;      // 0-6 (周日至周六)
  isWorkday: boolean;      // 是否工作日
  isHoliday: boolean;     // 是否节假日
  isOffDay: boolean;       // 是否休息日（节假日中休息的那种）
  holidayName?: string;    // 节假日名称
}

export interface ScheduleConfig {
  startDate?: string;      // YYYY-MM-DD 起始日期
  startEmployee?: string;  // 起始员工姓名
  employeeOrder: string[]; // 员工值班顺序
}

export interface ScheduleResponse {
  schedule: ScheduleEntry[];
  employees: string[];
}
