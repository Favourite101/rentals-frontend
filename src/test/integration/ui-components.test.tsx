import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { MemoryRouter } from 'react-router-dom';
import { BackButton } from '@/components/ui/BackButton';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders outline variant without error', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders sm size', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies additional className', () => {
    render(<Button className="my-custom-class">Styled</Button>);
    expect(screen.getByRole('button')).toHaveClass('my-custom-class');
  });
});

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="bg-red-100">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('bg-red-100');
  });
});

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('passes error prop as an HTML attribute without crashing', () => {
    // Input is a thin wrapper â€” error display is handled by the parent form field
    const { container } = render(<Input {...{ error: 'This field is required' } as React.InputHTMLAttributes<HTMLInputElement>} />);
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('applies type attribute', () => {
    render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
  });

  it('fires onChange handler', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} placeholder="Name" />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Alice' } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Loader', () => {
  it('renders without crashing', () => {
    const { container } = render(<Loader />);
    expect(container.firstChild).not.toBeNull();
  });

  it('applies size prop without error', () => {
    const { container } = render(<Loader size="lg" />);
    expect(container.firstChild).not.toBeNull();
  });
});

describe('BackButton', () => {
  it('renders a link with the given label', () => {
    render(
      <MemoryRouter>
        <BackButton to="/dashboard" label="Dashboard" />
      </MemoryRouter>
    );
    expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
  });
});
