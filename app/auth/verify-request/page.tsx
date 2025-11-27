export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-gray-600 mb-4">
          A sign-in link has been sent to your email address.
        </p>
        <p className="text-sm text-gray-500">
          Click the link in the email to sign in to Language Tutor.
        </p>
      </div>
    </div>
  );
}
