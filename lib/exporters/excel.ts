import * as XLSX from 'xlsx';
import { ScheduleEntry } from '@/types';

export function exportScheduleToExcel(schedule: ScheduleEntry[], year: number, month: number): void {
  // 创建日期映射
  const scheduleMap = new Map<string, ScheduleEntry>();
  schedule.forEach(entry => {
    scheduleMap.set(entry.date, entry);
  });

  // 获取该月的第一天和最后一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 获取该月第一周的第一天（可能在上个月）
  const firstWeekStart = new Date(firstDay);
  firstWeekStart.setDate(firstDay.getDate() - firstDay.getDay());

  // 获取该月最后一周的最后一天（可能在下个月）
  const lastWeekEnd = new Date(lastDay);
  lastWeekEnd.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const calendar: (string | number)[][] = [
    [...weekdays]
  ];

  const currentDay = new Date(firstWeekStart);
  let weekNumber = 1;

  while (currentDay <= lastWeekEnd) {
    const weekRow: (string | number)[] = [`第${weekNumber}周`];

    for (let i = 0; i < 7; i++) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const entry = scheduleMap.get(dateStr);
      const isCurrentMonth = currentDay.getMonth() === month;

      if (entry && isCurrentMonth) {
        const dayText = currentDay.getDate();
        const employeeText = entry.employee || (entry.isWorkday ? '' : '休');
        weekRow.push(`${dayText}日 ${employeeText}`);
      } else if (!isCurrentMonth) {
        weekRow.push('');
      } else {
        weekRow.push(`${currentDay.getDate()}日`);
      }

      currentDay.setDate(currentDay.getDate() + 1);
    }

    calendar.push(weekRow);
    weekNumber++;
  }

  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(calendar);

  // 设置列宽
  worksheet['!cols'] = [
    { wch: 8 },  // 周标题
    { wch: 12 }, // 周日
    { wch: 12 }, // 周一
    { wch: 12 }, // 周二
    { wch: 12 }, // 周三
    { wch: 12 }, // 周四
    { wch: 12 }, // 周五
    { wch: 12 }, // 周六
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, `${year}年${month + 1}月`);
  XLSX.writeFile(workbook, `排班表_${year}年${month + 1}月.xlsx`);
}
