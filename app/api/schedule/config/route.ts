import { NextResponse } from 'next/server';
import { getScheduleConfig, updateScheduleConfig } from '@/lib/scheduleConfig';
import { getEmployees } from '@/lib/employees';

export async function GET() {
  try {
    const config = await getScheduleConfig();
    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching schedule config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch schedule config'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // 验证数据
    if (data.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid start date format'
      }, { status: 400 });
    }
    
    // 获取所有员工以验证startEmployee
    const employees = await getEmployees();
    if (data.startEmployee && !employees.includes(data.startEmployee)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid start employee'
      }, { status: 400 });
    }
    
    const config = await updateScheduleConfig(data);
    
    return NextResponse.json({
      success: true,
      config,
      message: 'Schedule config updated successfully'
    });
  } catch (error) {
    console.error('Error updating schedule config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update schedule config'
    }, { status: 500 });
  }
}