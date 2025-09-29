import { supabase, Click } from './supabase'
import { getSessionId } from './abtest'

/**
 * Logs click events to Supabase database
 */
export async function logClick(userId: number, groupId: number, pageUrl?: string) {
  try {
    const sessionId = getSessionId()

    const clickData: Omit<Click, 'id'> = {
      user_id: userId,
      group_id: groupId,
      session_id: sessionId,
      page_url: pageUrl || window.location.href
    }

    const { data, error } = await supabase
      .from('clicks')
      .insert([clickData])
      .select()

    if (error) {
      console.error('Error logging click:', error)
      return false
    }

    console.log('✅ Click logged successfully:', data)
    return true
  } catch (err) {
    console.error('Failed to log click:', err)
    return false
  }
}

/**
 * Creates or gets a user record
 */
export async function getOrCreateUser(name: string, email: string) {
  try {
    // First, try to find existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      return existingUser
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ name, email }])
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return null
    }

    return newUser
  } catch (err) {
    console.error('Failed to get/create user:', err)
    return null
  }
}

/**
 * Gets group ID by group name
 */
export async function getGroupId(groupName: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('id')
      .eq('group_name', groupName)
      .single()

    if (error || !data) {
      console.error('Error getting group ID:', error)
      return null
    }

    return data.id
  } catch (err) {
    console.error('Failed to get group ID:', err)
    return null
  }
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