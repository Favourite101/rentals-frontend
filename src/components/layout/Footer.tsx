import * as React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Facebook } from 'lucide-react';
import { ROUTES } from '@/constants';

const LogoMark: React.FC = () => (
  <svg width="14" height="18" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 22L9 0l9 22H0z" fill="currentColor" />
    <path d="M5 22l4-9 4 9H5z" fill="white" fillOpacity="0.35" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container-custom py-12">

        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">

          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 text-primary">
              <LogoMark />
              <span className="text-[16px] font-semibold text-gray-900 tracking-tight">atlo</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
              Access what you need. Earn from what you own.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-900">Product</h3>
            <ul className="space-y-3">
              <FooterLink to={ROUTES.EQUIPMENT} label="Categories" />
              <FooterLink to={ROUTES.EQUIPMENT} label="Browse items" />
              <FooterLink to={ROUTES.HOME} label="For business" />
              <FooterLink to={ROUTES.HOME} label="Community" />
            </ul>
          </div>

          {/* Safety */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-900">Safety</h3>
            <ul className="space-y-3">
              <FooterLink to={ROUTES.HOME} label="Trust & safety" />
              <FooterLink to={ROUTES.HOME} label="Secure payments" />
              <FooterLink to={ROUTES.HOME} label="Damage protection" />
              <FooterLink to={ROUTES.PRIVACY} label="Privacy policy" />
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-900">Hosting</h3>
            <ul className="space-y-3">
              <FooterLink to={ROUTES.MY_LISTINGS} label="Become a host" />
              <FooterLink to={ROUTES.MY_LISTINGS} label="Host resources" />
              <FooterLink to={ROUTES.LENDING_REQUESTS} label="Earnings" />
              <FooterLink to={ROUTES.HOME} label="Community tips" />
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-900">Help</h3>
            <ul className="space-y-3">
              <FooterLink to={ROUTES.HOME} label="Help centre" />
              <FooterLink to={ROUTES.HOME} label="Contact us" />
              <FooterLink to={ROUTES.HOME} label="Report an issue" />
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} atlo Technologies Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to={ROUTES.TERMS} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Terms of service</Link>
            <Link to={ROUTES.PRIVACY} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <li>
    <Link to={to} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
      {label}
    </Link>
  </li>
);
