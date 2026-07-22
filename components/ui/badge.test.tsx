import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge Component (components/ui/badge)', () => {

  it('renders badge text content correctly', () => {
    render(<Badge>React.js</Badge>);

    expect(screen.getByText('React.js')).toBeInTheDocument();
  });

  it('applies variant data attributes correctly', () => {
    render(<Badge variant="destructive">Urgent</Badge>);

    const badgeElement = screen.getByText('Urgent');
    expect(badgeElement).toBeInTheDocument();

    expect(badgeElement).toHaveAttribute('data-variant', 'destructive');
  });
});