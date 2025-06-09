import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./prisma";
import nodemailer from 'nodemailer';
import { JWT } from "next-auth/jwt";
import { CustomPrismaAdapter } from "./custom-prisma-adapter";

console.log('🔧 [AUTH.TS] Loading auth configuration');
console.log('🔧 [AUTH.TS] Environment check:', {
  EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
  EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
  EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER?.substring(0, 5) + '***',
  EMAIL_FROM: process.env.EMAIL_FROM,
  NODE_ENV: process.env.NODE_ENV
});

// Set runtime to nodejs to avoid Edge Runtime issues
export const runtime = "nodejs";

// Extend the session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles?: string[];
      status?: string;
      organizationId?: string | null;
    };
    maxAge?: number;
  }

  interface User {
    id: string;
    roles: string[];
    status: string;
    organizationId?: string | null;
  }
}

// Extend the adapter types
declare module "next-auth/adapters" {
  interface AdapterUser {
    id: string;
    roles: string[];
    status: string;
    organizationId?: string | null;
  }
}

// Create auth configuration with Custom Prisma adapter
export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours by default
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🚨 [AUTH.TS] signIn callback called with:', { user, account, profile, email, credentials });
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.roles) {
        session.user.roles = token.roles as string[];
      }
      if (token.status) {
        session.user.status = token.status as string;
      }
      if (token.organizationId) {
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.status = user.status;
        token.organizationId = user.organizationId;
      }
      return token;
    }
  },
  providers: [
    (() => {
      console.log('🚨 [AUTH.TS] CREATING EMAIL PROVIDER - THIS SHOULD RUN ONCE');
      
      return EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
          secure: false,
          tls: {
            rejectUnauthorized: false
          }
        },
        from: process.env.EMAIL_FROM,
        maxAge: 10 * 60,
        generateVerificationToken: () => {
          const token = crypto.randomUUID()
          console.log('🔧 [AUTH.TS] 🚨 generateVerificationToken called, generating:', token)
          return token
        },
        sendVerificationRequest: async ({ identifier, url, provider, token, request }) => {
          console.log('🚨🚨🚨 CUSTOM EMAIL FUNCTION CALLED - WE MADE IT!!! 🚨🚨🚨');
          console.log('🚨🚨🚨 Email recipient:', identifier);
          console.log('🚨🚨🚨 Token:', token);
          console.log('🚨🚨🚨 URL:', url);
          console.log('==========================================');
          console.log('SENDING VERIFICATION EMAIL - DETAILED LOGS');
          console.log('==========================================');
          console.log('Email recipient:', identifier);
          console.log('Original URL:', url);
          console.log('Token:', token);

          // Get proper base URL for the current environment
          const forwardedHost = request?.headers['x-forwarded-host'];
          const host = request?.headers['host'];

          // Use localhost for development
          let baseUrl = 'http://localhost:3000';
          
          // Only override for production
          if (process.env.NODE_ENV === 'production') {
            baseUrl = 'https://your-domain.com'; // Replace with your actual domain
          }

          // Extract the callback path and parameters from the original URL
          const urlObj = new URL(url);
          const callbackPath = urlObj.pathname;
          const searchParams = urlObj.searchParams;

          // Reconstruct the URL with the correct base URL
          const fixedUrl = `${baseUrl}${callbackPath}?${searchParams.toString()}`;

          console.log('Fixed URL:', fixedUrl);
          console.log('Email provider config:', {
            server: {
              host: provider.server.host,
              port: provider.server.port,
              auth: {
                user: provider.server.auth.user,
                // Password redacted for security
              },
              secure: provider.server.secure,
              tls: provider.server.tls
            },
            from: provider.from
          });

          // Check if this is for a new user or existing user
          const isNewUser = url.includes('/register');
          
          try {
            // Delete any existing verification tokens for this email to ensure a fresh send
            console.log('🗑️ Cleaning up existing verification tokens for:', identifier);
            try {
              const deleteResult = await prisma.verificationToken.deleteMany({
                where: {
                  email: identifier
                }
              });
              console.log('✅ Existing tokens cleaned up, deleted count:', deleteResult.count);
            } catch (cleanupError) {
              console.log('⚠️ Token cleanup failed:', cleanupError.message);
            }
            
            // Create transport with optional debug logging in non-production
            const transport = nodemailer.createTransport({
              ...provider.server,
              ...(process.env.NODE_ENV !== 'production'
                ? { debug: true, logger: true }
                : {})
            });
            
            console.log('Testing SMTP connection...');
            const verifyResult = await transport.verify();
            console.log('SMTP connection verified:', verifyResult);
            
            // Customize email subject and content based on user type
            const subject = isNewUser 
              ? `Create your VetCEE Portal account` 
              : `Sign in to VetCEE Portal`;
              
            const text = isNewUser
              ? `Welcome to VetCEE Portal!\n\nClick the link below to create your account (valid for 10 minutes):\n\n${fixedUrl}\n\n`
              : `Sign in to VetCEE Portal\n\n${fixedUrl}\n\n`;
              
            const html = isNewUser
              ? `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                  <h2 style="color: #2563eb; margin-bottom: 20px;">Welcome to VetCEE Portal</h2>
                  <p>Click the button below to create your account. This link is valid for 10 minutes.</p>
                  <div style="margin: 30px 0;">
                    <a href="${fixedUrl}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                       Create Account
                    </a>
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">
                    If you didn't request this email, you can safely ignore it.
                  </p>
                  <p style="color: #6b7280; font-size: 14px;">
                    Or copy and paste this URL into your browser: ${fixedUrl}
                  </p>
                </div>
              `
              : `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                  <h2 style="color: #2563eb; margin-bottom: 20px;">VetCEE Portal</h2>
                  <p>Click the button below to sign in to your account.</p>
                  <div style="margin: 30px 0;">
                    <a href="${fixedUrl}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                       Sign in
                    </a>
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">
                    If you didn't request this email, you can safely ignore it.
                  </p>
                  <p style="color: #6b7280; font-size: 14px;">
                    Or copy and paste this URL into your browser: ${fixedUrl}
                  </p>
                </div>
              `;
            
            console.log('Sending email...');
            const result = await transport.sendMail({
              to: identifier,
              from: provider.from,
              subject,
              text,
              html
            });
            
            console.log('Email sent successfully:', result);
            console.log('==========================================');
          } catch (error) {
            console.error('==========================================');
            console.error('EMAIL SENDING ERROR - DETAILED LOGS');
            console.error('==========================================');
            console.error('Error type:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('Error code:', error.code);
            console.error('Error command:', error.command);
            console.error('Error response:', error.response);
            console.error('Error responseCode:', error.responseCode);
            console.error('==========================================');
            throw new Error(`Failed to send verification email: ${error.message}`);
          }
        }
      });
    })(),
  ],
  jwt: {
    maxAge: 24 * 60 * 60,
    async encode({ secret, token, maxAge }) {
      try {
        const { SignJWT } = await import('jose');
        const secretBytes = new TextEncoder().encode(secret);
        return await new SignJWT(token as Record<string, any>)
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime(Math.floor(Date.now() / 1000) + (maxAge || 24 * 60 * 60))
          .setJti(crypto.randomUUID())
          .sign(secretBytes);
      } catch (error) {
        console.error('JWT Encode Error:', error);
        return JSON.stringify(token);
      }
    },
    async decode({ secret, token }) {
      if (!token) return null;
      try {
        const { jwtVerify } = await import('jose');
        const secretBytes = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, secretBytes, {
          algorithms: ['HS256']
        });
        return payload as JWT;
      } catch (error) {
        console.error('JWT Decode Error:', error);
        try {
          return JSON.parse(token);
        } catch (parseError) {
          console.error('JWT Parse Error:', parseError);
          return null;
        }
      }
    }
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.roles) {
        session.user.roles = token.roles as string[];
      }
      if (token.status) {
        session.user.status = token.status as string;
      }
      if (token.organizationId) {
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.status = user.status;
        token.organizationId = user.organizationId;
      }
      return token;
    }
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  debug: true,
  events: {
    async signIn(message) {
      console.log('🚨 [AUTH.TS] EVENT: signIn', message);
    },
    async createUser(message) {
      console.log('🚨 [AUTH.TS] EVENT: createUser', message);
    },
  },
};

console.log('🔧 [AUTH.TS] Creating EmailProvider with custom sendVerificationRequest');

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);