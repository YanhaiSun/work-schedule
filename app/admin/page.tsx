'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeDragSort } from '@/components/employees';

export default function AdminPage() {
  const [employees, setEmployees] = useState<string[]>([]);
  const [newEmployee, setNewEmployee] = useState('');
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<{ startDate?: string; startEmployee?: string; employeeOrder: string[] }>({ employeeOrder: [] });
  const [startDate, setStartDate] = useState('');
  const [startEmployee, setStartEmployee] = useState('');
  const router = useRouter();

  useEffect(() => {
    const authenticated = localStorage.getItem('authenticated') === 'true';
    const expiresAt = localStorage.getItem('authExpiresAt');
    const isExpired = expiresAt && Date.now() > parseInt(expiresAt);

    if (!authenticated || isExpired) {
      localStorage.removeItem('authenticated');
      localStorage.removeItem('authExpiresAt');
      router.push('/login');
    } else {
      Promise.all([fetchEmployees(), fetchScheduleConfig()]);
    }
  }, [router]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleConfig = async () => {
    try {
      const response = await fetch('/api/schedule/config');
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
        setStartDate(data.config.startDate || '');
        setStartEmployee(data.config.startEmployee || '');
      }
    } catch (error) {
      console.error('Error fetching schedule config:', error);
    }
  };

  const addEmployee = async () => {
    if (newEmployee.trim() !== '') {
      try {
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newEmployee.trim() }),
        });
        const data = await response.json();
        if (data.success) {
          setEmployees(data.employees);
          setNewEmployee('');
        }
      } catch (error) {
        console.error('Error adding employee:', error);
      }
    }
  };

  const removeEmployee = async (name: string) => {
    try {
      const response = await fetch(`/api/employees?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error removing employee:', error);
    }
  };

  const updateEmployeeOrder = async (newOrder: string[]) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: newOrder }),
      });
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error updating employee order:', error);
    }
  };

  const saveScheduleConfig = async () => {
    try {
      const response = await fetch('/api/schedule/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          startDate: startDate || undefined,
          startEmployee: startEmployee || undefined
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('排班设置已保存');
      }
    } catch (error) {
      console.error('Error saving schedule config:', error);
      alert('保存失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('authExpiresAt');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">排班管理系统</h1>
          <Button variant="ghost" onClick={handleLogout}>退出登录</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <Card>
            <CardHeader>
              <CardTitle>员工管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input
                  value={newEmployee}
                  onChange={(e) => setNewEmployee(e.target.value)}
                  placeholder="输入新员工姓名"
                  onKeyPress={(e) => e.key === 'Enter' && addEmployee()}
                />
                <Button onClick={addEmployee}>添加</Button>
              </div>

              {loading ? (
                <p className="text-gray-500 text-center py-4">加载中...</p>
              ) : employees.length > 0 ? (
                <div>
                  <Label className="mb-2 block">员工顺序（拖拽排序）</Label>
                  <EmployeeDragSort
                    employees={employees}
                    onReorder={updateEmployeeOrder}
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">暂无员工数据</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>排班设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="startDate">起始日期</Label>
                  <Input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="startEmployee">起始员工</Label>
                  <select
                    id="startEmployee"
                    value={startEmployee}
                    onChange={(e) => setStartEmployee(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="">选择起始员工</option>
                    {employees.map((employee) => (
                      <option key={employee} value={employee}>{employee}</option>
                    ))}
                  </select>
                </div>

                <Button onClick={saveScheduleConfig}>保存排班设置</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>排班操作</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/schedule">
                  <Button>查看排班表</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
