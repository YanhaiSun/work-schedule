import { NextResponse } from 'next/server';
import { getEmployees, addEmployee, removeEmployee, updateEmployees } from '@/lib/employees';

export async function GET() {
  try {
    const employees = await getEmployees();
    return NextResponse.json({
      success: true,
      employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch employees'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid employee name'
      }, { status: 400 });
    }
    
    const employees = await addEmployee(name.trim());
    
    return NextResponse.json({
      success: true,
      employees,
      message: 'Employee added successfully'
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add employee'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { employees } = await request.json();
    
    if (!Array.isArray(employees)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid employees data'
      }, { status: 400 });
    }
    
    // 验证所有员工都是字符串
    if (!employees.every(emp => typeof emp === 'string')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid employee data'
      }, { status: 400 });
    }
    
    const updatedEmployees = await updateEmployees(employees);
    
    return NextResponse.json({
      success: true,
      employees: updatedEmployees,
      message: 'Employees updated successfully'
    });
  } catch (error) {
    console.error('Error updating employees:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update employees'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Employee name is required'
      }, { status: 400 });
    }
    
    const employees = await removeEmployee(name);
    
    return NextResponse.json({
      success: true,
      employees,
      message: 'Employee removed successfully'
    });
  } catch (error) {
    console.error('Error removing employee:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove employee'
    }, { status: 500 });
  }
}