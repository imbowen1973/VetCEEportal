import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminTokens from './page';

export default async function AdminTokensPage() {
  const session = await auth();
  
  // Check if user is admin
  if (!session?.user?.roles?.some(role => role === 'AdminFull' || role === 'AdminReadOnly')) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  
  // Fetch expired tokens
  const expiredTokens = await prisma.verificationToken.findMany({
    where: {
      status: 'expired',
    },
    orderBy: {
      expires: 'desc',
    },
  });
  
  // Convert dates to strings for serialization
  const serializedTokens = expiredTokens.map(token => ({
    ...token,
    expires: token.expires.toISOString(),
    createdAt: token.createdAt.toISOString(),
  }));
  
  return <AdminTokens tokens={serializedTokens} />;
}
