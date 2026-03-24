import { ScheduleEntry, Holiday } from '@/types';
import { getEmployees } from '@/lib/db/employees';
import { getScheduleConfig } from '@/lib/db/scheduleConfig';

/**
 * 计算从起始日期到目标日期的工作日数量
 */
export async function calculateWorkDaysToDate(
  startDate: string,
  targetDate: string,
  holidays: Holiday[]
): Promise<number> {
  const holidayMap = new Map<string, Holiday>();
  holidays.forEach(h => holidayMap.set(h.date, h));

  let count = 0;
  const current = new Date(startDate);
  const end = new Date(targetDate);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay();
    const holiday = holidayMap.get(dateStr);

    // 是工作日
    if (!holiday?.isOffDay && !(dayOfWeek === 0 || dayOfWeek === 6)) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * 根据工作日索引分配员工
 */
export function assignEmployeeByIndex(
  employees: string[],
  startEmployee: string,
  workDayIndex: number
): string | null {
  if (employees.length === 0) return null;

  const startIndex = employees.indexOf(startEmployee);
  if (startIndex === -1) return employees[workDayIndex % employees.length];

  return employees[(startIndex + workDayIndex) % employees.length];
}

/**
 * 生成指定月份的排班表
 */
export async function generateSchedule(
  year: number,
  month: number,
  holidays: Holiday[]
): Promise<ScheduleEntry[]> {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const holidayMap = new Map<string, Holiday>();
  holidays.forEach(h => holidayMap.set(h.date, h));

  const employees = await getEmployees();
  const config = await getScheduleConfig();

  const schedule: ScheduleEntry[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const holiday = holidayMap.get(dateStr);
    const dayOfWeek = new Date(dateStr).getDay();

    const isWorkday = !holiday?.isOffDay && !(dayOfWeek === 0 || dayOfWeek === 6);

    let employee: string | null = null;
    if (isWorkday && config.startDate && config.startEmployee) {
      const workDays = await calculateWorkDaysToDate(config.startDate, dateStr, holidays);
      employee = assignEmployeeByIndex(employees, config.startEmployee, workDays - 1);
    }

    schedule.push({
      date: dateStr,
      employee,
      dayOfWeek,
      isWorkday,
      isHoliday: !!holiday,
      isOffDay: !!holiday?.isOffDay,
      holidayName: holiday?.name
    });
  }

  return schedule;
}
