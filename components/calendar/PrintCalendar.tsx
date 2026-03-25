"use client";

import { ScheduleEntry } from '@/types';

interface PrintCalendarProps {
  year: number;
  month: number;
  schedule: ScheduleEntry[];
}

const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function PrintCalendar({ year, month, schedule }: PrintCalendarProps) {
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const calendar: (number | null)[][] = [];
  let week: (number | null)[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    week.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    calendar.push(week);
  }

  const getScheduleForDay = (day: number): ScheduleEntry | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return schedule.find(s => s.date === dateStr);
  };

  const isToday = (day: number): boolean => {
    return isCurrentMonth && today.getDate() === day;
  };

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {weekdays.map(day => (
            <th
              key={day}
              className="border border-gray-300 bg-gray-100 px-2 py-2 text-center font-medium text-gray-700 align-middle"
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {calendar.map((week, weekIndex) => (
          <tr key={weekIndex} className="calendar-row">
            {week.map((day, dayIndex) => {
              const entry = day ? getScheduleForDay(day) : undefined;
              const hasEmployee = !!entry?.employee;
              const hasHolidayName = entry?.holidayName && entry.isOffDay;
              const todayHighlight = day && isToday(day);

              return (
                <td
                  key={dayIndex}
                  className={`border border-gray-300 p-1 h-28 relative ${todayHighlight ? 'bg-blue-50 print:bg-transparent' : ''}`}
                >
                  {day && (
                    <>
                      {/* 顶部角标：日期 + 休/班（左右分布） */}
                      <div className="absolute top-1 left-1 right-1 flex justify-between items-center z-10">
                        <span className={`font-bold text-xs ${todayHighlight ? 'text-blue-600 print:text-gray-700' : 'text-gray-800'}`}>
                          {day}
                        </span>
                        {entry?.holidayName && (
                          <span
                            className={`px-1 py-0.5 rounded text-xs font-medium ${
                              entry.isOffDay
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {entry.isOffDay ? '休' : '班'}
                          </span>
                        )}
                      </div>

                      {/* 居中内容：节假日名称 或 员工姓名 */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                        {hasHolidayName ? (
                          <div className="px-1 py-0.5">
                            <span className="text-red-800 text-xs font-medium print:text-red-900">
                              {entry.holidayName}
                            </span>
                          </div>
                        ) : hasEmployee ? (
                          <span className="text-gray-900 font-medium text-sm print:text-gray-800">
                            {entry.employee}
                          </span>
                        ) : null}
                      </div>
                    </>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
