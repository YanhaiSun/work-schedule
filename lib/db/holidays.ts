import fs from 'fs';
import path from 'path';
import { Holiday, HolidayFile } from '@/types';

const HOLIDAYS_DIR = path.join(process.cwd(), 'holidays');

export async function getHolidaysForYear(year: number): Promise<Holiday[]> {
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
    console.error(`Error reading holidays for year ${year}:`, error);
    return [];
  }
}

export async function getHolidayMap(year: number): Promise<Map<string, Holiday>> {
  const holidays = await getHolidaysForYear(year);
  const map = new Map<string, Holiday>();
  holidays.forEach(h => map.set(h.date, h));
  return map;
}
