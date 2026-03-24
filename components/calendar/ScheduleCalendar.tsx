"use client";

import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { ScheduleEntry } from '@/types';
import { DateCell, getWeekdayLabel } from './DateCell';

interface ScheduleCalendarProps {
  year: number;
  month: number;
  schedule: ScheduleEntry[];
  onDateClick?: (date: string) => void;
}

export function ScheduleCalendar({ year, month, schedule, onDateClick }: ScheduleCalendarProps) {
  const [calendarKey, setCalendarKey] = useState(0);

  useEffect(() => {
    setCalendarKey(prev => prev + 1);
  }, [year, month]);

  const getDateInfo = useCallback((dateStr: string): ScheduleEntry | undefined => {
    return schedule.find(item => item.date === dateStr);
  }, [schedule]);

  const renderDateCell = useCallback((arg: any) => {
    const dateObj = new Date(arg.date.getTime() - arg.date.getTimezoneOffset() * 60000);
    const dateStr = dateObj.toISOString().split('T')[0];
    const entry = getDateInfo(dateStr);

    return (
      <DateCell
        dayNumber={arg.dayNumberText}
        entry={entry}
      />
    );
  }, [getDateInfo]);

  return (
    <FullCalendar
      key={calendarKey}
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      headerToolbar={false}
      dayHeaderContent={(arg) => (
        <span className="text-sm font-medium text-gray-900">
          {getWeekdayLabel(arg.date.getDay())}
        </span>
      )}
      dayCellContent={renderDateCell}
      firstDay={0}
      height="auto"
      initialDate={new Date(year, month, 1)}
      dateClick={(info) => onDateClick?.(info.dateStr)}
    />
  );
}
