import React from 'react';
import { getRssItems } from '@/lib/db';
import ArticlesClientTable from '@/components/admin/ArticlesClientTable';

export const revalidate = 0; // always fetch fresh on articles page

export default async function ArticlesPage() {
  const articles = await getRssItems(10000); // Fetch all news from the backend for the admin table

  return <ArticlesClientTable initialArticles={articles} />;
}
