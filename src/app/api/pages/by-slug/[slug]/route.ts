import { NextResponse } from 'next/server';
import { GET as catchAllGET } from '../[...slug]/route';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        // Forward as string array to match catchAllGET expected signature
        return catchAllGET(request, { params: Promise.resolve({ slug: [slug] }) });
    } catch (error) {
        console.error("Error delegating single slug GET:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
