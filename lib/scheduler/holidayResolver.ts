import { Holiday, HolidayFile } from '@/types';
import fs from 'fs';
import path from 'path';

const HOLIDAYS_DIR = path.join(process.cwd(), 'holidays');

export async function loadHolidaysForYear(year: number): Promise<Holiday[]> {
  try {
    const filePath = path.join(HOLIDAYS_DIR, `${year}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`Holiday file for year ${year} not found`);
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const data: HolidayFile = JSON.parse(content);
    return data.days || [];
  } catch (error) {
    console.error(`Error loading holidays for year ${year}:`, error);
    return [];
  }
}

export async function loadHolidaysForRange(startDate: string, endDate: string): Promise<Holiday[]> {
  const startYear = new Date(startDate).getFullYear();
  const endYear = new Date(endDate).getFullYear();
  const holidays: Holiday[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const yearHolidays = await loadHolidaysForYear(year);
    holidays.push(...yearHolidays);
  }

  return holidays;
}

export function isWorkday(date: Date, holidayMap: Map<string, Holiday>): boolean {
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = date.getDay();
  const holiday = holidayMap.get(dateStr);

  if (holiday?.isOffDay) return false;
  if ((dayOfWeek === 0 || dayOfWeek === 6) && !holiday) return false;

  return true;
}
