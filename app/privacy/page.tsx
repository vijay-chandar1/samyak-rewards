import React from 'react';
import Head from 'next/head';
import PageContainer from '@/components/layout/page-container';

const PrivacyPage: React.FC = () => {
  const currentDate = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <PageContainer>
      <Head>
        <title>Privacy Policy - Samyak Tech Labs</title>
        <meta
          name="description"
          content="Read our privacy policy to understand how we handle your data at Samyak Tech Labs."
        />
      </Head>
      <div className="min-h-screen bg-gray-100 px-4 py-10 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
            Privacy Policy
          </h1>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            At Samyak Tech Labs, we value your privacy and are committed to
            protecting your personal data. This policy outlines how we handle
            your information.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            1. Information We Collect
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            We may collect personal data such as your name, email address, and
            usage information when you use our platform.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            2. Use of Information
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Your information is used to provide and improve our services,
            communicate with you, and ensure platform security.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            3. Sharing of Information
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            We do not share your personal information with third parties except
            as required by law or with your explicit consent.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            4. Data Security
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            We implement industry-standard security measures to protect your
            data from unauthorized access.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {currentDate}
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default PrivacyPage;