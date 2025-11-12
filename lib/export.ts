import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// 初始化pdfMake字体
Object.assign((pdfMake as any), pdfFonts);

interface ScheduleEntry {
  date: string;
  employee: string | null;
  dayOfWeek: number;
  isWorkday: boolean;
  isHoliday: boolean;
  isOffDay: boolean;
  holidayName?: string;
}

/**
 * 导出排班表为Excel文件（日历格式）
 * @param schedule 排班表数据
 * @param filename 文件名
 */
export function exportToExcel(schedule: ScheduleEntry[], filename: string): void {
  // 按月份分组数据
  const scheduleByMonth: { [key: string]: ScheduleEntry[] } = {};
  schedule.forEach(entry => {
    const monthKey = entry.date.substring(0, 7); // YYYY-MM
    if (!scheduleByMonth[monthKey]) {
      scheduleByMonth[monthKey] = [];
    }
    scheduleByMonth[monthKey].push(entry);
  });

  // 创建工作簿
  const workbook = XLSX.utils.book_new();

  // 为每个月份创建一个工作表
  Object.keys(scheduleByMonth).forEach(monthKey => {
    const monthSchedule = scheduleByMonth[monthKey];
    if (monthSchedule.length === 0) return;

    // 获取月份信息
    const year = parseInt(monthKey.split('-')[0]);
    const month = parseInt(monthKey.split('-')[1]) - 1; // JS月份从0开始

    // 创建日历格式的数据
    const calendarData = createTrueCalendarFormat(monthSchedule, year, month);

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(calendarData);
    
    // 设置列宽
    const columnWidths = [];
    // 一周七天的列宽
    for (let i = 0; i < 8; i++) { // 8列：周标题 + 7天
      columnWidths.push({ wch: 12 });
    }
    worksheet['!cols'] = columnWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, `${year}年${month + 1}月`);
  });

  // 导出文件
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * 创建真正的日历格式数据
 * @param schedule 排班表数据
 * @param year 年份
 * @param month 月份 (0-11)
 * @returns 日历格式的二维数组
 */
function createTrueCalendarFormat(schedule: ScheduleEntry[], year: number, month: number): any[][] {
  // 表头
  const weekdays = ['周/日', '周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const calendar: any[][] = [weekdays];

  // 创建一个日期映射以便快速查找
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

  // 按周生成日历
  const currentDay = new Date(firstWeekStart);
  let weekNumber = 1;
  
  while (currentDay <= lastWeekEnd) {
    const weekRow: any[] = [`第${weekNumber}周`];
    
    // 生成一周七天的数据
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const entry = scheduleMap.get(dateStr);
      
      if (entry) {
        // 如果是当前月份的日期
        if (entry.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
          const dayText = currentDay.getDate();
          const employeeText = entry.employee || (entry.isWorkday ? '' : '休');
          weekRow.push(`${dayText}\n${employeeText}`);
        } else {
          // 上个月或下个月日期简单显示日期
          weekRow.push(`${currentDay.getDate()}`);
        }
      } else {
        weekRow.push(`${currentDay.getDate()}`);
      }
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    calendar.push(weekRow);
    weekNumber++;
  }

  return calendar;
}

interface PdfMakeTableBody extends Array<Array<string | { text: string; bold?: boolean }>> {}

/**
 * 导出排班表为PDF文件（日历格式）
 * @param schedule 排班表数据
 * @param filename 文件名
 */
export function exportToPDF(schedule: ScheduleEntry[], filename: string): void {
  // 按月份分组数据
  const scheduleByMonth: { [key: string]: ScheduleEntry[] } = {};
  schedule.forEach(entry => {
    const monthKey = entry.date.substring(0, 7); // YYYY-MM
    if (!scheduleByMonth[monthKey]) {
      scheduleByMonth[monthKey] = [];
    }
    scheduleByMonth[monthKey].push(entry);
  });

  // 为每个月份创建内容
  const content: any[] = [];
  
  content.push({
    text: '排班表',
    style: 'header',
    alignment: 'center',
    margin: [0, 0, 0, 20]
  });

  Object.keys(scheduleByMonth).forEach((monthKey, index) => {
    const monthSchedule = scheduleByMonth[monthKey];
    if (monthSchedule.length === 0) return;

    // 添加月份标题（除了第一个）
    if (index > 0) {
      content.push({
        text: '',
        pageBreak: 'before'
      });
    }

    const year = parseInt(monthKey.split('-')[0]);
    const month = parseInt(monthKey.split('-')[1]);

    content.push({
      text: `${year}年${month}月`,
      style: 'subheader',
      margin: [0, 0, 0, 10]
    });

    // 创建真正的日历格式数据
    const calendarData = createTrueCalendarFormatForPdf(monthSchedule, year, month - 1);

    // 添加表格
    content.push({
      table: {
        headerRows: 1,
        widths: ['auto', '*', '*', '*', '*', '*', '*', '*'],
        body: calendarData
      },
      layout: 'lightHorizontalLines'
    });
  });

  // PDF文档定义
  const docDefinition: any = {
    content,
    styles: {
      header: {
        fontSize: 18,
        bold: true
      },
      subheader: {
        fontSize: 14,
        bold: true
      }
    }
  };

  // 生成并下载PDF
  (pdfMake as any).createPdf(docDefinition).download(`${filename}.pdf`);
}

/**
 * 创建PDF的真正日历格式数据
 * @param schedule 排班表数据
 * @param year 年份
 * @param month 月份 (0-11)
 * @returns 日历格式的二维数组
 */
function createTrueCalendarFormatForPdf(schedule: ScheduleEntry[], year: number, month: number): any[][] {
  // 表头
  const weekdays = ['周/日', '周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const tableBody: any[][] = [weekdays];

  // 创建一个日期映射以便快速查找
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

  // 按周生成日历
  const currentDay = new Date(firstWeekStart);
  let weekNumber = 1;
  
  while (currentDay <= lastWeekEnd) {
    const weekRow: any[] = [`第${weekNumber}周`];
    
    // 生成一周七天的数据
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const entry = scheduleMap.get(dateStr);
      
      if (entry) {
        // 如果是当前月份的日期
        if (entry.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
          const dayText = currentDay.getDate();
          const employeeText = entry.employee || (entry.isWorkday ? '' : '休');
          weekRow.push(`${dayText}\n${employeeText}`);
        } else {
          // 上个月或下个月日期用灰色显示
          weekRow.push({ text: `${currentDay.getDate()}`, color: '#888888' });
        }
      } else {
        weekRow.push(`${currentDay.getDate()}`);
      }
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    tableBody.push(weekRow);
    weekNumber++;
  }

  return tableBody;
}

export default {
  exportToExcel,
  exportToPDF
};