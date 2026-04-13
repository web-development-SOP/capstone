import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Se simula firebase/auth para que los tests no hagan llamadas a la red
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockUpdateProfile = vi.fn();

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  signInWithEmailAndPassword: (...args: unknown[]) =>
    mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) =>
    mockCreateUserWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}));

// Se simula el modulo de firebase para no necesitar variables de entorno
vi.mock('../services/firebase', () => ({
  auth: {},
}));

// Usuario falso de Firebase para usar en los tests
function makeFbUser(overrides = {}) {
  return {
    uid: 'uid-123',
    email: 'alice@uni.edu',
    displayName: 'alice',
    getIdToken: vi.fn().mockResolvedValue('mock-jwt-token'),
    ...overrides,
  };
}

// Wrapper que provee el contexto al hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  // Por defecto no hay sesion activa
  mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
    cb(null);
    return vi.fn();
  });
});

describe('useAuth — AuthContext', () => {
  it('starts with isLoading=true then resolves to null user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('populates user and token when Firebase reports a logged-in session', async () => {
    const fbUser = makeFbUser();
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(fbUser);
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual({
      id: 'uid-123',
      username: 'alice',
      email: 'alice@uni.edu',
    });
    expect(result.current.token).toBe('mock-jwt-token');
  });

  it('login() calls Firebase signInWithEmailAndPassword and stores the token', async () => {
    const fbUser = makeFbUser();
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: fbUser });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('alice@uni.edu', 'secret123');
    });

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'alice@uni.edu',
      'secret123'
    );
    expect(result.current.token).toBe('mock-jwt-token');
  });

  it('register() creates the account, sets displayName, and stores the token', async () => {
    const fbUser = makeFbUser({ displayName: null });
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: fbUser });
    mockUpdateProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.register('alice', 'alice@uni.edu', 'secret123');
    });

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'alice@uni.edu',
      'secret123'
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith(fbUser, {
      displayName: 'alice',
    });
    expect(result.current.token).toBe('mock-jwt-token');
  });

  it('logout() calls Firebase signOut', async () => {
    mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).toHaveBeenCalledWith({});
  });
});
