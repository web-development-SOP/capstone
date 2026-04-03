import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LoansProvider } from './context/LoansContext';
import { BookCacheProvider } from './context/BookCacheContext';
import AppLayout from './layouts/AppLayout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import BookDetail from './pages/BookDetail/BookDetail';
import Loans from './pages/Loans/Loans';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoansProvider>
          <BookCacheProvider>
            <BrowserRouter>
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
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </BookCacheProvider>
        </LoansProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
