import fs from 'fs';
import path from 'path';
import { Employee } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function getEmployees(): Promise<string[]> {
  try {
    ensureDataDir();
    if (!fs.existsSync(EMPLOYEES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(EMPLOYEES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading employees:', error);
    return [];
  }
}

export async function addEmployee(name: string): Promise<string[]> {
  const employees = await getEmployees();
  if (employees.includes(name)) {
    return employees;
  }
  const updated = [...employees, name];
  ensureDataDir();
  fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(updated, null, 2));
  return updated;
}

export async function removeEmployee(name: string): Promise<string[]> {
  const employees = await getEmployees();
  const updated = employees.filter(e => e !== name);
  fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(updated, null, 2));
  return updated;
}

export async function updateEmployees(employees: string[]): Promise<string[]> {
  const unique = [...new Set(employees)];
  ensureDataDir();
  fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(unique, null, 2));
  return unique;
}
