import { Holiday, HolidayFile } from '@/types';
import fs from 'fs';
import path from 'path';

const HOLIDAYS_DIR = path.join(process.cwd(), 'holidays');
const GITHUB_HOLIDAY_URL = 'https://raw.githubusercontent.com/NateScarlet/holiday-cn/master';

export async function loadHolidaysForYear(year: number): Promise<Holiday[]> {
  // 先尝试从 GitHub 获取
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `${GITHUB_HOLIDAY_URL}/${year}.json`;
    console.log(`Fetching holidays from GitHub: ${url}`);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`GitHub response status: ${response.status}`);

    if (response.ok) {
      const data: HolidayFile = await response.json();
      console.log(`GitHub data received, days count: ${data.days?.length || 0}`);
      // 保存到本地作为缓存
      await saveHolidayToLocal(year, data);
      return data.days || [];
    } else {
      console.log(`GitHub response not ok: ${response.status}`);
    }
  } catch (error: any) {
    console.log(`Failed to fetch holidays from GitHub for ${year}:`, error?.message || error);
  }

  // 回退到本地文件
  console.log(`Falling back to local holidays for ${year}`);
  return loadLocalHolidays(year);
}

async function saveHolidayToLocal(year: number, data: HolidayFile): Promise<void> {
  try {
    if (!fs.existsSync(HOLIDAYS_DIR)) {
      fs.mkdirSync(HOLIDAYS_DIR, { recursive: true });
    }
    const filePath = path.join(HOLIDAYS_DIR, `${year}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Failed to save holidays to local for ${year}:`, error);
  }
}

async function loadLocalHolidays(year: number): Promise<Holiday[]> {
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
