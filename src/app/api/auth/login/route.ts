import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createAccessToken, createRefreshToken } from '@/lib/auth';

// post request for the Login
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true }
    });

    // Authenticating the user
    if (!user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Verifying the password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Creating the Access Token and Refresh Token
    const accessToken = await createAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);

    const response = NextResponse.json({
      message: "Login successful",
      accessToken,
      refreshToken
    }, { status: 200 });

    // We are creating the refresh token here so that evne if the access token is expired the user can still access the application.

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
