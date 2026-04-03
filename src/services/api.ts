import axios from 'axios';
import type { OLSearchResponse, OLWorkDetails, Book } from '../types';

const OL_BASE = 'https://openlibrary.org';
const COVERS_BASE = 'https://covers.openlibrary.org/b/id';

export const getCoverUrl = (
  coverId: number,
  size: 'S' | 'M' | 'L' = 'M'
): string => `${COVERS_BASE}/${coverId}-${size}.jpg`;

const client = axios.create({ baseURL: OL_BASE });

export async function searchBooks(query: string, limit = 24): Promise<Book[]> {
  const fields = 'key,title,author_name,cover_i,subject,first_publish_year,isbn';
  const { data } = await client.get<OLSearchResponse>('/search.json', {
    params: { q: query, limit, fields },
  });

  return data.docs.map((doc) => ({
    id: doc.key.replace('/works/', ''),
    title: doc.title,
    author: doc.author_name?.[0] ?? 'Unknown Author',
    coverId: doc.cover_i,
    subjects: doc.subject?.slice(0, 6),
    firstPublishYear: doc.first_publish_year,
    isbn: doc.isbn?.[0],
  }));
}

export async function getWorkDetails(id: string): Promise<OLWorkDetails> {
  const { data } = await client.get<OLWorkDetails>(`/works/${id}.json`);
  return data;
}
