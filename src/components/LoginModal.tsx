'use client'

import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import axios from 'axios'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onEmailSent: () => void
}

// Rate limiting storage
const rateLimitStore = {
  attempts: {} as Record<string, number[]>,
  
  // Add an attempt for an email
  addAttempt(email: string): void {
    const now = Date.now()
    if (!this.attempts[email]) {
      this.attempts[email] = []
    }
    this.attempts[email].push(now)
    
    // Clean up attempts older than 10 minutes
    this.attempts[email] = this.attempts[email].filter(
      time => now - time < 10 * 60 * 1000
    )
  },
  
  // Check if rate limited
  isRateLimited(email: string): boolean {
    const attempts = this.attempts[email] || []
    return attempts.length >= 3
  },
  
  // Get remaining attempts
  getRemainingAttempts(email: string): number {
    const attempts = this.attempts[email] || []
    return Math.max(0, 3 - attempts.length)
  },
  
  // Get time until reset (in seconds)
  getTimeUntilReset(email: string): number {
    if (!this.attempts[email] || this.attempts[email].length === 0) {
      return 0
    }
    
    const oldestAttempt = Math.min(...this.attempts[email])
    const resetTime = oldestAttempt + 10 * 60 * 1000
    const now = Date.now()
    
    return Math.max(0, Math.ceil((resetTime - now) / 1000))
  }
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onEmailSent }) => {
  // Form states
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  // UI states
  const [showToast, setShowToast] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [step, setStep] = useState<'initial' | 'confirm' | 'success'>('initial')
  const [userExists, setUserExists] = useState<boolean | null>(null)
  const [remainingAttempts, setRemainingAttempts] = useState(3)
  const [timeUntilReset, setTimeUntilReset] = useState(0)
  const [magicLink, setMagicLink] = useState<string | null>(null)

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowToast(false)
      setCountdown(10)
      setError('')
      setDebugInfo(null)
      setStep('initial')
      setEmail('')
      setConfirmEmail('')
      setUserExists(null)
      setMagicLink(null)
    }
  }, [isOpen])

  // Auto-close modal after successful email send
  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (showToast && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (showToast && countdown === 0) {
      onClose()
    }
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showToast, countdown, onClose])

  // Update rate limit info
  useEffect(() => {
    if (email) {
      const interval = setInterval(() => {
        setRemainingAttempts(rateLimitStore.getRemainingAttempts(email))
        setTimeUntilReset(rateLimitStore.getTimeUntilReset(email))
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [email])

  if (!isOpen) return null

  // Check if email exists in database
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await axios.post('/api/auth/check-email', { email })
      return response.data.exists
    } catch (error) {
      console.error('Error checking email:', error)
      return false
    }
  }

  const fetchMagicLink = async (email: string) => {
    try {
      const res = await fetch(`/api/auth/dev-magic-link?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.url) {
        const localUrl = data.url.replace(/^https?:\/\/[^/]+/, 'http://localhost:3000')
        setMagicLink(localUrl)
      }
    } catch (err) {
      console.error('Error fetching magic link:', err)
    }
  }

  // Handle initial email submission
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    // Check rate limiting
    if (rateLimitStore.isRateLimited(email)) {
      setError(`Too many attempts. Please try again in ${Math.ceil(timeUntilReset / 60)} minutes.`)
      return
    }
    
    setIsLoading(true)
    setError('')
    setDebugInfo(null)
    
    try {
      // Record this attempt
      rateLimitStore.addAttempt(email)
      setRemainingAttempts(rateLimitStore.getRemainingAttempts(email))
      
      // Check if user exists in database
      const exists = await checkEmailExists(email)
      setUserExists(exists)
      
      if (exists) {
        // Existing user flow - send OTP directly
        console.log('Existing user, sending OTP to:', email)
        const result = await signIn('email', {
          email,
          redirect: false,
          callbackUrl: window.location.pathname
        })

        await fetchMagicLink(email)
        
        console.log('SignIn result:', result)
        
        if (result?.error === "EmailSignin" && result.status === 200 && result.ok === true) {
          // This is a successful email sending, show toast and start countdown
          setShowToast(true)
          setStep('success')
          onEmailSent()
        } else if (result?.error) {
          handleAuthError(result)
        } else {
          // Other success cases
          setShowToast(true)
          setStep('success')
          onEmailSent()
        }
      } else {
        // New user flow - show confirmation field
        console.log('New user, showing confirmation field for:', email)
        setStep('confirm')
      }
    } catch (err: any) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle confirmation email submission
  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (email !== confirmEmail) {
      setError('Emails do not match. Please check and try again.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      console.log('New user confirmed, sending OTP for account creation:', email)
      
      // Send OTP for account creation (10 min expiry)
      // Use try-catch to handle any errors from signIn
      try {
        const result = await signIn('email', {
          email,
          redirect: false, // Important: prevent automatic redirect
          callbackUrl: window.location.pathname // Stay on current page
        })

        await fetchMagicLink(email)
        
        console.log('SignIn result for new user:', result)
        
        // Check for success conditions
        if (result?.error === "EmailSignin" && result.status === 200 && result.ok === true) {
          // This is a successful email sending, show toast and start countdown
          setShowToast(true)
          setStep('success')
          onEmailSent()
        } else if (result?.error) {
          handleAuthError(result)
        } else {
          // Other success cases
          setShowToast(true)
          setStep('success')
          onEmailSent()
        }
      } catch (signInError: any) {
        console.error('Error during signIn:', signInError)
        setError(`Error sending verification email: ${signInError.message || 'Unknown error'}`)
        setDebugInfo({
          name: signInError?.name,
          message: signInError?.message,
          stack: signInError?.stack,
          code: signInError?.code
        })
      }
    } catch (err: any) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Go back to initial step
  const handleBack = () => {
    setStep('initial')
    setError('')
    setConfirmEmail('')
  }

  // Handle authentication errors
  const handleAuthError = (result: any) => {
    if (result.error === "UserNotFound" || result.error.includes("user") || result.error.includes("email")) {
      setError(`We couldn't find an account with that email address. Please check your spelling or try another email.`)
    } else {
      setError(`Authentication error: ${result.error}`)
    }
    
    setDebugInfo({
      error: result.error,
      status: result.status,
      ok: result.ok,
      url: result.url
    })
  }

  // Handle general errors
  const handleError = (err: any) => {
    console.error('Detailed sign-in error:', err)
    setError(`Error: ${err?.message || 'Unknown error occurred'}. Please try again or use a different email.`)
    setDebugInfo({
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
      code: err?.code
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div>
            <p className="font-medium">Email sent - check your email</p>
            <p className="text-sm">
              {userExists
                ? "Sign in link sent to your email"
                : "Account creation link sent to your email"}
            </p>
            {magicLink && (
              <p className="text-sm break-all">
                <a className="underline" href={magicLink} target="_blank" rel="noopener noreferrer">Magic link</a>
              </p>
            )}
            <p className="text-sm">Closing in {countdown} seconds...</p>
          </div>
        </div>
      )}
      
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {step === 'initial' ? 'Sign In' : 
             step === 'confirm' ? 'Confirm Email' : 'Email Sent'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Initial step - Enter email */}
        {step === 'initial' && (
          <>
            <p className="mb-6 text-gray-600">
              Enter your email address to receive a secure sign-in link.
            </p>
            
            <form onSubmit={handleInitialSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              {remainingAttempts < 3 && (
                <div className="mb-4 p-2 bg-yellow-50 text-yellow-700 rounded-md text-sm">
                  <p>Remaining attempts: {remainingAttempts}</p>
                  {timeUntilReset > 0 && (
                    <p>Rate limit resets in: {Math.floor(timeUntilReset / 60)}m {timeUntilReset % 60}s</p>
                  )}
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                  
                  {debugInfo && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto">
                      <p className="font-bold">Debug Information:</p>
                      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isLoading || rateLimitStore.isRateLimited(email)}
                >
                  {isLoading ? 'Checking...' : 'Continue'}
                </button>
              </div>
            </form>
          </>
        )}
        
        {/* Confirmation step - Confirm email for new users */}
        {step === 'confirm' && (
          <>
            <p className="mb-6 text-gray-600">
              We couldn't find an account with this email. Please confirm your email to create a new account.
            </p>
            
            <form onSubmit={handleConfirmSubmit}>
              <div className="mb-4">
                <label htmlFor="email-display" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="flex items-center">
                  <input
                    type="email"
                    id="email-display"
                    value={email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={handleBack}
                    className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Change
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirm-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Email Address
                </label>
                <input
                  type="email"
                  id="confirm-email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your email"
                  required
                />
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                  
                  {debugInfo && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto">
                      <p className="font-bold">Debug Information:</p>
                      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleBack}
                  className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Create Account'}
                </button>
              </div>
            </form>
          </>
        )}
        
        {/* Success step - Email sent */}
        {step === 'success' && !showToast && (
          <div className="text-center py-4">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Email Sent Successfully</h3>
            <p className="text-gray-600 mb-4">
              {userExists
                ? "Please check your email for a sign-in link."
                : "Please check your email to create your account."}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        )}
        
        {step === 'initial' && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <span className="text-blue-600">
              Enter your email above and we'll help you create one.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginModal
