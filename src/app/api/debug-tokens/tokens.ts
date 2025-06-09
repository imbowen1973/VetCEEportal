// Create: app/api/debug-tokens/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Dev only' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'mark.bowen@medicine.vet'
    
    console.log('🔍 [DEBUG] Checking MongoDB for email:', email)
    
    // Get all tokens for this email
    const allTokens = await prisma.verificationToken.findMany({
      where: { email }
    })
    
    // Get active tokens for this email
    const activeTokens = await prisma.verificationToken.findMany({
      where: {
        email,
        status: 'active',
        expires: {
          gt: new Date()
        }
      }
    })
    
    // Get all tokens regardless of email
    const totalTokens = await prisma.verificationToken.findMany({
      take: 10, // Limit to 10 for debugging
      orderBy: { createdAt: 'desc' }
    })
    
    const result = {
      email,
      currentTime: new Date().toISOString(),
      tokensForEmail: {
        count: allTokens.length,
        tokens: allTokens
      },
      activeTokensForEmail: {
        count: activeTokens.length,
        tokens: activeTokens
      },
      recentTokensInDB: {
        count: totalTokens.length,
        tokens: totalTokens
      }
    }
    
    console.log('🔍 [DEBUG] Results:', JSON.stringify(result, null, 2))
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('🔍 [DEBUG] Error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}

export async function DELETE() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Dev only' }, { status: 403 })
  }

  try {
    console.log('🗑️ [DEBUG] Clearing all verification tokens...')
    
    const result = await prisma.verificationToken.deleteMany({})
    
    console.log('🗑️ [DEBUG] Cleared verification tokens:', result.count)
    
    return NextResponse.json({
      success: true,
      message: `Cleared ${result.count} verification tokens`,
      count: result.count
    })
  } catch (error) {
    console.error('🗑️ [DEBUG] Error clearing tokens:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}