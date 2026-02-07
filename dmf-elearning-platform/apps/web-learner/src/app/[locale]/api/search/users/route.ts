import { NextRequest, NextResponse } from 'next/server';

// Mock types for user search
type UserProfile = {
  displayName: string;
  bio: string;
  avatarUrl: string;
};

type User = {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  profile: UserProfile | null;
};

// Mock Prisma client - replace with actual onboarding service client
const prisma = {
  user: {
    findMany: async (params: any): Promise<User[]> => [],
    count: async (params: any): Promise<number> => 0,
  },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const role = searchParams.get('role') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const userWhere: any = {
      ...(query && {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          {
            profile: {
              OR: [
                { displayName: { contains: query, mode: 'insensitive' } },
                { bio: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
      ...(role && { role }),
    };

    const users = await prisma.user.findMany({
      where: userWhere,
      take: limit,
      skip: offset,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            displayName: true,
            bio: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUsers = await prisma.user.count({ where: userWhere });

    return NextResponse.json({
      success: true,
      total: totalUsers,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.profile?.displayName || null,
        bio: user.profile?.bio || null,
        avatarUrl: user.profile?.avatarUrl || null,
        createdAt: user.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Users Search API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'User search failed',
      },
      { status: 500 }
    );
  }
}
