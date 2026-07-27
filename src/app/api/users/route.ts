import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { v4 as uuidv4 } from "uuid";
import { eq } from 'drizzle-orm';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allUsers = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            isActive: users.isActive,
            avatar: users.avatar,
            lastLoginAt: users.lastLoginAt,
            createdAt: users.createdAt,
        }).from(users);

        const mappedUsers = allUsers.map(u => {
            let badgeBg = null;
            let badgeText = null;
            if (u.avatar && u.avatar.startsWith("{")) {
                try {
                    const parsed = JSON.parse(u.avatar);
                    badgeBg = parsed.badgeBg || null;
                    badgeText = parsed.badgeText || null;
                } catch (e) {}
            }
            return {
                ...u,
                badgeBg,
                badgeText,
            };
        });

        return NextResponse.json(mappedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = await getCurrentUser(req);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const { name, email, password, role, isActive, badgeBg, badgeText } = data;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
        }

        const id = uuidv4();
        const hashedPassword = await hashPassword(password);
        const avatarData = JSON.stringify({ badgeBg, badgeText });

        const newUser = {
            id,
            name: name || null,
            email,
            password: hashedPassword,
            role: role || 'editor',
            avatar: avatarData,
            isActive: isActive !== undefined ? isActive : true,
        };

        await db.insert(users).values(newUser);

        return NextResponse.json({
            message: 'User Created Successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isActive,
                badgeBg,
                badgeText,
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
