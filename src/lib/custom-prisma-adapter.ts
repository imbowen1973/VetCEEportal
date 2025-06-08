import { PrismaClient } from "@prisma/client";
import { Adapter } from "next-auth/adapters";

/**
 * Custom Prisma Adapter for NextAuth that handles the schema mismatch
 * between our custom VerificationToken model and NextAuth's expected model
 */
export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    createUser: (data) => {
      return prisma.user.create({
        data,
      });
    },
    getUser: (id) => {
      return prisma.user.findUnique({
        where: { id },
      });
    },
    getUserByEmail: (email) => {
      return prisma.user.findUnique({
        where: { email },
      });
    },
    async getUserByAccount(provider_providerAccountId) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      return account?.user ?? null;
    },
    updateUser: (data) => {
      return prisma.user.update({
        where: { id: data.id },
        data,
      });
    },
    deleteUser: (userId) => {
      return prisma.user.delete({
        where: { id: userId },
      });
    },
    linkAccount: (data) => {
      return prisma.account.create({
        data,
      });
    },
    unlinkAccount: (provider_providerAccountId) => {
      return prisma.account.delete({
        where: { provider_providerAccountId },
      });
    },
    async getSessionAndUser(sessionToken) {
      const userAndSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session };
    },
    createSession: (data) => {
      return prisma.session.create({
        data,
      });
    },
    updateSession: (data) => {
      return prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      });
    },
    deleteSession: (sessionToken) => {
      return prisma.session.delete({
        where: { sessionToken },
      });
    },
    // Custom implementation for createVerificationToken to handle schema mismatch
    async createVerificationToken(data) {
      // Map NextAuth's expected fields to our custom schema
      const { identifier, token, expires } = data;
      
      // Create the verification token with our custom schema
      const verificationToken = await prisma.verificationToken.create({
        data: {
          identifier,
          email: identifier, // Use identifier (email) for our email field
          token,
          expires,
          status: "active",
        },
      });
      
      // Return only the fields NextAuth expects
      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      };
    },
    // Custom implementation for useVerificationToken to handle schema mismatch
    async useVerificationToken(params) {
      try {
        // Find the token using our custom schema
        const verificationToken = await prisma.verificationToken.findFirst({
          where: {
            token: params.token,
            email: params.identifier,
            expires: { gt: new Date() },
          },
        });
        
        if (!verificationToken) return null;
        
        // Delete the token
        await prisma.verificationToken.delete({
          where: { id: verificationToken.id },
        });
        
        // Return only the fields NextAuth expects
        return {
          identifier: verificationToken.email,
          token: verificationToken.token,
          expires: verificationToken.expires,
        };
      } catch (error) {
        // If token is not found or already used, return null
        return null;
      }
    },
  };
}
