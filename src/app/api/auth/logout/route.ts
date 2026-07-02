import { NextResponse } from 'next/server';

// A simple log out post request where the 
// access token is deleted from the cookies
export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0) // Expire immediately
  });
  return response;
}
