import { NextResponse } from 'next/server';
import { container } from '../../../../lib/cosmosClient';

// GET a specific score
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { resource: score } = await container.item(params.id, params.id).read();
        
        if (!score) {
            return NextResponse.json({ error: 'Score not found' }, { status: 404 });
        }
        
        return NextResponse.json(score);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch score' }, { status: 500 });
    }
}

// PUT/UPDATE a score
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        
        const { resource: existingScore } = await container.item(params.id, params.id).read();
        
        if (!existingScore) {
            return NextResponse.json({ error: 'Score not found' }, { status: 404 });
        }
        
        const updatedScore = {
            ...existingScore,
            ...body,
        };
        
        const { resource: result } = await container.item(params.id, params.id).replace(updatedScore);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update score' }, { status: 500 });
    }
}

// DELETE a score
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await container.item(params.id, params.id).delete();
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete score' }, { status: 500 });
    }
}