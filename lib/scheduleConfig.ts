import fs from 'fs';
import path from 'path';

// 确保数据目录存在
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const configFilePath = path.join(dataDir, 'scheduleConfig.json');

export interface ScheduleConfig {
  startDate?: string; // YYYY-MM-DD
  startEmployee?: string;
  employeeOrder: string[];
}

const defaultConfig: ScheduleConfig = {
  employeeOrder: []
};

/**
 * 获取排班配置
 * @returns 排班配置
 */
export async function getScheduleConfig(): Promise<ScheduleConfig> {
  try {
    if (!fs.existsSync(configFilePath)) {
      return defaultConfig;
    }
    
    const data = fs.readFileSync(configFilePath, 'utf8');
    return { ...defaultConfig, ...JSON.parse(data) };
  } catch (error) {
    console.error('Error reading schedule config file:', error);
    return defaultConfig;
  }
}

/**
 * 更新排班配置
 * @param config 新的排班配置
 * @returns 更新后的排班配置
 */
export async function updateScheduleConfig(config: ScheduleConfig): Promise<ScheduleConfig> {
  try {
    // 保存到文件
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    return config;
  } catch (error) {
    console.error('Error updating schedule config:', error);
    throw error;
  }
}

export default {
  getScheduleConfig,
  updateScheduleConfig
};