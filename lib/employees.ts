import fs from 'fs';
import path from 'path';

// 确保数据目录存在
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const employeesFilePath = path.join(dataDir, 'employees.json');

/**
 * 获取所有员工
 * @returns 员工列表
 */
export async function getEmployees(): Promise<string[]> {
  try {
    if (!fs.existsSync(employeesFilePath)) {
      return [];
    }
    
    const data = fs.readFileSync(employeesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading employees file:', error);
    return [];
  }
}

/**
 * 添加员工
 * @param name 员工姓名
 * @returns 更新后的员工列表
 */
export async function addEmployee(name: string): Promise<string[]> {
  try {
    const employees = await getEmployees();
    
    // 检查是否已存在同名员工
    if (employees.includes(name)) {
      return employees;
    }
    
    // 添加新员工
    const updatedEmployees = [...employees, name];
    
    // 保存到文件
    fs.writeFileSync(employeesFilePath, JSON.stringify(updatedEmployees, null, 2));
    
    return updatedEmployees;
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
}

/**
 * 删除员工
 * @param name 员工姓名
 * @returns 更新后的员工列表
 */
export async function removeEmployee(name: string): Promise<string[]> {
  try {
    const employees = await getEmployees();
    
    // 过滤掉要删除的员工
    const updatedEmployees = employees.filter(employee => employee !== name);
    
    // 保存到文件
    fs.writeFileSync(employeesFilePath, JSON.stringify(updatedEmployees, null, 2));
    
    return updatedEmployees;
  } catch (error) {
    console.error('Error removing employee:', error);
    throw error;
  }
}

/**
 * 更新员工列表
 * @param employees 新的员工列表
 * @returns 更新后的员工列表
 */
export async function updateEmployees(employees: string[]): Promise<string[]> {
  try {
    // 去重
    const uniqueEmployees = [...new Set(employees)];
    
    // 保存到文件
    fs.writeFileSync(employeesFilePath, JSON.stringify(uniqueEmployees, null, 2));
    
    return uniqueEmployees;
  } catch (error) {
    console.error('Error updating employees:', error);
    throw error;
  }
}

export default {
  getEmployees,
  addEmployee,
  removeEmployee,
  updateEmployees
};