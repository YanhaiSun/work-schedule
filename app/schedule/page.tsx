'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { exportToExcel, exportToPDF } from '@/lib/export';

interface ScheduleEntry {
  date: string;
  employee: string | null;
  dayOfWeek: number;
  isWorkday: boolean;
  isHoliday: boolean;
  isOffDay: boolean;
  holidayName?: string;
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [employees, setEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<{startDate?: string; startEmployee?: string}>({});
  const [calendarKey, setCalendarKey] = useState(0); // 用于强制重新渲染日历

  // 只在组件挂载时获取配置
  useEffect(() => {
    fetchConfig();
  }, []);

  // 当日期范围改变时获取排班数据
  useEffect(() => {
    fetchSchedule();
  }, [currentDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from an API
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Simulate API call
      const response = await fetch(`/api/schedule?year=${year}&month=${month}`);
      const data = await response.json();
      
      setSchedule(data.schedule);
      setEmployees(data.employees);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/schedule/config');
      const data = await response.json();
      if (data.success) {
        setConfig({
          startDate: data.config.startDate,
          startEmployee: data.config.startEmployee
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleExportExcel = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const filename = `${year}年${monthNames[month]}排班表`;
    exportToExcel(schedule, filename);
  };

  const handleExportPDF = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const filename = `${year}年${monthNames[month]}排班表`;
    exportToPDF(schedule, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  // 获取日期标记
  const getDateInfo = (dateStr: string) => {
    const entry = schedule.find(item => item.date === dateStr);
    // 添加调试信息
    console.log('Processing date:', dateStr, 'Entry:', entry);
    
    if (!entry) return { employee: null, badge: null, backgroundColor: '' };

    let badge = null;
    let backgroundColor = '';

    // 如果是节假日且是休息日，显示"休"
    if (entry.isHoliday && entry.isOffDay) {
      badge = '休';
      backgroundColor = '#fee2e2'; // 红色背景
    }
    // 如果是节假日但需要调休上班，显示"班"
    else if (entry.isHoliday && !entry.isOffDay) {
      badge = '班';
      backgroundColor = '#dcfce7'; // 绿色背景
    }
    // 普通工作日和周末
    else {
      backgroundColor = ''; // 不设置背景色，保留默认样式
    }

    return { 
      employee: entry.employee, 
      badge, 
      backgroundColor,
      holidayName: entry.holidayName
    };
  };

  // 自定义渲染日历中的日期单元格
  const renderDateCell = (arg: any) => {
    // 修复时区问题，确保获取正确的日期字符串
    const dateObj = new Date(arg.date.getTime() - arg.date.getTimezoneOffset() * 60000);
    const dateStr = dateObj.toISOString().split('T')[0];
    const { employee, badge, backgroundColor, holidayName } = getDateInfo(dateStr);
    
    // 添加调试信息
    console.log('Rendering cell:', dateStr, 'Day of week:', new Date(dateStr).getDay(), 'Badge:', badge);
    
    return (
      <div className="p-1 h-full" style={{ backgroundColor }}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium fixed-text-gray-900">{arg.dayNumberText.replace('日', '')}</span>
          
          {badge && (
            <span className={`text-sm px-1 py-0.5 rounded ${
              badge === '休' ? 'bg-red-100 fixed-text-red-800' : 'bg-green-100 fixed-text-green-800'
            }`}>
              {badge}
            </span>
          )}
          
        </div>
        {holidayName && badge !== '班' && (
          <div className="mt-1 text-sm fixed-text-red-800" >
            {holidayName}
          </div>
        )}
        {employee && (
          <div className="mt-1 font-medium truncate employee-name">
            {employee}
          </div>
        )}
        
      </div>
    );
  };

  // 处理手动月份切换
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    setCalendarKey(prev => prev + 1); // 强制重新渲染日历
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    setCalendarKey(prev => prev + 1); // 强制重新渲染日历
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }

          
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            transform: scale(0.9);
            transform-origin: center;
          }
          
          .no-print {
            display: none !important;
          }
          
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          
          div[style*="background"] {
            background-color: transparent !important;
          }
          
          /* 打印时移除今天的背景，使用默认边框样式 */
          :global(.fc-day-today) {
            background-color: transparent !important;
            border: inherit !important;
          }
          
          /* 打印时使用最大的字体 */
          .employee-name {
            font-size: 1.5rem !important;
            color: #111827 !important;
          }
          
          .fixed-text-gray-900,
          .fixed-text-gray-800,
          .fixed-text-gray-600,
          .fixed-text-gray-500,
          .fixed-text-red-800,
          .fixed-text-green-800 {
            color: #111827 !important;
          }
        }
        
        /* 员工姓名在不同屏幕尺寸下的字体大小 */
        .employee-name {
          font-size: 1.125rem; /* 默认大小 (lg) */
          color: #111827; /* 固定深色，避免深色模式变化 */
        }
        
        /* 在小屏幕设备上减小字体 */
        @media (max-width: 768px) {
          .employee-name {
            font-size: 1rem; /* md */
          }
        }
        
        @media (max-width: 480px) {
          .employee-name {
            font-size: 0.875rem; /* sm */
          }
        }
        
        /* 在大屏幕设备上适当增大字体 */
        @media (min-width: 1280px) {
          .employee-name {
            font-size: 1.25rem; /* xl */
          }
        }
        
        @media (min-width: 1536px) {
          .employee-name {
            font-size: 1.5rem; /* 2xl */
          }
        }
        
        /* 固定其他文本颜色，避免深色模式变化 */
        .fixed-text-gray-900 {
          color: #111827 !important;
        }
        
        .fixed-text-gray-800 {
          color: #1f2937 !important;
        }
        
        .fixed-text-gray-600 {
          color: #4b5563 !important;
        }
        
        .fixed-text-gray-500 {
          color: #6b7280 !important;
        }
        
        .fixed-text-red-800 {
          color: #991b1b !important;
        }
        
        .fixed-text-green-800 {
          color: #166534 !important;
        }
      `}</style>
      <div className="max-w-6xl mx-auto print-container">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold fixed-text-gray-900 mb-2 no-print">排班表</h1>
          <div className="flex justify-center items-center space-x-4 mb-2">
            <button 
              onClick={handlePrevMonth}
              className="fixed-text-gray-600 hover:fixed-text-gray-900 no-print"
            >
              &larr;
            </button>
            <h2 className="text-2xl font-semibold fixed-text-gray-800">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </h2>
            <button 
              onClick={handleNextMonth}
              className="fixed-text-gray-600 hover:fixed-text-gray-900 no-print"
            >
              &rarr;
            </button>
          </div>
          {/* {(config.startDate || config.startEmployee) && (
            <div className="text-sm fixed-text-gray-600 no-print">
              {config.startDate && <span>起始日期: {config.startDate} </span>}
              {config.startEmployee && <span>起始员工: {config.startEmployee}</span>}
            </div>
          )} */}
        </div>

        <div className="bg-white shadow-md print:shadow-none print:border print:border-gray-300">
          {loading ? (
            <div className="p-8 text-center fixed-text-gray-500">
              加载中...
            </div>
          ) : (
            <FullCalendar
              key={calendarKey} // 使用key强制重新渲染
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: '',
                center: '',
                right: ''
              }}
              buttonText={{
                today: '今天',
                month: '月',
                week: '周',
                day: '日',
                list: '列表'
              }}
              dayHeaderContent={(arg) => {
                const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                return <span className="fixed-text-gray-900">{weekdays[arg.date.getDay()]}</span>;
              }}
              weekends={true}
              events={[]} // 我们通过 dayCellContent 自定义渲染，不需要事件
              dayCellContent={renderDateCell}
              firstDay={0} // 从周日开始，确保正确对齐
              height="auto"
              initialDate={currentDate} // 设置初始日期
            />
          )}
        </div>

        <div className="mt-6 flex justify-between no-print">
          <Link 
            href="/admin" 
            className="text-blue-500 hover:text-blue-700"
          >
            返回管理面板
          </Link>
          <div className="space-x-2">
            {/* <button 
              onClick={handleExportExcel}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              导出 Excel
            </button>
            <button 
              onClick={handleExportPDF}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              导出 PDF
            </button> */}
            <button 
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              打印
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}