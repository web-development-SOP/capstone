import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookCard from '../components/BookCard/BookCard';
import type { Book } from '../types';

// Mock CSS modules
vi.mock('../components/BookCard/BookCard.module.scss', () => ({ default: {} }));

// Mock contexts used inside BookCard
vi.mock('../context/LoansContext', () => ({
  useLoans: () => ({ getAvailability: () => 'available' }),
}));

vi.mock('../services/api', () => ({
  getCoverUrl: (coverId: number, size: string) =>
    `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`,
}));

const mockBook: Book = {
  id: 'OL123W',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  firstPublishYear: 1925,
};

const mockBookWithCover: Book = {
  ...mockBook,
  coverId: 456,
};

function renderCard(book: Book) {
  return render(
    <MemoryRouter>
      <BookCard book={book} />
    </MemoryRouter>
  );
}

describe('BookCard', () => {
  it('renders the book title and author', () => {
    renderCard(mockBook);
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('F. Scott Fitzgerald')).toBeInTheDocument();
  });

  it('renders the publish year when provided', () => {
    renderCard(mockBook);
    expect(screen.getByText('1925')).toBeInTheDocument();
  });

  it('shows "Available" badge when the book is available', () => {
    renderCard(mockBook);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders a cover image when coverId is present', () => {
    renderCard(mockBookWithCover);
    const img = screen.getByRole('img', { name: 'The Great Gatsby' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('456'));
  });

  it('renders a placeholder letter when there is no cover', () => {
    renderCard(mockBook);
    expect(screen.getByText('T')).toBeInTheDocument(); // first letter of title
  });

  it('contains a "View Details" link pointing to the correct route', () => {
    renderCard(mockBook);
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', '/book/OL123W');
  });
});
