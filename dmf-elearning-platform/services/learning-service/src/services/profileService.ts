import { prismaClient } from '../lib/prisma';

export type ProfileUpdateInput = {
  name?: string;
  timezone?: string;
};

type EnsureUserInput = {
  id: string;
  email?: string;
  name?: string;
};

function fallbackEmailForUser(id: string) {
  return `${id}@local-auth.user`;
}

export async function ensureUserProfile(identity: EnsureUserInput) {
  const existing = await prismaClient.user.findUnique({
    where: { id: identity.id },
  });

  if (existing) {
    if (identity.email && identity.email !== existing.email) {
      return prismaClient.user.update({
        where: { id: identity.id },
        data: { email: identity.email },
      });
    }
    return existing;
  }

  return prismaClient.user.create({
    data: {
      id: identity.id,
      email: identity.email ?? fallbackEmailForUser(identity.id),
      name: identity.name ?? null,
    },
  });
}

export async function getProfile(userId: string, identity: { email?: string; name?: string }) {
  const user = await ensureUserProfile({
    id: userId,
    email: identity.email,
    name: identity.name,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    timezone: user.timezone,
    streak: {
      current: user.currentStreak,
      longest: user.longestStreak,
      lastActivityDate: user.lastActivityDate,
    },
    preferences: {
      timezone: user.timezone,
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateProfile(
  userId: string,
  identity: { email?: string; name?: string },
  input: ProfileUpdateInput
) {
  await ensureUserProfile({
    id: userId,
    email: identity.email,
    name: identity.name,
  });

  const updated = await prismaClient.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      timezone: input.timezone,
    },
  });

  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    timezone: updated.timezone,
    streak: {
      current: updated.currentStreak,
      longest: updated.longestStreak,
      lastActivityDate: updated.lastActivityDate,
    },
    preferences: {
      timezone: updated.timezone,
    },
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}
