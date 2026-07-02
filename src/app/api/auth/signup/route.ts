import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createAccessToken, createRefreshToken } from '@/lib/auth';

// this sign up endpoint is to create a new user which prompts the email name and also password
//  and then sets the access token and refresh token in the cookies.
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    const accessToken = await createAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);

    const response = NextResponse.json({ message: "Registration successful" }, { status: 201 });

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/signup] Error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
