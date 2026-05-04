'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // TODO: connect to backend
      console.log({ fullName, email, password, adminCode });

      router.push('/login');
    } catch (err) {
      setError('Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface font-sans">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-primary-700 text-white items-center justify-center p-12">
        <div>
          <h1 className="text-4xl font-display font-bold mb-4">
            Agrismart Admin Sign-Up
          </h1>
          <p className="text-primary-100">
            Create your administrator account and manage farms efficiently.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Create Account
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Join the Agrismart system
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* FULL NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>

            {/* PASSWORD ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

            </div>

            {/* ADMIN CODE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Code
              </label>
              <input
                type="text"
                placeholder="Enter code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-700 transition font-medium"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            {/* LOGIN LINK */}
            <div className="text-center text-sm text-gray-500">
              <span>Already have an account? </span>
              <a href="/login" className="text-primary-700 hover:underline">
                Login
              </a>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
