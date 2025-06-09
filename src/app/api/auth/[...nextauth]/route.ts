import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Add this debug logging
console.log('🔧 [NEXTAUTH ROUTE] Loading NextAuth API route');
console.log('🔧 [NEXTAUTH ROUTE] authOptions loaded:', !!authOptions);
console.log('🔧 [NEXTAUTH ROUTE] Providers count:', authOptions.providers?.length);
console.log('🔧 [NEXTAUTH ROUTE] Email provider exists:', !!authOptions.providers?.find(p => p.id === 'email'));

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };