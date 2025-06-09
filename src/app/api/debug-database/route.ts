// Create: app/api/debug-database/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check what's in our verification tokens collection
    const prismaTokens = await prisma.verificationToken.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20 // Get last 20 tokens
    })
    
    // Get count of all tokens
    const totalTokenCount = await prisma.verificationToken.count()
    
    // Check for tokens with specific email
    const emailTokens = await prisma.verificationToken.findMany({
      where: { email: 'mark.bowen@medicine.vet' },
      orderBy: { createdAt: 'desc' }
    })
    
    // Check for active tokens
    const activeTokens = await prisma.verificationToken.findMany({
      where: {
        status: 'active',
        expires: {
          gt: new Date()
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Get raw MongoDB collection info using $runCommandRaw
    let mongoCollections = null
    try {
      mongoCollections = await prisma.$runCommandRaw({
        listCollections: 1
      })
    } catch (e) {
      console.log('Could not list collections:', e.message)
    }
    
    // Check raw MongoDB tokens
    let rawTokens = null
    try {
      rawTokens = await prisma.$runCommandRaw({
        find: "VerificationToken",
        filter: {},
        limit: 10
      })
    } catch (e) {
      console.log('Could not find raw tokens:', e.message)
    }
    
    const result = {
      databaseInfo: {
        url: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'HIDDEN',
        database: process.env.DATABASE_URL?.split('/').pop() || 'UNKNOWN'
      },
      prismaTokens: {
        total: totalTokenCount,
        recent: prismaTokens.length,
        tokens: prismaTokens
      },
      emailSpecificTokens: {
        count: emailTokens.length,
        tokens: emailTokens
      },
      activeTokens: {
        count: activeTokens.length,
        tokens: activeTokens
      },
      mongoCollections: mongoCollections,
      rawTokens: rawTokens,
      timestamp: new Date().toISOString()
    }
    
    console.log('🔍 [DATABASE DEBUG] Results summary:')
    console.log('- Total tokens:', totalTokenCount)
    console.log('- Email tokens:', emailTokens.length)
    console.log('- Active tokens:', activeTokens.length)
    console.log('- Database:', result.databaseInfo.database)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('🔍 [DATABASE DEBUG] Error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}