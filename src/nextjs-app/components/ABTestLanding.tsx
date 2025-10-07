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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }

  if (showSignupForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Almost There! 🎉</h2>
            <p className="text-gray-600 mt-2">Complete your Comet Pro registration</p>
            <div className="text-xs inline-block mt-3 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">A/B Group: {group}</div>
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
                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-semibold text-white ${config.ctaColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-md ${group === 'variant' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-blue-600'}`}></div>
              <span className="text-xl font-bold text-gray-900">Comet</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <a className="hover:text-gray-900" href="#features">Features</a>
              <a className="hover:text-gray-900" href="#benefits">Benefits</a>
              <a className="hover:text-gray-900" href="#faq">FAQ</a>
              <span className="inline-flex items-center text-xs bg-gray-100 px-3 py-1 rounded-full">A/B: {group}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 -z-10 ${group === 'variant' ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-white' : ''}`}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-700 mb-5">
                <span>Student Offer</span>
                <span className="text-gray-300">•</span>
                <span className="text-blue-600">{config.highlight}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">
                {config.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
                {config.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={handleSignUpClick}
                  disabled={isLoading}
                  className={`px-8 py-4 text-base font-semibold text-white rounded-lg shadow-lg transform transition-all duration-200 hover:translate-y-[-1px] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 ${config.ctaColor}`}
                >
                  {isLoading ? 'Loading…' : config.ctaText}
                </button>
                <div className="text-xs text-gray-500">No credit card required</div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-6 text-center" id="benefits">
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                  <div className="text-lg font-semibold text-gray-900">10k+</div>
                  <div className="text-xs text-gray-500">Student users</div>
                </div>
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                  <div className="text-lg font-semibold text-gray-900">4.8/5</div>
                  <div className="text-xs text-gray-500">Average rating</div>
                </div>
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                  <div className="text-lg font-semibold text-gray-900">60%</div>
                  <div className="text-xs text-gray-500">Avg. savings</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className={`absolute -top-10 -right-10 h-56 w-56 rounded-full blur-3xl opacity-20 ${group === 'variant' ? 'bg-pink-400' : 'bg-blue-400'}`}></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className={`h-12 w-full ${group === 'variant' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-blue-600'}`}></div>
                <div className="p-6">
                  <div className="h-40 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                    App preview placeholder
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="h-16 rounded-md bg-gray-50 border border-gray-100"></div>
                    <div className="h-16 rounded-md bg-gray-50 border border-gray-100"></div>
                    <div className="h-16 rounded-md bg-gray-50 border border-gray-100"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos strip */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-xs uppercase tracking-wider text-gray-500 text-center mb-6">Trusted by students at</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center opacity-70">
            <div className="h-6 bg-gray-100 rounded"/>
            <div className="h-6 bg-gray-100 rounded"/>
            <div className="h-6 bg-gray-100 rounded"/>
            <div className="h-6 bg-gray-100 rounded"/>
            <div className="h-6 bg-gray-100 rounded"/>
            <div className="h-6 bg-gray-100 rounded"/>
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything you need to excel</h2>
          <p className="text-gray-600 mt-3">Purpose-built for coursework, group projects, and landing your next opportunity.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.features.map((feature, index) => (
            <div key={index} className="group bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${group === 'variant' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                {['📚', '🤝', '🚀', '💰'][index]}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{feature}</h3>
              <p className="text-sm text-gray-600">Concise explanation about how this helps students achieve more with less effort.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-3">
            <div className="text-yellow-400">★★★★★</div>
          </div>
          <blockquote className="text-lg text-gray-800 leading-relaxed text-center">
            “Comet Pro completely transformed how I manage my studies. Collaboration features and templates saved me hours every week.”
          </blockquote>
          <div className="mt-4 text-center text-sm text-gray-600">Sarah M. — Computer Science, Class of 2026</div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions? We’ve got answers.</h3>
              <p className="text-gray-600">Everything about eligibility, pricing, and what’s included in the student offer.</p>
              <div className="mt-6">
                <button
                  onClick={handleSignUpClick}
                  disabled={isLoading}
                  className={`px-6 py-3 text-sm font-semibold text-white rounded-lg shadow ${config.ctaColor}`}
                >
                  {isLoading ? 'Loading…' : config.ctaText}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-100 rounded-lg p-4 bg-white">
                <div className="font-semibold text-gray-900">Who qualifies for Comet Pro for Students?</div>
                <div className="text-sm text-gray-600 mt-1">Anyone with a valid .edu or approved student email address.</div>
              </div>
              <div className="border border-gray-100 rounded-lg p-4 bg-white">
                <div className="font-semibold text-gray-900">Can I cancel anytime?</div>
                <div className="text-sm text-gray-600 mt-1">Yes, you can cancel in one click—no questions asked.</div>
              </div>
              <div className="border border-gray-100 rounded-lg p-4 bg-white">
                <div className="font-semibold text-gray-900">Do I need a credit card?</div>
                <div className="text-sm text-gray-600 mt-1">No, start with the free trial. Upgrade when you’re ready.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className={`h-5 w-5 rounded ${group === 'variant' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-blue-600'}`}></div>
              <span>Comet</span>
            </div>
            <div className="text-center">🔬 Educational A/B test • Group <span className="font-mono bg-gray-100 px-2 py-1 rounded">{group}</span></div>
            <div className="flex items-center gap-4">
              <a className="hover:text-gray-700" href="#features">Features</a>
              <a className="hover:text-gray-700" href="#faq">FAQ</a>
              <button onClick={handleSignUpClick} className={`px-3 py-1.5 rounded-md text-white text-xs ${config.ctaColor}`}>Get Comet Pro</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}