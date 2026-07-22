import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';

describe('Button Component (components/ui/button)', () => {
  
  // Test 1: Rendering Text Label
  it('renders button text correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  // Test 2: User Click Event Interaction
  it('triggers onClick handler when clicked by user', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Submit</Button>);

    const buttonElement = screen.getByRole('button', { name: /submit/i });
    await user.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});