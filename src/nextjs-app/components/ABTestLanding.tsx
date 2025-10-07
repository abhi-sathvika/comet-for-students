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
            <p className="text-slate-600">You're just one step away from accessing Comet Pro</p>
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
    <div className={`min-h-screen bg-gradient-to-br ${config.theme.gradient}`}>
      {/* Top Navigation */}
      <nav className="glass border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${group === 'control' ? 'gradient-blue' : 'gradient-emerald'} shadow-lg`}></div>
              <span className="text-2xl font-bold text-slate-900">Comet</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200" href="#features">Features</a>
              <a className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200" href="#testimonials">Testimonials</a>
              <a className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200" href="#faq">FAQ</a>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.theme.accent} border border-slate-200`}>
                <span className="text-xs font-medium text-slate-600">A/B Test:</span>
                <span className={`text-xs font-semibold ${group === 'control' ? 'text-blue-700' : 'text-emerald-700'}`}>
                  {group === 'control' ? 'Control' : 'Variant'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className={`absolute top-20 right-20 h-72 w-72 rounded-full blur-3xl opacity-10 ${group === 'control' ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
          <div className={`absolute bottom-20 left-20 h-96 w-96 rounded-full blur-3xl opacity-5 ${group === 'control' ? 'bg-blue-300' : 'bg-emerald-300'}`}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-left fade-in-left">
              <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${config.theme.accent} border border-slate-200 mb-8`}>
                <div className={`w-2 h-2 rounded-full ${group === 'control' ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`}></div>
                <span className="text-sm font-medium text-slate-700">Exclusive Student Offer</span>
                <span className="text-slate-300">•</span>
                <span className={`text-sm font-semibold ${group === 'control' ? 'text-blue-700' : 'text-emerald-700'}`}>
                  {config.highlight}
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                {config.title}
              </h1>
              
              <p className="text-xl lg:text-2xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
                {config.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12">
                <button
                  onClick={handleSignUpClick}
                  disabled={isLoading}
                  className={`btn-primary ${config.ctaColor} text-lg px-8 py-4 transform transition-all duration-200 hover:scale-105 active:scale-95`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Loading...
                    </div>
                  ) : (
                    config.ctaText
                  )}
                </button>
                <div className="flex items-center gap-2 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium">No credit card required</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-1">50k+</div>
                  <div className="text-sm text-slate-600 font-medium">Active Students</div>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-1">4.9/5</div>
                  <div className="text-sm text-slate-600 font-medium">User Rating</div>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-1">95%</div>
                  <div className="text-sm text-slate-600 font-medium">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative fade-in-right">
              <div className="relative">
                {/* Main Dashboard Preview */}
                <div className="card-elevated overflow-hidden">
                  <div className={`h-16 w-full ${group === 'control' ? 'gradient-blue' : 'gradient-emerald'} flex items-center px-6`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                      <div className="text-white font-semibold">Comet Pro Dashboard</div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    {/* Dashboard Content */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Project Overview</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${config.theme.accent} ${group === 'control' ? 'text-blue-700' : 'text-emerald-700'}`}>
                          Active
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="card p-4">
                          <div className="text-2xl font-bold text-slate-900 mb-1">12</div>
                          <div className="text-sm text-slate-600">Active Projects</div>
                        </div>
                        <div className="card p-4">
                          <div className="text-2xl font-bold text-slate-900 mb-1">8</div>
                          <div className="text-sm text-slate-600">Team Members</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className={`w-3 h-3 rounded-full ${group === 'control' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">Research Paper</div>
                            <div className="text-xs text-slate-500">Due in 3 days</div>
                          </div>
                          <div className="text-xs text-slate-500">85%</div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">Group Presentation</div>
                            <div className="text-xs text-slate-500">Due next week</div>
                          </div>
                          <div className="text-xs text-slate-500">60%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 card p-4 float">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${group === 'control' ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`}></div>
                    <span className="text-sm font-medium text-slate-700">Live Collaboration</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 card p-4 float" style={{animationDelay: '1s'}}>
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${group === 'control' ? 'text-blue-600' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">AI Assistant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="bg-white/60 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Trusted by students at leading universities</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60">
            {['Stanford', 'MIT', 'Harvard', 'Berkeley', 'Yale', 'Princeton'].map((university, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-semibold text-slate-700">{university}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Everything you need to excel
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Purpose-built for coursework, group projects, and landing your next opportunity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {config.features.map((feature, index) => {
              const icons = [
                <svg key="0" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>,
                <svg key="1" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>,
                <svg key="2" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>,
                <svg key="3" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              ]
              
              return (
                <div key={index} className="group card p-8 text-center hover:shadow-xl transition-all duration-300 fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${config.theme.accent} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`${group === 'control' ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {icons[index]}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{feature}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {index === 0 && "Streamline your academic workflow with intelligent project management tools designed for student success."}
                    {index === 1 && "Connect seamlessly with classmates and professors through our advanced collaboration platform."}
                    {index === 2 && "Accelerate your learning with AI-powered insights and personalized study recommendations."}
                    {index === 3 && "Access exclusive resources and mentorship opportunities to advance your career goals."}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Loved by students worldwide
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how Comet Pro is transforming academic experiences across universities.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="card-elevated p-12 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="flex text-yellow-400 text-2xl">
                  {'★★★★★'.split('').map((star, index) => (
                    <span key={index} className="animate-pulse" style={{animationDelay: `${index * 0.1}s`}}>
                      {star}
                    </span>
                  ))}
                </div>
              </div>
              <blockquote className="text-2xl lg:text-3xl text-slate-800 leading-relaxed mb-8 font-medium">
                "Comet Pro completely transformed how I manage my studies. The collaboration features and AI-powered insights saved me hours every week and helped me maintain a 4.0 GPA."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  SM
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900">Sarah Martinez</div>
                  <div className="text-slate-600">Computer Science, Stanford University</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="fade-in-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Questions? We've got answers.
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Everything about eligibility, pricing, and what's included in the student offer.
              </p>
              <button
                onClick={handleSignUpClick}
                disabled={isLoading}
                className={`btn-primary ${config.ctaColor} text-lg px-8 py-4`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Loading...
                  </div>
                ) : (
                  config.ctaText
                )}
              </button>
            </div>
            
            <div className="space-y-6 fade-in-right">
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg ${config.theme.accent} flex items-center justify-center flex-shrink-0 mt-1`}>
                    <svg className={`w-4 h-4 ${group === 'control' ? 'text-blue-600' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Who qualifies for Comet Pro for Students?</h3>
                    <p className="text-slate-600">Anyone with a valid .edu email address or verified student status at an accredited institution.</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg ${config.theme.accent} flex items-center justify-center flex-shrink-0 mt-1`}>
                    <svg className={`w-4 h-4 ${group === 'control' ? 'text-blue-600' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Can I cancel anytime?</h3>
                    <p className="text-slate-600">Yes, you can cancel your subscription in one click—no questions asked, no hidden fees.</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg ${config.theme.accent} flex items-center justify-center flex-shrink-0 mt-1`}>
                    <svg className={`w-4 h-4 ${group === 'control' ? 'text-blue-600' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Do I need a credit card?</h3>
                    <p className="text-slate-600">No credit card required to start your free trial. Upgrade when you're ready to unlock premium features.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-10 w-10 rounded-xl ${group === 'control' ? 'gradient-blue' : 'gradient-emerald'} shadow-lg`}></div>
                <span className="text-2xl font-bold">Comet</span>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-md">
                Empowering students worldwide with professional-grade tools for academic success and career advancement.
              </p>
              <div className="flex items-center gap-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700`}>
                  <span className="text-xs font-medium text-slate-400">A/B Test:</span>
                  <span className={`text-xs font-semibold ${group === 'control' ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {group === 'control' ? 'Control' : 'Variant'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-300 hover:text-white transition-colors duration-200">Features</a></li>
                <li><a href="#testimonials" className="text-slate-300 hover:text-white transition-colors duration-200">Testimonials</a></li>
                <li><a href="#faq" className="text-slate-300 hover:text-white transition-colors duration-200">FAQ</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">Pricing</a></li>
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
                className={`btn-primary ${config.ctaColor} text-sm px-6 py-2`}
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