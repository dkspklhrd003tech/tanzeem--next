import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await getCurrentUser(req);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();
        const { name, email, role, isActive, password } = data;

        const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (!existingUser.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;

        // Only update password if explicitly provided
        if (password) {
            updateData.password = password;
        }

        await db.update(users).set(updateData).where(eq(users.id, id));

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await getCurrentUser(req);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Prevent deleting the main admin
        if (id === admin.id) {
            return NextResponse.json({ error: 'Cannot delete your own active session' }, { status: 400 });
        }

        const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (!existingUser.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await db.delete(users).where(eq(users.id, id));

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
