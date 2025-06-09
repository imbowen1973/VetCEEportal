// Create: app/api/send-email/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    
    console.log('🚨 [DIRECT EMAIL] Starting email send for:', email)
    
    // Generate token
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    console.log('🔧 [DIRECT EMAIL] Generated token:', token)
    
    // Check if user exists to determine redirect
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { roles: true }
    })
    
    // Save token to database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        email: email,
        token: token,
        expires: expires,
        status: "active",
      },
    })
    
    console.log('✅ [DIRECT EMAIL] Token saved to database')
    
    // Create magic link
    const baseUrl = 'http://localhost:3000'
    const callbackUrl = user?.roles?.includes('AdminFull') ? '/admin/dashboard' : '/dashboard'
    const magicLink = `${baseUrl}/api/auth/callback/email?callbackUrl=${encodeURIComponent(baseUrl + callbackUrl)}&token=${token}&email=${encodeURIComponent(email)}`
    
    console.log('🔗 [DIRECT EMAIL] Magic link:', magicLink)
    
    // Create email transport
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      secure: false,
      tls: {
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    })
    
    console.log('🔧 [DIRECT EMAIL] Testing SMTP connection...')
    await transport.verify()
    console.log('✅ [DIRECT EMAIL] SMTP verified')
    
    // Send email
    const result = await transport.sendMail({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Sign in to VetCEE Portal',
      text: `Sign in to VetCEE Portal\n\n${magicLink}\n\n`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">VetCEE Portal</h2>
          <p>Click the button below to sign in to your account.</p>
          <div style="margin: 30px 0;">
            <a href="${magicLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
               Sign in
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this email, you can safely ignore it.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Or copy and paste this URL into your browser: ${magicLink}
          </p>
        </div>
      `
    })
    
    console.log('🎉 [DIRECT EMAIL] Email sent successfully!', result.messageId)
    
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      magicLink: magicLink // For testing
    })
    
  } catch (error) {
    console.error('❌ [DIRECT EMAIL] Error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}