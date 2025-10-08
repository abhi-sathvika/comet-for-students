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
      // Get the group ID first
      const groupId = await getGroupId(group)
      
      // For demo purposes, create a temporary user to log the click
      // In production, you'd handle this differently based on your auth flow
      const tempUser = await getOrCreateUser(
        `Demo User ${Date.now()}`,
        `demo${Date.now()}@example.com`,
        groupId || 1
      )

      if (tempUser && groupId) {
        await logClick(tempUser.id, groupId, '/comet-promo')
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
      // Get the group ID first
      const groupId = await getGroupId(group)
      
      // Create user with actual form data
      const user = await getOrCreateUser(formData.name, formData.email, groupId || 1)

      if (user && groupId) {
        await logClick(user.id, groupId, '/comet-promo')
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your experience...</p>
        </div>
      </div>
    )
  }

  if (showSignupForm) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.theme.gradient} py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-md mx-auto card-elevated p-8 scale-in">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${config.theme.accent} mb-4`}>
              <svg className={`w-8 h-8 ${group === 'control' ? 'text-blue-600' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Registration</h2>
            <p className="text-slate-600">You&apos;re just one step away from accessing Comet Pro</p>
            <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full ${config.theme.accent} border border-slate-200`}>
              <span className="text-xs font-medium text-slate-600">A/B Test Group:</span>
              <span className={`text-xs font-semibold ${group === 'control' ? 'text-blue-700' : 'text-emerald-700'}`}>
                {group === 'control' ? 'Control' : 'Variant'}
              </span>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-primary ${config.ctaColor} transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Account...
                </div>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setShowSignupForm(false)}
              className="text-sm text-slate-600 hover:text-slate-800 transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to overview
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg"></div>
              <span className="text-2xl font-bold text-slate-900">Comet</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200" href="#features">Features</a>
              <a className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200" href="#testimonials">Testimonials</a>
              <a className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200" href="#faq">FAQ</a>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-slate-200">
                <span className="text-xs font-medium text-slate-600">A/B Test:</span>
                <span className="text-xs font-semibold text-blue-700">
                  {group === 'control' ? 'Control' : 'Variant'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Powered by Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 mb-8">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <span className="text-sm font-medium text-slate-600">Powered by Perplexity AI</span>
            </div>

            {/* Main Heading */}
            <h1 className="hero-title font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              {config.title}{' '}
              <span className="bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                {config.titleHighlight}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="hero-subtitle text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              {config.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={handleSignUpClick}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Loading...
                  </div>
                ) : (
                  <>
                    {config.ctaText}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                {config.ctaSecondary}
              </button>
            </div>

            {/* Stats */}
            <div className="stats-container flex items-center justify-center gap-12">
              {config.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Why Students Love Comet
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to supercharge your academic journey
            </p>
          </div>
          
          <div className="feature-grid grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {config.features.map((feature, index) => {
              const icons = [
                // AI-Powered Search - Brain icon
                <svg key="0" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>,
                // Lightning Fast - Lightning bolt
                <svg key="1" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>,
                // Student-Optimized - Star with arrow
                <svg key="2" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>,
                // Privacy First - Globe with lock
                <svg key="3" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ]
              
              return (
                <div key={index} className="group bg-blue-50/50 rounded-xl p-8 hover:shadow-lg transition-all duration-300 fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {icons[index]}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{feature}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {config.featureDescriptions[index]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl p-12 lg:p-16 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Browsing?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join thousands of students who are already learning faster with Comet
            </p>
            <button
              onClick={handleSignUpClick}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                  Loading...
                </div>
              ) : (
                <>
                  Start Your Journey
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg"></div>
                <span className="text-2xl font-bold">Comet</span>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-md">
                The AI-powered browser designed for students. Get instant answers, research faster, and learn more efficiently.
              </p>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                  <span className="text-xs font-medium text-slate-400">A/B Test:</span>
                  <span className="text-xs font-semibold text-blue-400">
                    {group === 'control' ? 'Control' : 'Variant'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-300 hover:text-white transition-colors duration-200">Features</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">Download</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-slate-400 text-sm">
                © 2024 Comet. All rights reserved. Educational A/B testing in progress.
              </div>
              <button 
                onClick={handleSignUpClick}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? 'Loading...' : 'Get Started Free'}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}