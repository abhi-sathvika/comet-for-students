import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'

export type ABTestGroup = 'control' | 'variant'

export interface ABTestConfig {
  testName: string
  splitRatio: number // 0.5 = 50/50 split
  groups: {
    control: string
    variant: string
  }
}

// Default A/B test configuration
export const COMET_ABTEST_CONFIG: ABTestConfig = {
  testName: 'comet_promo_test',
  splitRatio: 0.5,
  groups: {
    control: 'control',
    variant: 'variant'
  }
}

/**
 * Assigns user to A/B test group based on session
 * Uses cookies to maintain consistent assignment
 */
export function getABTestGroup(testName: string = COMET_ABTEST_CONFIG.testName): ABTestGroup {
  const cookieName = `abtest_${testName}`

  // Check if user already has an assignment
  let assignedGroup = Cookies.get(cookieName) as ABTestGroup

  if (!assignedGroup) {
    // Generate new assignment
    const random = Math.random()
    assignedGroup = random < COMET_ABTEST_CONFIG.splitRatio ? 'control' : 'variant'

    // Store assignment in cookie (expires in 30 days)
    Cookies.set(cookieName, assignedGroup, {
      expires: 30,
      sameSite: 'lax'
    })
  }

  return assignedGroup
}

/**
 * Gets or creates a session ID for tracking
 */
export function getSessionId(): string {
  const cookieName = 'session_id'
  let sessionId = Cookies.get(cookieName)

  if (!sessionId) {
    sessionId = uuidv4()
    Cookies.set(cookieName, sessionId, {
      expires: 1, // 1 day
      sameSite: 'lax'
    })
  }

  return sessionId
}

/**
 * Tracks A/B test assignment for analytics
 */
export function trackABTestAssignment(group: ABTestGroup, testName: string = COMET_ABTEST_CONFIG.testName) {
  // This could integrate with analytics services like Google Analytics, Mixpanel, etc.
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ab_test_assignment', {
      test_name: testName,
      test_group: group,
      custom_parameter: 'comet_promotion'
    })
  }

  // Console log for development
  console.log(`🧪 A/B Test Assignment: ${testName} -> ${group}`)
}

/**
 * Gets group-specific configuration
 */
export function getGroupConfig(group: ABTestGroup) {
  const configs = {
    control: {
      title: "Browse Smarter with",
      titleHighlight: "Comet",
      subtitle: "The AI-powered browser designed for students. Get instant answers, research faster, and learn more efficiently.",
      ctaText: "Get Started Free",
      ctaSecondary: "Watch Demo",
      ctaColor: "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 shadow-lg hover:shadow-xl",
      features: [
        "AI-Powered Search",
        "Lightning Fast",
        "Student-Optimized",
        "Privacy First"
      ],
      featureDescriptions: [
        "Get instant, accurate answers powered by advanced AI",
        "Browse smarter with blazing-fast performance",
        "Built specifically for academic research and learning",
        "Your data stays private, always"
      ],
      highlight: "50K+ Students",
      stats: [
        { number: "50K+", label: "Students" },
        { number: "100+", label: "Universities" }
      ],
      theme: {
        primary: "blue",
        accent: "bg-blue-50",
        gradient: "from-blue-50 to-teal-50",
        cardBg: "bg-white",
        textPrimary: "text-slate-800",
        textSecondary: "text-slate-600",
        heroGradient: "from-blue-500 to-teal-500"
      }
    },
    variant: {
      title: "Why Students Love",
      titleHighlight: "Comet",
      subtitle: "Everything you need to supercharge your academic journey",
      ctaText: "Get Started Free",
      ctaSecondary: "Watch Demo",
      ctaColor: "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 shadow-lg hover:shadow-xl",
      features: [
        "AI-Powered Search",
        "Lightning Fast",
        "Student-Optimized",
        "Privacy First"
      ],
      featureDescriptions: [
        "Get instant, accurate answers powered by advanced AI",
        "Browse smarter with blazing-fast performance",
        "Built specifically for academic research and learning",
        "Your data stays private, always"
      ],
      highlight: "50K+ Students",
      stats: [
        { number: "50K+", label: "Students" },
        { number: "100+", label: "Universities" }
      ],
      theme: {
        primary: "blue",
        accent: "bg-blue-50",
        gradient: "from-blue-50 to-teal-50",
        cardBg: "bg-white",
        textPrimary: "text-slate-800",
        textSecondary: "text-slate-600",
        heroGradient: "from-blue-500 to-teal-500"
      }
    }
  }

  return configs[group]
}