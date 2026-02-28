import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { devLog } from '@/lib/devLog'

export async function POST() {
  try {
    const supabase = createServerClient()
    await supabase.auth.signOut()
    
    devLog('[SIGNOUT] Server session cleared')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SIGNOUT] Error:', error)
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
  }
}
