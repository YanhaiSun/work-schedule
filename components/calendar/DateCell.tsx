import { ScheduleEntry } from '@/types';
import { Badge } from '@/components/ui/badge';

interface DateCellProps {
  dayNumber: string;
  entry?: ScheduleEntry;
}

const cnWeekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function DateCell({ dayNumber, entry }: DateCellProps) {
  const badgeVariant = entry?.holidayName && entry.isOffDay
    ? 'success' as const
    : entry?.holidayName && !entry.isOffDay
      ? 'warning' as const
      : undefined;

  return (
    <div className="p-1 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-900">
          {dayNumber.replace('日', '')}
        </span>

        {entry?.holidayName && (
          <Badge variant={badgeVariant} className="badge-name">
            {entry.isOffDay ? '休' : '班'}
          </Badge>
        )}
      </div>

      {entry?.holidayName && entry.isOffDay && (
        <div className="mt-1 text-sm text-red-800 holiday-name">
          {entry.holidayName}
        </div>
      )}

      {entry?.employee && (
        <div className="mt-1 text-lg truncate text-gray-900 employee-name">
          {entry.employee}
        </div>
      )}

      {!entry?.employee && !entry?.holidayName && (
        <div className="mt-1 text-lg text-gray-400 employee-name">
          —
        </div>
      )}
    </div>
  );
}

export function getWeekdayLabel(dayOfWeek: number): string {
  return cnWeekdays[dayOfWeek] || '';
}
