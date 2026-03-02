'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: string } = {
    Configuration: 'There was a problem with the server configuration.',
    AccessDenied: 'Access was denied.',
    Verification: 'The verification token has expired or has already been used.',
    OAuthSignin: 'Error connecting to the OAuth provider.',
    OAuthCallback: 'The OAuth provider returned an error.',
    OAuthCreateAccount: 'Could not create account with this provider.',
    EmailCreateAccount: 'Could not create account with this email.',
    Callback: 'There was an error in the callback handler.',
    EmailSignInError: 'Email sign in is not enabled.',
    CredentialsSignin: 'Invalid email or password.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'An authentication error occurred.',
  };

  const message = error ? errorMessages[error] || 'An authentication error occurred.' : 'An error occurred.';

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-600 hover:text-blue-700 inline-block mb-4">
            NeuroDesk
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-500">Something went wrong</p>
        </div>

        {/* Error Card */}
        <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            <p className="font-medium mb-1">Error:</p>
            <p>{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold text-white transition-all text-center shadow-sm"
            >
              Try Signing In Again
            </Link>
            <Link
              href="/"
              className="block py-2.5 border-2 border-gray-300 hover:border-blue-500 rounded-lg font-semibold text-gray-700 hover:text-blue-600 text-center transition-all"
            >
              Back to Home
            </Link>
          </div>

          {/* Debug Info */}
          {error && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">Error Code: <code className="text-gray-700 bg-gray-100 px-2 py-1 rounded">{error}</code></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}