import React from 'react';
import Head from 'next/head';
import PageContainer from '@/components/layout/page-container';

const TermsPage: React.FC = () => {
  const currentDate = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <PageContainer>
      <Head>
        <title>Terms of Service - Samyak Tech Labs</title>
        <meta
          name="description"
          content="Read the terms of service for using the Samyak Tech Labs platform."
        />
      </Head>
      <div className="min-h-screen bg-gray-100 px-4 py-10 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          {/* Previous content remains the same */}
          <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
            Terms of Service
          </h1>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Welcome to Samyak Tech Labs! By accessing or using our platform, you
            agree to comply with and be bound by the following terms and
            conditions. Please read them carefully.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            1. Acceptance of Terms
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            By using our services, you agree to these terms. If you do not
            agree, please do not use our services.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            2. Changes to Terms
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Samyak Tech Labs reserves the right to modify these terms at any
            time. Continued use of the platform signifies your acceptance of the
            updated terms.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            3. Use of the Platform
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            You must use the platform responsibly and not engage in prohibited
            activities.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            4. Limitation of Liability
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Samyak Tech Labs is not liable for any damages resulting from the
            use of our platform.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {currentDate}
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default TermsPage;