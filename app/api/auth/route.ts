import { NextResponse } from 'next/server';

// 简单的管理员认证 API
// 在实际应用中，应该使用更安全的认证方式，如 JWT 或 NextAuth.js

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password'; // 在实际应用中应加密存储

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 验证管理员凭据
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // 在实际应用中，这里应该生成并返回一个安全的认证令牌
      return NextResponse.json({ 
        success: true, 
        message: '登录成功',
        user: { username, role: 'admin' }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '用户名或密码错误' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: '登录过程中发生错误' 
    }, { status: 500 });
  }
}

export async function GET() {
  // 检查认证状态的端点
  // 在实际应用中，应检查请求中的认证令牌
  return NextResponse.json({ 
    authenticated: false,
    message: '请提供认证信息'
  });
}