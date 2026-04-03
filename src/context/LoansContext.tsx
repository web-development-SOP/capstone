import React, { createContext, useContext, useState } from 'react';
import type { Loan, AvailabilityStatus } from '../types';

type BookRef = { id: string; title: string; author: string; coverId?: number };

interface LoansContextValue {
  loans: Loan[];
  borrowBook: (book: BookRef, userId: string) => void;
  returnBook: (loanId: string) => void;
  getAvailability: (bookId: string) => AvailabilityStatus;
  getActiveLoan: (bookId: string) => Loan | undefined;
}

const LoansContext = createContext<LoansContextValue>({} as LoansContextValue);

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const LoansProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loans, setLoans] = useState<Loan[]>(() => load<Loan>('lib_loans'));

  const updateLoans = (next: Loan[]) => {
    setLoans(next);
    localStorage.setItem('lib_loans', JSON.stringify(next));
  };

  const borrowBook = (book: BookRef, userId: string) => {
    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 14);

    const loan: Loan = {
      id: crypto.randomUUID(),
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCoverId: book.coverId,
      userId,
      borrowedAt: now.toISOString(),
      dueDate: due.toISOString(),
    };
    updateLoans([...loans, loan]);
  };

  const returnBook = (loanId: string) => {
    updateLoans(
      loans.map((l) =>
        l.id === loanId ? { ...l, returnedAt: new Date().toISOString() } : l
      )
    );
  };

  const getAvailability = (bookId: string): AvailabilityStatus => {
    if (loans.find((l) => l.bookId === bookId && !l.returnedAt)) return 'on-loan';
    return 'available';
  };

  const getActiveLoan = (bookId: string) =>
    loans.find((l) => l.bookId === bookId && !l.returnedAt);

  return (
    <LoansContext.Provider value={{ loans, borrowBook, returnBook, getAvailability, getActiveLoan }}>
      {children}
    </LoansContext.Provider>
  );
};

export const useLoans = () => useContext(LoansContext);
