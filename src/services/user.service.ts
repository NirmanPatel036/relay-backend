import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Ensures a user exists in the database. If not, creates them.
   * This is useful for syncing Supabase Auth users with the application database.
   */
  async ensureUserExists(userId: string, email?: string, name?: string) {
    try {
      // Check if user exists
      const existingUser = await prisma.users.findUnique({
        where: { id: userId },
      });

      if (existingUser) {
        return existingUser;
      }

      // Create user if they don't exist
      return await prisma.users.create({
        data: {
          id: userId,
          email: email || `user-${userId}@example.com`, // Fallback email
          name: name || 'User',
          tier: 'free',
        },
      });
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      throw error;
    }
  }

  /**
   * Get or create a user
   */
  async upsertUser(userId: string, email: string, name?: string) {
    return await prisma.users.upsert({
      where: { id: userId },
      update: {
        email,
        name: name || undefined,
        updated_at: new Date(),
      },
      create: {
        id: userId,
        email,
        name: name || 'User',
        tier: 'free',
      },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    return await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: { name?: string; email?: string }) {
    return await prisma.users.update({
      where: { id: userId },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }
}
