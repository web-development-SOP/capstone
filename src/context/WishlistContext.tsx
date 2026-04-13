import React, { createContext, useContext, useState } from 'react';
import type { WishlistItem, ReadingStatus } from '../types';

type BookRef = { id: string; title: string; author: string; coverId?: number };

interface WishlistContextValue {
  items: WishlistItem[];
  addToWishlist: (book: BookRef, status?: ReadingStatus) => void;
  removeFromWishlist: (bookId: string) => void;
  updateStatus: (bookId: string, status: ReadingStatus) => void;
  getItem: (bookId: string) => WishlistItem | undefined;
  isInWishlist: (bookId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue>({} as WishlistContextValue);

const STORAGE_KEY = 'lib_wishlist';

function load(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(load);

  const save = (next: WishlistItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addToWishlist = (book: BookRef, status: ReadingStatus = 'Wishlist') => {
    if (items.find((i) => i.bookId === book.id)) return;
    const item: WishlistItem = {
      id: crypto.randomUUID(),
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCoverId: book.coverId,
      addedAt: new Date().toISOString(),
      status,
    };
    save([...items, item]);
  };

  const removeFromWishlist = (bookId: string) => {
    save(items.filter((i) => i.bookId !== bookId));
  };

  const updateStatus = (bookId: string, status: ReadingStatus) => {
    save(items.map((i) => (i.bookId === bookId ? { ...i, status } : i)));
  };

  const getItem = (bookId: string) => items.find((i) => i.bookId === bookId);

  const isInWishlist = (bookId: string) => !!items.find((i) => i.bookId === bookId);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, updateStatus, getItem, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
