'use server';

import { sql } from '@/lib/db';

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const rows = await sql`
      SELECT id, name, slug, parent_id 
      FROM categories 
      ORDER BY parent_id NULLS FIRST, name ASC
    `;
    return rows as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function addCategory(name: string): Promise<Category | null> {
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if it exists
    const existing = await sql`SELECT id, name, slug, parent_id FROM categories WHERE slug = ${slug} LIMIT 1`;
    if (existing && existing.length > 0) {
      return existing[0] as Category;
    }

    // Insert new parent category
    const result = await sql`
      INSERT INTO categories (name, slug, parent_id)
      VALUES (${name}, ${slug}, NULL)
      RETURNING id, name, slug, parent_id
    `;
    
    return result[0] as Category;
  } catch (error) {
    console.error('Error adding category:', error);
    return null;
  }
}
