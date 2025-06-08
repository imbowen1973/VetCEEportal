import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Set runtime to nodejs to avoid Edge Runtime issues
export const runtime = "nodejs";

// Use the recommended NextAuth pattern
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
