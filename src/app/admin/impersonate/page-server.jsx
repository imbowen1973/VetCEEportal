import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminImpersonate from './page';

export default async function AdminImpersonatePage() {
  const session = await auth();
  
  // Check if user is AdminFull
  if (!session?.user?.roles?.includes('AdminFull')) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  
  // Fetch all Provider users
  const providers = await prisma.user.findMany({
    where: {
      roles: {
        has: 'Provider',
      },
      status: 'approved',
    },
    orderBy: {
      name: 'asc',
    },
    include: {
      organization: true,
    },
  });
  
  return <AdminImpersonate providers={providers} />;
}
