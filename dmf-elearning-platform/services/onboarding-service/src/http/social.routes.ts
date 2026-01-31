/**
 * Social API Routes
 */

import type { FastifyInstance } from 'fastify';
import type { FriendshipRepository } from '../state/friendship.repository.js';

export function registerSocialRoutes(
  app: FastifyInstance,
  deps: { friendshipRepo: FriendshipRepository }
): void {
  // POST /api/social/follow/:targetUserId
  app.post<{ Params: { targetUserId: string }; Body: { userId: string } }>(
    '/api/social/follow/:targetUserId',
    async (request, reply) => {
      const { targetUserId } = request.params;
      const { userId } = request.body;

      if (!userId) {
        return reply.code(400).send({ error: 'userId is required' });
      }

      try {
        const friendship = await deps.friendshipRepo.create(userId, targetUserId);
        return reply.code(201).send({
          message: 'Follow request sent successfully!',
          friendship,
        });
      } catch (error) {
        console.error('Error creating friendship:', error);
        return reply.code(500).send({ error: 'Failed to send follow request' });
      }
    }
  );

  // POST /api/social/challenge/:targetUserId
  app.post<{ Params: { targetUserId: string }; Body: { userId: string } }>(
    '/api/social/challenge/:targetUserId',
    async (request, reply) => {
      const { targetUserId } = request.params;
      const { userId } = request.body;

      if (!userId) {
        return reply.code(400).send({ error: 'userId is required' });
      }

      // For now, just return success
      return reply.code(200).send({
        message: `Challenge sent to ${targetUserId}!`,
        challengeId: `challenge-${Date.now()}`,
      });
    }
  );

  // GET /api/social/friends/:userId
  app.get<{ Params: { userId: string } }>(
    '/api/social/friends/:userId',
    async (request, reply) => {
      const { userId } = request.params;

      try {
        const friendships = await deps.friendshipRepo.findByUserId(userId);
        const friends = friendships
          .filter(f => f.status === 'ACCEPTED')
          .map(f => ({
            friendId: f.requesterId === userId ? f.addresseeId : f.requesterId,
            since: f.createdAt,
          }));

        return reply.code(200).send({ friends });
      } catch (error) {
        console.error('Error fetching friends:', error);
        return reply.code(500).send({ error: 'Failed to fetch friends' });
      }
    }
  );

  // POST /api/social/accept/:friendshipId
  app.post<{ Params: { friendshipId: string } }>(
    '/api/social/accept/:friendshipId',
    async (request, reply) => {
      const { friendshipId } = request.params;

      try {
        const friendship = await deps.friendshipRepo.updateStatus(friendshipId, 'ACCEPTED');
        return reply.code(200).send({
          message: 'Friendship accepted!',
          friendship,
        });
      } catch (error) {
        console.error('Error accepting friendship:', error);
        return reply.code(500).send({ error: 'Failed to accept friendship' });
      }
    }
  );
}
