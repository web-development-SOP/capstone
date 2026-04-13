import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useFetch } from '../hooks/useFetch';

// Mock axios at the module level
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useFetch', () => {
  it('starts with isLoading=false and no data when url is null', () => {
    const { result } = renderHook(() => useFetch<string[]>(null));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets isLoading=true immediately when a url is provided', () => {
    // Delay resolution so we can observe the loading state
    mockedAxios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useFetch<string[]>('https://example.com/api'));
    expect(result.current.isLoading).toBe(true);
  });

  it('returns data on a successful request', async () => {
    const mockData = { books: ['Book A', 'Book B'] };
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockData });

    const { result } = renderHook(() =>
      useFetch<typeof mockData>('https://example.com/api')
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('sets error when the request fails', async () => {
    const axiosError = Object.assign(new Error('Network Error'), { isAxiosError: true });
    mockedAxios.get = vi.fn().mockRejectedValue(axiosError);
    vi.spyOn(axios, 'isCancel').mockReturnValue(false);

    const { result } = renderHook(() =>
      useFetch<unknown>('https://example.com/bad')
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Network Error');
    expect(result.current.data).toBeNull();
  });
});
