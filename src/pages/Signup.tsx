// src/pages/Signup.tsx

import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUpProfile } from '../lib/auth'

export default function Signup() {
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [referralCode, setReferralCode] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [toast, setToast] = useState<string>('')
  const navigate = useNavigate()

  // After showing success toast, redirect to login
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => {
      setToast('')
      navigate('/login')
    }, 3000)
    return () => clearTimeout(t)
  }, [toast, navigate])

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1) Create auth user + profile in 'users' table
      await signUpProfile(email, password, referralCode || null, username)

      // 2) Show confirmation message
      setToast('Account created!.')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Success Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.jpg" alt="BYD Logo" className="h-20 object-contain" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          Create Your BYD Account
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Choose a username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Referral Code */}
          <div>
            <label htmlFor="referral" className="block text-gray-700 mb-1">
              Referral Code (Optional)
            </label>
            <input
              id="referral"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Enter code"
              value={referralCode}
              onChange={e => setReferralCode(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !!toast}
            className={`w-full flex items-center justify-center py-2 rounded-md text-white font-medium bg-gradient-to-r from-red-600 to-black ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-500 hover:to-gray-900'
            }`}
          >
            {loading
              ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )
              : 'Sign Up'
            }
          </button>
        </form>

        {/* Link to Login */}
        <div className="flex justify-center items-center mt-4 text-sm">
          <span className="text-gray-600">Already have an account?</span>
          <Link to="/login" className="ml-1 text-red-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
