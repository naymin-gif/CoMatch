import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar, AvatarFallback } from './Avatar';

describe('Avatar Component (components/ui/Avatar)', () => {

  // Test 1: Multi-word name initials fallback
  it('renders initials fallback for multi-word name correctly', () => {
    render(
      <Avatar name="Win Htut">
        <AvatarFallback />
      </Avatar>
    );

    expect(screen.getByText('WH')).toBeInTheDocument();
  });

  // Test 2: Single-word name initials fallback
  it('renders initials fallback for single-word name correctly', () => {
    render(
      <Avatar name="Henry">
        <AvatarFallback />
      </Avatar>
    );

    expect(screen.getByText('HE')).toBeInTheDocument();
  });
});