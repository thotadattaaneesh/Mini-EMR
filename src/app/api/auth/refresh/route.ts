import { NextResponse, NextRequest } from 'next/server';
import { verifyToken, createAccessToken } from '@/lib/auth';

// This refresh token endpoint is used to generate a new access token using the request token.
export async function GET(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token missing" }, { status: 401 });
    }

    const payload = await verifyToken(refreshToken);

    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    const newAccessToken = await createAccessToken(payload.userId as number);

    const response = NextResponse.json({ accessToken: newAccessToken }, { status: 200 });

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}
