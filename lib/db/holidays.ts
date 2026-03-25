import fs from 'fs';
import path from 'path';
import { Holiday, HolidayFile } from '@/types';

const HOLIDAYS_DIR = path.join(process.cwd(), 'holidays');
const GITHUB_HOLIDAY_URL = 'https://raw.githubusercontent.com/NateScarlet/holiday-cn/master';

export async function getHolidaysForYear(year: number): Promise<Holiday[]> {
  // 先检查本地缓存
  const localHolidays = await loadLocalHolidays(year);
  if (localHolidays.length > 0) {
    console.log(`Using local holidays for ${year} (${localHolidays.length} days)`);
    return localHolidays;
  }

  // 本地没有，尝试从 GitHub 获取
  console.log(`Local holidays not found for ${year}, fetching from GitHub...`);
  return fetchFromGitHub(year);
}

async function fetchFromGitHub(year: number): Promise<Holiday[]> {
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

  // GitHub 也失败了，返回空
  console.warn(`No holidays data available for ${year}`);
  return [];
}

async function saveHolidayToLocal(year: number, data: HolidayFile): Promise<void> {
  try {
    if (!fs.existsSync(HOLIDAYS_DIR)) {
      fs.mkdirSync(HOLIDAYS_DIR, { recursive: true });
    }
    const filePath = path.join(HOLIDAYS_DIR, `${year}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved holidays to local: ${filePath}`);
  } catch (error) {
    console.error(`Failed to save holidays to local for ${year}:`, error);
  }
}

async function loadLocalHolidays(year: number): Promise<Holiday[]> {
  try {
    const filePath = path.join(HOLIDAYS_DIR, `${year}.json`);
    if (!fs.existsSync(filePath)) {
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

export async function getHolidayMap(year: number): Promise<Map<string, Holiday>> {
  const holidays = await getHolidaysForYear(year);
  const map = new Map<string, Holiday>();
  holidays.forEach(h => map.set(h.date, h));
  return map;
}
