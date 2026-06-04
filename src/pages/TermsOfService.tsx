import * as React from 'react';
import { Layout } from '@/components/layout/Layout';

export const TermsOfService: React.FC = () => {
  return (
    <Layout>
      <div className="container-custom py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-10">Last updated: June 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using atlo ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. The atlo Platform</h2>
            <p>atlo is a peer-to-peer equipment rental marketplace that connects people who want to lend their equipment ("Lenders") with people who want to borrow equipment ("Borrowers"). atlo is not a party to any rental transaction and does not own, operate, or control any equipment listed on the Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Eligibility</h2>
            <p>You must be at least 18 years old and a resident of Nigeria to use atlo. By creating an account you represent and warrant that you meet these requirements. You must verify your email address and complete your profile before making or receiving bookings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorised use of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Listings</h2>
            <p>Lenders are responsible for providing accurate descriptions of their equipment, including condition, daily rate, and availability. All listings are subject to review and approval by atlo before being visible to Borrowers. atlo reserves the right to remove any listing that violates these Terms or our community standards.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Bookings & Payments</h2>
            <p>All payments are processed securely through Paystack. When a Borrower books an item, the total amount (rental fee + security deposit) is charged at the time of booking. The security deposit is held and released 72 hours after the rental end date, provided no non-return report has been filed. Platform fees are deducted from the Lender's payout, which is processed on a weekly basis.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cancellations & Refunds</h2>
            <p>Cancellations by Lenders will result in a full refund to the Borrower. Borrowers may request a refund through the Platform; all refund requests are reviewed by atlo. Refunds are processed via Paystack Transfer to the Borrower's registered bank account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Damage & Non-Return</h2>
            <p>Borrowers are responsible for returning equipment in the same condition it was received. In cases of non-return, the Lender may file a report through the Platform. atlo will review the report and decide whether the security deposit should be refunded to the Borrower or transferred to the Lender. This decision is final.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Prohibited Conduct</h2>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Listing stolen, counterfeit, or illegal items</li>
              <li>Providing false information in listings or during verification</li>
              <li>Circumventing the Platform by transacting directly with other users</li>
              <li>Harassing or threatening other users</li>
              <li>Creating multiple accounts to evade restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p>atlo is a marketplace and is not liable for the condition, safety, legality, or fitness for purpose of any item listed on the Platform. To the fullest extent permitted by law, atlo's total liability to you for any claim arising from your use of the Platform shall not exceed the amount of fees paid by you to atlo in the three months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of material changes via email or in-app notification. Continued use of the Platform after changes take effect constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@atlo.ng" className="text-primary hover:underline">support@atlo.ng</a>.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};
