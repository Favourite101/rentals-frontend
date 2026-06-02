import * as React from 'react';
import { Layout } from '@/components/layout/Layout';

export const PrivacyPolicy: React.FC = () => {
  return (
    <Layout>
      <div className="container-custom py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: June 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>atlo Technologies Ltd ("atlo", "we", "us") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Account information:</strong> name, email, username, password (hashed), location</li>
              <li><strong>Identity verification:</strong> National Identification Number (NIN), processed via NIMC</li>
              <li><strong>Financial information:</strong> bank account details (for payouts), payment history (processed by Paystack)</li>
              <li><strong>Profile information:</strong> avatar photo, WhatsApp number</li>
              <li><strong>Listing & booking data:</strong> equipment listings, booking dates, transaction records</li>
              <li><strong>Communications:</strong> messages sent via the Platform, support requests</li>
              <li><strong>Device data:</strong> IP address, browser type, device identifiers (for security purposes)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>To provide, operate, and improve the Platform</li>
              <li>To verify your identity and prevent fraud</li>
              <li>To process payments and payouts</li>
              <li>To send transactional emails and in-app notifications</li>
              <li>To resolve disputes and enforce our Terms of Service</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Sharing of Information</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Paystack</strong> — to process payments and transfers</li>
              <li><strong>NIMC (via Verified Africa)</strong> — to verify your NIN</li>
              <li><strong>Cloudinary</strong> — to store and serve images</li>
              <li><strong>Resend</strong> — to deliver transactional emails</li>
              <li>Other users as necessary to facilitate a booking (e.g., your name and WhatsApp number shown to the Lender after a confirmed booking)</li>
              <li>Law enforcement or regulators when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide services. After account deletion, we may retain certain records for up to 7 years for tax and legal compliance purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Object to or restrict processing of your data</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:privacy@atlo.ng" className="text-primary hover:underline">privacy@atlo.ng</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS), hashed passwords, and access controls. However, no system is completely secure, and we cannot guarantee absolute security of your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p>We use essential cookies for authentication. We do not use third-party tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy. We will notify you of material changes via email. Your continued use of the Platform after notification constitutes acceptance of the updated Policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>For privacy enquiries, contact us at <a href="mailto:privacy@atlo.ng" className="text-primary hover:underline">privacy@atlo.ng</a>.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};
