"use client";

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth
}: CalendarHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4 no-print">
      <Button variant="outline" size="icon" onClick={onPrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <h2 className="text-2xl font-semibold text-gray-800 calendar-title no-print">
        {year}年 {month + 1}月 排班表
      </h2>

      <Button className={"no-print"} variant="outline" size="icon" onClick={onNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
