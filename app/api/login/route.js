import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Simple hardcoded users for demonstration
    const users = {
      'admin': 'plant123',
      'friend': 'friend123'
    };

    if (users[username] && users[username] === password) {
      const response = NextResponse.json({ success: true, message: 'Login successful' });
      
      // Set an HTTP-only cookie
      response.cookies.set('auth_token', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
