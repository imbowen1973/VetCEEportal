import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Profile from './page';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session || !session.user) {
    return <Profile user={null} organization={null} />;
  }
  
  // Fetch user with organization details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });
  
  // Serialize data for client component
  const serializedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    emailVerified: user.emailVerified?.toISOString() || null,
  };
  
  const serializedOrg = user?.organization ? {
    ...user.organization,
    createdAt: user.organization.createdAt.toISOString(),
    updatedAt: user.organization.updatedAt.toISOString(),
  } : null;
  
  return <Profile user={serializedUser} organization={serializedOrg} />;
}
