'use client'

import { useState, useEffect } from 'react'
import { getABTestGroup, getGroupConfig, trackABTestAssignment, ABTestGroup } from '@/lib/abtest'
import { logClick, getOrCreateUser, getGroupId } from '@/lib/analytics'

export default function ABTestLanding() {
  const [group, setGroup] = useState<ABTestGroup | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })

  useEffect(() => {
    // Assign user to A/B test group
    const assignedGroup = getABTestGroup()
    setGroup(assignedGroup)
    trackABTestAssignment(assignedGroup)
  }, [])

  const config = group ? getGroupConfig(group) : null

  const handleSignUpClick = async () => {
    if (!group) return

    setIsLoading(true)
    try {
      // For demo purposes, create a temporary user to log the click
      // In production, you'd handle this differently based on your auth flow
      const tempUser = await getOrCreateUser(
        `Demo User ${Date.now()}`,
        `demo${Date.now()}@example.com`
      )

      if (tempUser) {
        const groupId = await getGroupId(group)
        if (groupId) {
          await logClick(tempUser.id, groupId, '/comet-promo')
        }
      }
    } catch (err) {
      console.error('Error logging click:', err)
    }

    setIsLoading(false)
    setShowSignupForm(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!group || !formData.name || !formData.email) return

    setIsLoading(true)
    try {
      // Create user with actual form data
      const user = await getOrCreateUser(formData.name, formData.email)

      if (user) {
        const groupId = await getGroupId(group)
        if (groupId) {
          await logClick(user.id, groupId, '/comet-promo')
        }
      }

      // In a real app, you'd redirect to sign up completion or dashboard
      alert(`Thanks ${formData.name}! Sign up successful (A/B group: ${group})`)
    } catch (err) {
      console.error('Error during sign up:', err)
      alert('Sign up failed. Please try again.')
    }

    setIsLoading(false)
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }

  if (showSignupForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Almost There! 🎉</h2>
            <p className="text-gray-600 mt-2">Complete your Comet Pro registration</p>
            <div className="text-sm text-blue-600 mt-2">A/B Group: {group}</div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${config.ctaColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
            >
              {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowSignupForm(false)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to promotion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">Comet</div>
            <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              A/B Test: {group}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {config.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {config.subtitle}
          </p>

          {/* Highlight Badge */}
          <div className="inline-block bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full font-semibold mb-12 animate-pulse">
            {config.highlight}
          </div>

          {/* CTA Button */}
          <div className="mb-16">
            <button
              onClick={handleSignUpClick}
              disabled={isLoading}
              className={`inline-block px-8 py-4 text-lg font-semibold text-white rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 ${config.ctaColor}`}
            >
              {isLoading ? 'Loading...' : config.ctaText}
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {config.features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="text-3xl mb-4">
                  {['📚', '🤝', '🚀', '💰'][index]}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature}
                </h3>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="mt-16 bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="text-yellow-400 text-2xl">★★★★★</div>
            </div>
            <blockquote className="text-lg text-gray-700 italic mb-4">
              "Comet Pro completely transformed how I manage my studies. The collaboration features are amazing!"
            </blockquote>
            <cite className="text-gray-600 font-semibold">
              - Sarah M., Computer Science Student
            </cite>
          </div>

          {/* Footer */}
          <div className="mt-16 text-sm text-gray-500">
            <p>🔬 This page is part of an A/B test for educational purposes</p>
            <p className="mt-2">Group: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{group}</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}