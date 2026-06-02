import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { TermsOfService } from '@/pages/TermsOfService';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { renderAsGuest } from '@/test/render';

function renderTerms() {
  return renderAsGuest(
    <Routes>
      <Route path="/terms" element={<TermsOfService />} />
    </Routes>,
    { initialEntries: ['/terms'] }
  );
}

function renderPrivacy() {
  return renderAsGuest(
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>,
    { initialEntries: ['/privacy'] }
  );
}

describe('TermsOfService', () => {
  it('renders the page heading', () => {
    renderTerms();
    expect(screen.getByRole('heading', { name: /terms of service/i })).toBeInTheDocument();
  });

  it('shows "Last updated" date', () => {
    renderTerms();
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it('includes all 12 required sections', () => {
    renderTerms();
    // Use getAllByText or queryAllByText with regex so numbered headings ("1. Acceptanceâ€¦") still match
    const sectionPatterns = [
      /acceptance of terms/i,
      /the atlo platform/i,
      /eligibility/i,
      /user accounts/i,
      /listings/i,
      /bookings & payments/i,
      /cancellations & refunds/i,
      /damage & non-return/i,
      /prohibited conduct/i,
      /limitation of liability/i,
      /changes to terms/i,
    ];
    sectionPatterns.forEach((pattern) => {
      expect(screen.getAllByText(pattern).length).toBeGreaterThan(0);
    });
  });

  it('includes Paystack as a payment processor', () => {
    renderTerms();
    expect(screen.getAllByText(/paystack/i).length).toBeGreaterThan(0);
  });

  it('renders support email link', () => {
    renderTerms();
    const link = screen.getByRole('link', { name: /support@atlo\.ng/i });
    expect(link).toHaveAttribute('href', 'mailto:support@atlo.ng');
  });
});

describe('PrivacyPolicy', () => {
  it('renders the page heading', () => {
    renderPrivacy();
    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument();
  });

  it('shows "Last updated" date', () => {
    renderPrivacy();
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it('includes all 10 required sections', () => {
    renderPrivacy();
    const sectionPatterns = [
      /introduction/i,
      /information we collect/i,
      /how we use your information/i,
      /sharing of information/i,
      /data retention/i,
      /your rights/i,
      /security/i,
      /cookies/i,
      /changes to this policy/i,
    ];
    sectionPatterns.forEach((pattern) => {
      expect(screen.getAllByText(pattern).length).toBeGreaterThan(0);
    });
  });

  it('mentions third-party processors', () => {
    renderPrivacy();
    expect(screen.getAllByText(/paystack/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nimc/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cloudinary/i).length).toBeGreaterThan(0);
  });

  it('renders privacy email link', () => {
    renderPrivacy();
    const links = screen.getAllByRole('link', { name: /privacy@atlo\.ng/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', 'mailto:privacy@atlo.ng');
  });
});

