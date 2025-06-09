// Create this file: app/api/test-smtp/route.ts (for App Router)
// OR pages/api/test-smtp.ts (for Pages Router)

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing SMTP configuration...')
    
    // Log environment variables (without exposing password)
    console.log('SMTP Config:', {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER,
      from: process.env.EMAIL_FROM,
      passwordSet: !!process.env.EMAIL_SERVER_PASSWORD
    })

    // Create transport with the same config as NextAuth
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

    console.log('🔍 Verifying SMTP connection...')
    const verifyResult = await transport.verify()
    console.log('✅ SMTP verification result:', verifyResult)

    console.log('📧 Sending test email...')
    const result = await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'test@vetcee.org', // Test email address
      subject: 'SMTP Test from VetCEE Portal',
      text: 'This is a test email to verify SMTP configuration.',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">SMTP Test Successful</h2>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        </div>
      `
    })

    console.log('✅ Test email sent successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'SMTP test successful',
      messageId: result.messageId,
      response: result.response
    })

  } catch (error) {
    console.error('❌ SMTP test failed:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    })

    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      }
    }, { status: 500 })
  }
}

// For Pages Router, use this instead:
/*
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Same logic as above, but return with res.json() instead of NextResponse.json()
}
*/