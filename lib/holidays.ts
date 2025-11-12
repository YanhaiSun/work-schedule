import fs from 'fs';
import path from 'path';

interface Holiday {
  name: string;
  date: string;
  isOffDay: boolean;
}

interface HolidayData {
  $schema: string;
  $id: string;
  year: number;
  papers: string[];
  days: Holiday[];
}

/**
 * 获取指定年份的节假日数据
 * @param year 年份
 * @returns 节假日数据
 */
export async function getHolidaysForYear(year: number): Promise<Holiday[]> {
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
    const holidayData: HolidayData = JSON.parse(fileContent);
    
    return holidayData.days;
  } catch (error) {
    console.error(`Error reading holiday data for year ${year}:`, error);
    return [];
  }
}

/**
 * 获取指定日期范围内的工作日
 * @param year 年份
 * @param month 月份 (0-11)
 * @returns 工作日列表
 */
export async function getWorkDays(year: number, month: number): Promise<string[]> {
  // 获取该月的所有日期
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const allDates: string[] = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    allDates.push(dateStr);
  }
  
  // 获取节假日数据
  const holidays = await getHolidaysForYear(year);
  const holidayMap = new Map<string, Holiday>();
  holidays.forEach(holiday => {
    holidayMap.set(holiday.date, holiday);
  });
  
  // 过滤出工作日
  const workDays: string[] = [];
  
  allDates.forEach(date => {
    const holiday = holidayMap.get(date);
    
    // 获取星期几 (0-6, 0表示周日)
    const dayOfWeek = new Date(date).getDay();
    
    // 判断是否为工作日的逻辑:
    // 1. 如果是节假日且标记为休息日，则不是工作日
    if (holiday && holiday.isOffDay) {
      return;
    }
    
    // 2. 如果是周末(周六或周日)且不是调休工作日，则不是工作日
    if ((dayOfWeek === 0 || dayOfWeek === 6) && !holiday) {
      return;
    }
    
    // 3. 其他情况都是工作日
    workDays.push(date);
  });
  
  return workDays;
}

export default {
  getHolidaysForYear,
  getWorkDays
};