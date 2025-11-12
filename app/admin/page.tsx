'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ScheduleConfig {
  startDate?: string;
  startEmployee?: string;
  employeeOrder: string[];
}

export default function AdminPage() {
  const [employees, setEmployees] = useState<string[]>([]);
  const [newEmployee, setNewEmployee] = useState('');
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ScheduleConfig>({ employeeOrder: [] });
  const [startDate, setStartDate] = useState('');
  const [startEmployee, setStartEmployee] = useState('');
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    // In a real app, you would check authentication status via API
    const authenticated = localStorage.getItem('authenticated') === 'true';
    if (!authenticated) {
      router.push('/login');
    } else {
      // Fetch employees data and schedule config
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
          headers: {
            'Content-Type': 'application/json',
          },
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
      // 更新员工顺序需要通过employees API而不是schedule config
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...config,
          startDate: startDate || undefined,
          startEmployee: startEmployee || undefined
          // 不再传递employeeOrder，因为员工顺序由employees API管理
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
        alert('排班设置已保存');
      }
    } catch (error) {
      console.error('Error saving schedule config:', error);
      alert('保存失败');
    }
  };

  const moveEmployee = (fromIndex: number, toIndex: number) => {
    const newOrder = [...employees];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setEmployees(newOrder);
    // 立即更新员工顺序
    updateEmployeeOrder(newOrder);
  };

  const handleLogout = () => {
    localStorage.removeItem('authenticated');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">排班管理系统</h1>
            <button 
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              退出登录
            </button>
          </div>
          <p className="text-gray-600">管理员面板</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">员工管理</h2>
          
          <div className="flex mb-6">
            <input
              type="text"
              value={newEmployee}
              onChange={(e) => setNewEmployee(e.target.value)}
              placeholder="输入新员工姓名"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addEmployee()}
            />
            <button
              onClick={addEmployee}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md transition duration-200"
            >
              添加
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-4">加载中...</p>
          ) : employees.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">员工顺序（拖拽排序）</h3>
              <ul className="border rounded-md divide-y divide-gray-200">
                {employees.map((employee, index) => (
                  <li 
                    key={index} 
                    className="flex justify-between items-center px-4 py-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <button 
                        className="mr-2 text-gray-400 hover:text-gray-600"
                        onClick={() => moveEmployee(index, Math.max(0, index - 1))}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button 
                        className="mr-4 text-gray-400 hover:text-gray-600"
                        onClick={() => moveEmployee(index, Math.min(employees.length - 1, index + 1))}
                        disabled={index === employees.length - 1}
                      >
                        ↓
                      </button>
                      <span className="text-gray-700">{employee}</span>
                    </div>
                    <button
                      onClick={() => removeEmployee(employee)}
                      className="text-red-500 hover:text-red-700 transition duration-200"
                    >
                      删除
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">暂无员工数据</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">排班设置</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
              起始日期
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startEmployee">
              起始员工
            </label>
            <select
              id="startEmployee"
              value={startEmployee}
              onChange={(e) => setStartEmployee(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">选择起始员工</option>
              {employees.map((employee, index) => (
                <option key={index} value={employee}>{employee}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={saveScheduleConfig}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            保存排班设置
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">排班操作</h2>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/schedule" 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              查看排班表
            </Link>
            {/* <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition duration-200">
              生成排班表
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition duration-200">
              导出排班表
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}