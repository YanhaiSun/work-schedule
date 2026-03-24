import fs from 'fs';
import path from 'path';
import { ScheduleConfig } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'scheduleConfig.json');

const defaultConfig: ScheduleConfig = {
  employeeOrder: []
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function getScheduleConfig(): Promise<ScheduleConfig> {
  try {
    ensureDataDir();
    if (!fs.existsSync(CONFIG_FILE)) {
      return defaultConfig;
    }
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return { ...defaultConfig, ...JSON.parse(data) };
  } catch (error) {
    console.error('Error reading schedule config:', error);
    return defaultConfig;
  }
}

export async function updateScheduleConfig(config: ScheduleConfig): Promise<ScheduleConfig> {
  ensureDataDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  return config;
}
