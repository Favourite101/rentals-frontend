import * as React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Package } from 'lucide-react';
import { ROUTES } from '@/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Avaro Share
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Share, lend, and borrow items in your community. The peer-to-peer platform for everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to={ROUTES.EQUIPMENT}
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Browse Items
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.HOME}
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 text-gray-600 mt-0.5" />
                <span className="text-sm text-gray-600">support@avaroshare.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-4 w-4 text-gray-600 mt-0.5" />
                <span className="text-sm text-gray-600">+44 20 1234 5678</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
                <span className="text-sm text-gray-600">London, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Avaro Share. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
