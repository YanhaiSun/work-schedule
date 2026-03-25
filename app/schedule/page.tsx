'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PrintCalendar } from '@/components/calendar/PrintCalendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ExportDialog } from '@/components/export';
import { ScheduleEntry } from '@/types';
import { exportScheduleToExcel } from '@/lib/exporters/excel';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    fetchSchedule();
  }, [currentDate]);

  const fetchSchedule = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const response = await fetch(`/api/schedule?year=${year}&month=${month}`);
      const data = await response.json();
      setSchedule(data.schedule || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    exportScheduleToExcel(schedule, year, month);
  }, [schedule, currentDate]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setLoading(true);
    setDirection(direction === 'prev' ? -1 : 1);
    if (direction === 'prev') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handlePrevMonth = () => handleMonthChange('prev');
  const handleNextMonth = () => handleMonthChange('next');

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <motion.h1
            className="text-2xl font-semibold text-gray-800"
            key={currentDate.getMonth()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月 排班表
          </motion.h1>

          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4 print:p-0 print:rounded-none">
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6 hidden print:block">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月 排班表
          </h1>

          <div className="relative overflow-visible">
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.div
                  key="loading"
                  className="flex items-center justify-center h-64 print:hidden"
                >
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
                  initial={{ x: direction * 50 }}
                  animate={{ x: 0 }}
                  exit={{ x: direction * -50 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PrintCalendar
                    year={currentDate.getFullYear()}
                    month={currentDate.getMonth()}
                    schedule={schedule}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center no-print">
          <Link href="/admin">
            <Button variant="ghost">返回管理面板</Button>
          </Link>

          <div className="space-x-2">
            <Button variant="outline" onClick={() => setExportOpen(true)}>导出</Button>
            <Button onClick={handlePrint}>打印</Button>
          </div>
        </div>

        <ExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          onExportExcel={handleExportExcel}
        />
      </div>
    </div>
  );
}
