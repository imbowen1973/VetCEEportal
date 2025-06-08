import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./prisma";
import nodemailer from 'nodemailer';
import { JWT } from "next-auth/jwt";
import { CustomPrismaAdapter } from "./custom-prisma-adapter";
import { setMagicLink } from "./dev-magic-links";

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
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: false, // Set to false for testing with Mailtrap
        tls: {
          rejectUnauthorized: false // For testing only, not recommended for production
        }
      },
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60, // 10 minutes for new user registration OTPs
      sendVerificationRequest: async ({ identifier, url, provider, token }) => {
        console.log('==========================================');
        console.log('SENDING VERIFICATION EMAIL - DETAILED LOGS');
        console.log('==========================================');
        console.log('Email recipient:', identifier);
        console.log('Verification URL:', url);
        console.log('Token:', token);
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

        if (process.env.NODE_ENV !== 'production') {
          setMagicLink(identifier, url);
        }
        
        // Check if this is for a new user or existing user
        const isNewUser = url.includes('/register');
        
        try {
          // Create transport with detailed logging
          const transport = nodemailer.createTransport({
            ...provider.server,
            debug: true, // Enable debug output
            logger: true // Log information about the transport
          });
          
          console.log('Testing SMTP connection...');
          const verifyResult = await transport.verify();
          console.log('SMTP connection verified:', verifyResult);
          
          // Customize email subject and content based on user type
          const subject = isNewUser 
            ? `Create your VetCEE Portal account` 
            : `Sign in to VetCEE Portal`;
            
          const text = isNewUser
            ? `Welcome to VetCEE Portal!\n\nClick the link below to create your account (valid for 10 minutes):\n\n${url}\n\n`
            : `Sign in to VetCEE Portal\n\n${url}\n\n`;
            
          const html = isNewUser
            ? `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #2563eb; margin-bottom: 20px;">Welcome to VetCEE Portal</h2>
                <p>Click the button below to create your account. This link is valid for 10 minutes.</p>
                <div style="margin: 30px 0;">
                  <a href="${url}" 
                     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                     Create Account
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                  If you didn't request this email, you can safely ignore it.
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                  Or copy and paste this URL into your browser: ${url}
                </p>
              </div>
            `
            : `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #2563eb; margin-bottom: 20px;">VetCEE Portal</h2>
                <p>Click the button below to sign in to your account.</p>
                <div style="margin: 30px 0;">
                  <a href="${url}" 
                     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                     Sign in
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                  If you didn't request this email, you can safely ignore it.
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                  Or copy and paste this URL into your browser: ${url}
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
    }),
  ],
  // Secure JWT configuration with proper error handling
  jwt: {
    // Maximum age of the token
    maxAge: 24 * 60 * 60, // 24 hours
    
    // Custom encode function with error handling for oidc-token-hash issues
    async encode({ secret, token, maxAge }) {
      try {
        // Use the built-in JWT signing from jose
        const { SignJWT } = await import('jose');
        
        // Convert secret to Uint8Array for jose
        const secretBytes = new TextEncoder().encode(secret);
        
        // Create and sign the JWT with proper algorithm
        return await new SignJWT(token as Record<string, any>)
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime(Math.floor(Date.now() / 1000) + (maxAge || 24 * 60 * 60))
          .setJti(crypto.randomUUID())
          .sign(secretBytes);
      } catch (error) {
        console.error('JWT Encode Error:', error);
        // Fallback to simple JSON stringify if encryption fails
        return JSON.stringify(token);
      }
    },
    
    // Custom decode function with error handling
    async decode({ secret, token }) {
      if (!token) return null;
      
      try {
        // Use the built-in JWT verification from jose
        const { jwtVerify } = await import('jose');
        
        // Convert secret to Uint8Array for jose
        const secretBytes = new TextEncoder().encode(secret);
        
        // Verify and decode the JWT
        const { payload } = await jwtVerify(token, secretBytes, {
          algorithms: ['HS256']
        });
        
        return payload as JWT;
      } catch (error) {
        console.error('JWT Decode Error:', error);
        
        // Try to parse as JSON if verification fails (fallback for tokens created with the old method)
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
  debug: true, // Enable debug mode to see detailed logs
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
