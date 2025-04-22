import { NextResponse } from 'next/server';
import { container } from '../../../lib/cosmosClient';
import { v4 as uuidv4 } from 'uuid';

interface ScoreItem {
    id: string;
    pseudo: string;
    score: number;
    createdAt: string;
}

// GET all scores
export async function GET() {
    try {
        const { resources: scores } = await container.items.query('SELECT * FROM c ORDER BY c.score DESC').fetchAll();
        return NextResponse.json(scores);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
    }
}

// POST a new score
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.pseudo) {
            return NextResponse.json({ error: 'Pseudo is required' }, { status: 400 });
        }

        if (typeof body.score !== 'number') {
            return NextResponse.json({ error: 'Valid score is required' }, { status: 400 });
        }

        const newScore: ScoreItem = {
            id: uuidv4(),
            pseudo: body.pseudo,
            score: body.score,
            createdAt: new Date().toISOString()
        };

        const { resource: createdScore } = await container.items.create(newScore);
        return NextResponse.json(createdScore, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create score' }, { status: 500 });
    }
}