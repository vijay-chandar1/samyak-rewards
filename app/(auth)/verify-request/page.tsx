'use client';

export default function VerifyRequestPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white py-12 dark:bg-gray-900">
      <section className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            A sign-in link has been sent to your email. Please check your inbox
            and follow the link to continue.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            You may close this tab safely.
          </p>
        </div>
      </section>
    </main>
  );
}
