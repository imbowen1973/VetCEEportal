import { createClient } from 'contentful';

// Initialize Contentful client
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
});

// Get page content by slug
export async function getPageBySlug(slug: string) {
  const entries = await client.getEntries({
    content_type: 'page',
    'fields.slug': slug,
    include: 2,
  });

  if (entries.items.length === 0) {
    return null;
  }

  return entries.items[0];
}

// Get home page content
export async function getHomePage() {
  const entries = await client.getEntries({
    content_type: 'page',
    'fields.slug': 'home',
    include: 2,
  });

  if (entries.items.length === 0) {
    return null;
  }

  return entries.items[0];
}

// Get all pages
export async function getAllPages() {
  const entries = await client.getEntries({
    content_type: 'page',
    include: 1,
  });

  return entries.items;
}
