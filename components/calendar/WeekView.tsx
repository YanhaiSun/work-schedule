"use client";

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ScheduleEntry } from '@/types';

interface WeekViewProps {
  year: number;
  month: number;
  schedule: ScheduleEntry[];
  onDateClick?: (date: string) => void;
}

export function WeekView({ year, month, schedule, onDateClick }: WeekViewProps) {
  const [calendarKey, setCalendarKey] = useState(0);

  useEffect(() => {
    setCalendarKey(prev => prev + 1);
  }, [year, month]);

  const getDateInfo = (dateStr: string): ScheduleEntry | undefined => {
    return schedule.find(item => item.date === dateStr);
  };

  return (
    <FullCalendar
      key={calendarKey}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
      }}
      locale="zh-cn"
      firstDay={0}
      initialDate={new Date(year, month, 1)}
      weekends={true}
      events={[]}
      dateClick={(info) => onDateClick?.(info.dateStr)}
      dayCellContent={(arg) => {
        const dateStr = arg.date.toISOString().split('T')[0];
        const entry = getDateInfo(dateStr);
        return (
          <div className="p-1 h-full">
            <span className="text-sm font-medium">{arg.dayNumberText}</span>
            {entry?.employee && (
              <div className="text-xs truncate mt-1">{entry.employee}</div>
            )}
          </div>
        );
      }}
    />
  );
}
