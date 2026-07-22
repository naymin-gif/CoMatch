import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from './searchbar';

describe('SearchBar Component (components/ui/searchbar)', () => {

  // Test 1: Value and Placeholder Rendering
  it('renders input with placeholder and correct value', () => {
    render(<SearchBar value="Orbital 2026" onChange={() => {}} />);

    const inputElement = screen.getByPlaceholderText('Search') as HTMLInputElement;
    expect(inputElement).toBeInTheDocument();
    expect(inputElement.value).toBe('Orbital 2026');
  });

  // Test 2: Typing User Interaction
  it('calls onChange handler when user types', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="" onChange={handleChange} />);

    const inputElement = screen.getByPlaceholderText('Search');
    await user.type(inputElement, 'a');

    expect(handleChange).toHaveBeenCalled();
  });
});