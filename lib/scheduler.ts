import fs from 'fs';
import path from 'path';
import { getEmployees } from './employees';
import { getScheduleConfig } from './scheduleConfig';

interface ScheduleEntry {
  date: string;
  employee: string | null;
  dayOfWeek: number;
  isWorkday: boolean;
  isHoliday: boolean;
  isOffDay: boolean;
  holidayName?: string;
}

interface Holiday {
  name: string;
  date: string;
  isOffDay: boolean;
}

/**
 * 获取指定年份的节假日数据
 * @param year 年份
 * @returns 节假日数据
 */
async function getHolidaysForYear(year: number): Promise<Holiday[]> {
  try {
    // 构建文件路径
    const filePath = path.join(process.cwd(), 'holidays', `${year}.json`);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.warn(`Holiday file for year ${year} not found`);
      return [];
    }
    
    // 读取并解析JSON文件
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const holidayData = JSON.parse(fileContent);
    
    return holidayData.days;
  } catch (error) {
    console.error(`Error reading holiday data for year ${year}:`, error);
    return [];
  }
}

/**
 * 生成指定月份的排班表（包含所有日期）
 * @param year 年份
 * @param month 月份 (0-11)
 * @param holidays 节假日数据
 * @returns 排班表
 */
export async function generateAdvancedSchedule(
  year: number, 
  month: number, 
  holidays: Holiday[]
): Promise<ScheduleEntry[]> {
  try {
    // 获取该月的所有日期
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const allDates: string[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      allDates.push(dateStr);
    }
    
    // 创建节假日映射
    const holidayMap = new Map<string, Holiday>();
    holidays.forEach(holiday => {
      holidayMap.set(holiday.date, holiday);
    });
    
    // 获取员工列表
    const employees = await getEmployees();
    
    // 获取排班配置
    const config = await getScheduleConfig();
    
    // 如果没有设置起始日期，返回空数组
    if (!config.startDate) {
      // 生成包含所有日期的排班表（无员工分配）
      const schedule: ScheduleEntry[] = allDates.map(date => {
        const holiday = holidayMap.get(date);
        const dayOfWeek = new Date(date).getDay();
        
        // 判断是否为工作日
        let isWorkday = true;
        let isOffDay = false;
        
        // 1. 如果是节假日且标记为休息日，则不是工作日
        if (holiday && holiday.isOffDay) {
          isWorkday = false;
          isOffDay = true;
        }
        // 2. 如果是周末(周六或周日)且不是调休工作日，则不是工作日
        else if ((dayOfWeek === 0 || dayOfWeek === 6) && !holiday) {
          isWorkday = false;
        }
        
        return {
          date,
          employee: null,
          dayOfWeek,
          isWorkday,
          isHoliday: !!holiday,
          isOffDay,
          holidayName: holiday ? holiday.name : undefined
        };
      });
      
      return schedule;
    }
    
    // 获取起始日期所在年份的所有节假日
    const startYear = new Date(config.startDate).getFullYear();
    let allHolidays: Holiday[] = [];
    
    // 如果起始日期和当前日期在同一年
    if (startYear === year) {
      allHolidays = holidays;
    } else {
      // 需要合并起始年份和当前年份的节假日
      const startYearHolidays = await getHolidaysForYear(startYear);
      allHolidays = [...startYearHolidays, ...holidays];
    }
    
    // 计算从起始日期到当前月份第一天的工作日数量
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`; // 本月第一天
    
    // 获取从起始日期到目标月份第一天之间的所有工作日
    const workDaysToMonthStart = await getWorkDaysInRange(config.startDate, targetDateStr, allHolidays);
    
    // 生成排班表
    const schedule: ScheduleEntry[] = [];
    let employeeIndex = 0;
    
    // 如果起始员工存在，计算起始索引
    if (config.startEmployee && employees.includes(config.startEmployee)) {
      const startIndex = employees.indexOf(config.startEmployee);
      // 计算从起始日期到当前日期之前所有工作日的数量，以确定当前日期应该由谁值班
      employeeIndex = startIndex;
    }
    
    for (const date of allDates) {
      const holiday = holidayMap.get(date);
      const dayOfWeek = new Date(date).getDay();
      
      // 判断是否为工作日
      let isWorkday = true;
      let isOffDay = false;
      
      // 1. 如果是节假日且标记为休息日，则不是工作日
      if (holiday && holiday.isOffDay) {
        isWorkday = false;
        isOffDay = true;
      }
      // 2. 如果是周末(周六或周日)且不是调休工作日，则不是工作日
      else if ((dayOfWeek === 0 || dayOfWeek === 6) && !holiday) {
        isWorkday = false;
      }
      
      // 只有工作日才分配员工
      let employee: string | null = null;
      if (isWorkday) {
        // 计算到当前日期为止的总工作日数
        const workDaysToCurrentDate = await getWorkDaysInRange(config.startDate, date, allHolidays);
        const totalWorkDays = workDaysToCurrentDate.length;
        employee = employees[(employeeIndex + totalWorkDays - 1) % employees.length];
      }
      
      schedule.push({
        date,
        employee,
        dayOfWeek,
        isWorkday,
        isHoliday: !!holiday,
        isOffDay,
        holidayName: holiday ? holiday.name : undefined
      });
    }
    
    return schedule;
  } catch (error) {
    console.error('Error generating advanced schedule:', error);
    throw error;
  }
}

/**
 * 获取指定日期范围内的所有工作日
 * @param startDate 起始日期 (YYYY-MM-DD)
 * @param endDate 结束日期 (YYYY-MM-DD)
 * @param holidays 节假日数据
 * @returns 工作日列表
 */
async function getWorkDaysInRange(startDate: string, endDate: string, holidays: Holiday[]): Promise<string[]> {
  // 创建节假日映射
  const holidayMap = new Map<string, Holiday>();
  holidays.forEach(holiday => {
    holidayMap.set(holiday.date, holiday);
  });
  
  const workDays: string[] = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  // 逐日检查直到结束日期
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const holiday = holidayMap.get(dateStr);
    
    // 获取星期几 (0-6, 0表示周日)
    const dayOfWeek = currentDate.getDay();
    
    // 判断是否为工作日的逻辑:
    // 1. 如果是节假日且标记为休息日，则不是工作日
    if (holiday && holiday.isOffDay) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // 2. 如果是周末(周六或周日)且不是调休工作日，则不是工作日
    if ((dayOfWeek === 0 || dayOfWeek === 6) && !holiday) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // 3. 其他情况都是工作日
    workDays.push(dateStr);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workDays;
}

export default {
  generateAdvancedSchedule
};