import { NextResponse } from 'next/server';
import { getHolidaysForYear } from '@/lib/holidays';
import { generateAdvancedSchedule } from '@/lib/scheduler';
import { getEmployees } from '@/lib/employees';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '2024');
    const month = parseInt(searchParams.get('month') || '0'); // 0-based month

    // 获取节假日数据
    const holidays = await getHolidaysForYear(year);
    
    // 生成排班表
    const schedule = await generateAdvancedSchedule(year, month, holidays);
    
    // 获取员工列表
    const employees = await getEmployees();

    return NextResponse.json({
      success: true,
      schedule,
      employees,
      year,
      month
    });
  } catch (error) {
    console.error('Error generating schedule:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate schedule'
    }, { status: 500 });
  }
}