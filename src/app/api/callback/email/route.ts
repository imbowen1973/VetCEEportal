// Create: app/api/auth/callback/email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('🔗 [EMAIL CALLBACK] Route called!')
  console.log('🔗 [EMAIL CALLBACK] Full URL:', request.url)
  
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const callbackUrl = searchParams.get('callbackUrl') || '/'
    
    console.log('🔗 [EMAIL CALLBACK] Params:', { token, email, callbackUrl })
    
    if (!token || !email) {
      console.log('❌ [EMAIL CALLBACK] Missing token or email')
      return new NextResponse('Missing token or email', { status: 400 })
    }
    
    // Verify the token exists and is valid
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: token,
        email: email,
        expires: { gt: new Date() },
        status: 'active'
      }
    })
    
    console.log('🔍 [EMAIL CALLBACK] Token search result:', verificationToken ? 'Found' : 'Not found')
    
    if (!verificationToken) {
      console.log('❌ [EMAIL CALLBACK] Invalid or expired token')
      return new NextResponse('Invalid or expired token', { status: 400 })
    }
    
    console.log('✅ [EMAIL CALLBACK] Valid token found')
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: email }
    })
    
    if (!user) {
      console.log('❌ [EMAIL CALLBACK] User not found')
      return new NextResponse('User not found', { status: 404 })
    }
    
    console.log('👤 [EMAIL CALLBACK] User found:', user.email, 'Roles:', user.roles)
    
    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    })
    
    console.log('🗑️ [EMAIL CALLBACK] Token deleted')
    
    // For now, just redirect with a success message
    const redirectUrl = new URL(callbackUrl)
    redirectUrl.searchParams.set('auth', 'success')
    redirectUrl.searchParams.set('user', user.email)
    redirectUrl.searchParams.set('roles', user.roles.join(','))
    
    console.log('🔄 [EMAIL CALLBACK] Redirecting to:', redirectUrl.toString())
    
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('❌ [EMAIL CALLBACK] Error:', error)
    return new NextResponse(`Callback error: ${error.message}`, { status: 500 })
  }
}