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
      title: "🌟 Get Comet Pro for Students!",
      subtitle: "Unlock premium features designed for student success",
      ctaText: "Sign Up Now",
      ctaColor: "bg-blue-600 hover:bg-blue-700",
      features: [
        "Free premium templates",
        "Advanced collaboration tools",
        "Priority support",
        "Student-exclusive pricing"
      ],
      highlight: "50% off for students"
    },
    variant: {
      title: "🚀 Transform Your Studies with Comet Pro!",
      subtitle: "Join thousands of students already boosting their productivity",
      ctaText: "Get Started Free →",
      ctaColor: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      features: [
        "AI-powered study tools",
        "Real-time collaboration",
        "24/7 expert support",
        "Exclusive student discounts"
      ],
      highlight: "Limited time: 60% off + 7-day free trial"
    }
  }

  return configs[group]
}