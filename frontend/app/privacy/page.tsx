'use client';

import { Navigation } from '@/components/layout/Navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="text-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-600">Last Updated: September 8, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <p className="text-gray-700 leading-relaxed mb-6">
            We value your privacy. This Privacy Policy explains what information we collect, how we
            use it, and your rights.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Inputs:</strong> Property descriptions you paste into the tool.
              </li>
              <li>
                <strong>Account Data:</strong> Email and login credentials if you sign up.
              </li>
              <li>
                <strong>Cookies & Analytics:</strong> We use cookies for authentication (JWT-based
                login) and analytics (Mixpanel). This may include your IP address, browser type,
                device, and usage data.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>To provide property analysis outputs.</li>
              <li>To authenticate your account and keep you signed in.</li>
              <li>To improve the product through analytics (Mixpanel).</li>
              <li>To maintain site security and prevent abuse.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Authenticate users via JWT tokens.</li>
              <li>Track usage trends and improve the tool with Mixpanel analytics.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              By using ListingIQ, you consent to the use of cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>We do not sell or rent your personal data.</li>
              <li>
                We may share data with third-party providers (e.g., OpenAI, Mixpanel, hosting
                services like Vercel/Supabase) only to operate the service.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                Property inputs may be stored temporarily to generate results but are not
                permanently retained.
              </li>
              <li>
                Account and analytics data may be retained as long as necessary to operate and
                improve the service.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We take reasonable steps to protect your information, but no online service is 100%
              secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Children&apos;s Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              ListingIQ is not intended for children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You may contact us to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Request deletion of your account.</li>
              <li>Ask questions about your data.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. Updates will be posted on this
              page with a revised &quot;Last Updated&quot; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions, contact us at:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                📧{' '}
                <a href="mailto:hi@aaravkhanduja.com" className="text-blue-600 hover:underline">
                  hi@aaravkhanduja.com
                </a>
              </p>
              <p className="text-gray-700">📍 New York, NY, USA</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
