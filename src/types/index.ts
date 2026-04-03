// Domain interfaces

export interface Book {
  id: string;
  title: string;
  author: string;
  coverId?: number;
  subjects?: string[];
  firstPublishYear?: number;
  isbn?: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // plaintext, mock auth only
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverId?: number;
  userId: string;
  borrowedAt: string; // ISO date
  dueDate: string;    // ISO date
  returnedAt?: string;
}

export interface WishlistItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverId?: number;
  addedAt: string;
  status: ReadingStatus;
}

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverId?: number;
  userId: string;
  reservedAt: string;
}

// Generic utility type

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

export function paginate<T>(items: T[], page: number, perPage: number): PaginatedResult<T> {
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    page,
    perPage,
  };
}

// Derived types

export type ReadingStatus = 'Reading' | 'Completed' | 'Wishlist';
export type AvailabilityStatus = 'available' | 'on-loan' | 'reserved';
export type SortField = 'title' | 'author' | 'year';

// Open Library API shapes

export interface OLSearchResponse {
  numFound: number;
  docs: OLDoc[];
}

export interface OLDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  subject?: string[];
  first_publish_year?: number;
  isbn?: string[];
}

export interface OLWorkDetails {
  key: string;
  title: string;
  description?: string | { value: string };
  subjects?: string[];
  covers?: number[];
}
