import React from 'react';
import EditClient from './EditClient';
import { getArticleByIdOrSlug } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleByIdOrSlug(id, true);

  if (!article) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <EditClient article={article} />
    </div>
  );
}
