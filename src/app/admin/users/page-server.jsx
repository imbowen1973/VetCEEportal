import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminUsers from './page';

export default async function AdminUsersPage() {
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
  
  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      organization: true,
    },
  });
  
  // Serialize dates for JSON
  const serializedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    emailVerified: user.emailVerified?.toISOString() || null,
    organization: user.organization ? {
      ...user.organization,
      createdAt: user.organization.createdAt.toISOString(),
      updatedAt: user.organization.updatedAt.toISOString(),
    } : null,
  }));
  
  const isAdminFull = session.user.roles.includes('AdminFull');
  
  return <AdminUsers users={serializedUsers} isAdminFull={isAdminFull} />;
}
