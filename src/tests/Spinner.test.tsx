import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from '../components/Spinner/Spinner';

vi.mock('../components/Spinner/Spinner.module.scss', () => ({ default: {} }));

describe('Spinner', () => {
  it('renders the default "Loading…" label', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders a custom label when provided', () => {
    render(<Spinner label="Please wait…" />);
    expect(screen.getByText('Please wait…')).toBeInTheDocument();
  });
});
