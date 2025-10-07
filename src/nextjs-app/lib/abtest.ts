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
      title: "Elevate Your Academic Journey",
      subtitle: "Professional-grade tools designed specifically for student success and career readiness",
      ctaText: "Start Free Trial",
      ctaColor: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl",
      features: [
        "Advanced Project Management",
        "Real-time Collaboration Suite",
        "Professional Templates Library",
        "Career Development Tools"
      ],
      highlight: "50% Student Discount",
      theme: {
        primary: "blue",
        accent: "blue-50",
        gradient: "from-blue-50 to-blue-100",
        cardBg: "bg-white",
        textPrimary: "text-slate-800",
        textSecondary: "text-slate-600"
      }
    },
    variant: {
      title: "Accelerate Your Success",
      subtitle: "Join 50,000+ students who've transformed their academic performance with our comprehensive platform",
      ctaText: "Get Started Today",
      ctaColor: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl",
      features: [
        "AI-Powered Study Assistant",
        "Smart Collaboration Hub",
        "Premium Resource Access",
        "Mentorship Network"
      ],
      highlight: "60% Off + Free Trial",
      theme: {
        primary: "emerald",
        accent: "emerald-50",
        gradient: "from-emerald-50 to-teal-50",
        cardBg: "bg-white",
        textPrimary: "text-slate-800",
        textSecondary: "text-slate-600"
      }
    }
  }

  return configs[group]
}