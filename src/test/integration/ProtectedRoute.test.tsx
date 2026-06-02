import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { renderWithProviders, renderAsGuest, renderAsAdmin } from '@/test/render';
import { makeUser } from '@/test/factories';

const Dashboard = () => <div>Dashboard Page</div>;
const AdminPage = () => <div>Admin Page</div>;
const Login = () => <div>Login Page</div>;
const UserPage = () => <div>User-Only Page</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;

function makeRoutes(element: React.ReactElement) {
  return (
    <Routes>
      <Route path="/" element={element} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

describe('ProtectedRoute â€” unauthenticated', () => {
  it('redirects to /login when no token is set', () => {
    renderAsGuest(
      makeRoutes(
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      )
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
  });
});

describe('ProtectedRoute â€” authenticated user', () => {
  it('renders children for an authenticated user', () => {
    renderWithProviders(
      makeRoutes(
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
      { user: makeUser() }
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('redirects to /dashboard when non-admin accesses requireAdmin route', () => {
    renderWithProviders(
      makeRoutes(
        <ProtectedRoute requireAdmin>
          <AdminPage />
        </ProtectedRoute>
      ),
      { user: makeUser() }
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Page')).not.toBeInTheDocument();
  });

  it('redirects admin to /admin when accessing userOnly route', () => {
    renderAsAdmin(
      makeRoutes(
        <ProtectedRoute userOnly>
          <UserPage />
        </ProtectedRoute>
      )
    );
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('User-Only Page')).not.toBeInTheDocument();
  });
});

describe('ProtectedRoute â€” admin user', () => {
  it('renders protected admin content for admin user', () => {
    renderAsAdmin(
      makeRoutes(
        <ProtectedRoute requireAdmin>
          <AdminPage />
        </ProtectedRoute>
      )
    );
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  it('renders userOnly content for non-admin user', () => {
    renderWithProviders(
      makeRoutes(
        <ProtectedRoute userOnly>
          <UserPage />
        </ProtectedRoute>
      ),
      { user: makeUser() }
    );
    expect(screen.getByText('User-Only Page')).toBeInTheDocument();
  });
});
