import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LoansProvider } from './context/LoansContext';
import { BookCacheProvider } from './context/BookCacheContext';
import { WishlistProvider } from './context/WishlistContext';
import AppLayout from './layouts/AppLayout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Spinner from './components/Spinner/Spinner';

const Home = lazy(() => import('./pages/Home/Home'));
const Catalog = lazy(() => import('./pages/Catalog/Catalog'));
const BookDetail = lazy(() => import('./pages/BookDetail/BookDetail'));
const Loans = lazy(() => import('./pages/Loans/Loans'));
const Wishlist = lazy(() => import('./pages/Wishlist/Wishlist'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoansProvider>
          <WishlistProvider>
            <BookCacheProvider>
              <BrowserRouter>
                <Suspense fallback={<Spinner />}>
                  <Routes>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/book/:id" element={<BookDetail />} />
                      <Route
                        path="/loans"
                        element={
                          <ProtectedRoute>
                            <Loans />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </BookCacheProvider>
          </WishlistProvider>
        </LoansProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
