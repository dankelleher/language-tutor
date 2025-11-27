export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-honey-50 to-white">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-honey-100 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-honey-800 mb-2">Check your inbox!</h1>
        <p className="text-honey-600 mb-4">
          A magic link is flying your way.
        </p>
        <p className="text-sm text-honey-500">
          Click the link to join the hive and start buzzing!
        </p>
      </div>
    </div>
  );
}
