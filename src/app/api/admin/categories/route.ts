import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const categories = await sql`
      SELECT c.*, p.name as parent_name 
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ORDER BY c.name ASC
    `;
    return NextResponse.json({ categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, parent_id } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await sql`
      INSERT INTO categories (name, slug, parent_id)
      VALUES (${name}, ${slug}, ${parent_id || null})
      RETURNING *
    `;

    return NextResponse.json({ success: true, category: result[0] });
  } catch (error: any) {
    console.error(error);
    if (error.code === '23505') { // unique violation
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, parent_id } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await sql`
      UPDATE categories
      SET name = ${name}, slug = ${slug}, parent_id = ${parent_id || null}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ success: true, category: result[0] });
  } catch (error: any) {
    console.error(error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing Category ID' }, { status: 400 });
    }

    await sql`DELETE FROM categories WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
