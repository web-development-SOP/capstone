import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar/SearchBar';

// CSS modules se reemplazan con objetos vacios en el entorno de pruebas
vi.mock('../components/SearchBar/SearchBar.module.scss', () => ({ default: {} }));

describe('SearchBar', () => {
  it('renders the input and button', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('calls onSearch with the trimmed query on submit', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '  react programming  ');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('react programming');
  });

  it('does not call onSearch when the input is blank', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('shows a custom placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Find a book…" />);
    expect(screen.getByPlaceholderText('Find a book…')).toBeInTheDocument();
  });

  it('disables the input and button while loading', () => {
    render(<SearchBar onSearch={vi.fn()} isLoading />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled();
  });
});
