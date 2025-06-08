import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking for existing admin user...');
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'mark.bowen@medicine.vet',
      },
    });

    if (existingUser) {
      console.log('Updating existing user to admin role...');
      const updatedUser = await prisma.user.update({
        where: {
          email: 'mark.bowen@medicine.vet',
        },
        data: {
          roles: ['ADMIN'],
          status: 'APPROVED',
        },
      });
      console.log('Updated user to admin:', updatedUser);
    } else {
      console.log('Creating new admin user...');
      const newUser = await prisma.user.create({
        data: {
          email: 'mark.bowen@medicine.vet',
          name: 'Mark Bowen',
          roles: ['ADMIN'],
          status: 'APPROVED',
        },
      });
      console.log('Created new admin user:', newUser);
    }

    console.log('Admin user setup complete');
  } catch (error) {
    console.error('Error setting up admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
