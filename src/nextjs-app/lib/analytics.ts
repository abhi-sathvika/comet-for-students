import { supabase, Click } from './supabase'
import { getSessionId } from './abtest'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

/**
 * Logs click events via backend API
 */
export async function logClick(userId: number, groupId: number, pageUrl?: string) {
  try {
    const sessionId = getSessionId()

    const response = await fetch(`${BACKEND_URL}/log-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        group_id: groupId,
        user_agent: navigator.userAgent,
        ip_address: null // Will be handled by backend
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Click logged successfully:', result)
    return true
  } catch (err) {
    console.error('Failed to log click:', err)
    return false
  }
}

/**
 * Creates or gets a user record via backend API
 */
export async function getOrCreateUser(name: string, email: string, groupId: number = 1) {
  try {
    // Create new user via backend API (backend will handle duplicate checking)
    const response = await fetch(`${BACKEND_URL}/register-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        group_id: groupId
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success) {
      // Return user data in expected format
      return {
        id: result.user_id,
        name: name,
        email: email,
        created_at: new Date().toISOString()
      }
    }

    return null
  } catch (err) {
    console.error('Failed to get/create user:', err)
    return null
  }
}

/**
 * Gets group ID by group name
 * Using simple mapping instead of database calls
 */
export async function getGroupId(groupName: string): Promise<number | null> {
  // Simple mapping based on your database schema
  const groupMapping: { [key: string]: number } = {
    'control': 1,
    'variant': 2
  }
  
  return groupMapping[groupName] || null
}

/**
 * Dub.co link tracking integration (placeholder)
 * Replace with actual Dub.co API calls when ready
 */
export async function trackDubLink(url: string, groupName: string) {
  // This is a placeholder for Dub.co integration
  // Uncomment and implement when you have Dub.co API key

  /*
  try {
    const response = await fetch('https://api.dub.co/links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DUB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        tags: [`abtest_${groupName}`, 'comet_promotion'],
        comments: `A/B Test - ${groupName} group`
      }),
    })

    const data = await response.json()
    return data.shortLink
  } catch (err) {
    console.error('Dub.co tracking error:', err)
    return url
  }
  */

  // For now, return original URL
  console.log(`🔗 Dub.co placeholder: ${url} (group: ${groupName})`)
  return url
}