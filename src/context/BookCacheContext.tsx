import React, { createContext, useContext, useRef } from 'react';
import type { Book } from '../types';

interface BookCacheContextValue {
  getBook: (id: string) => Book | undefined;
  cacheBooks: (books: Book[]) => void;
}

const BookCacheContext = createContext<BookCacheContextValue>(
  {} as BookCacheContextValue
);

export const BookCacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cache = useRef<Map<string, Book>>(new Map());

  const cacheBooks = (books: Book[]) => {
    books.forEach((b) => cache.current.set(b.id, b));
  };

  const getBook = (id: string) => cache.current.get(id);

  return (
    <BookCacheContext.Provider value={{ getBook, cacheBooks }}>
      {children}
    </BookCacheContext.Provider>
  );
};

export const useBookCache = () => useContext(BookCacheContext);
