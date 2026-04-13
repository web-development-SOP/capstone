import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login/Login';

// CSS modules se reemplazan con objetos vacios
vi.mock('../pages/Login/Login.module.scss', () => ({ default: {} }));

// Se simula AuthContext para inyectar un login controlado
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';
const mockUseAuth = vi.mocked(useAuth);

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Login page', () => {
  let loginMock: any;

  beforeEach(() => {
    loginMock = vi.fn();
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      login: loginMock,
      register: vi.fn(),
      logout: vi.fn(),
    } as any);
  });

  it('renders email, password fields and a submit button', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty fields', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('shows an error for an invalid email format', async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'notanemail');
    await userEvent.type(screen.getByLabelText(/password/i), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('calls login() with the correct credentials on a valid submit', async () => {
    loginMock.mockResolvedValue(undefined);
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'alice@uni.edu');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith('alice@uni.edu', 'secret123')
    );
  });

  it('navigates to home after a successful login', async () => {
    loginMock.mockResolvedValue(undefined);
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'alice@uni.edu');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });

  it('shows a global error message when credentials are invalid', async () => {
    loginMock.mockRejectedValue(new Error('auth/wrong-password'));
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'alice@uni.edu');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText('Invalid email or password.')
    ).toBeInTheDocument();
  });
});
