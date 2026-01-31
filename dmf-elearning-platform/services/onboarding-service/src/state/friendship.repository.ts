/**
 * In-Memory Friendship Repository
 */

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'PENDING' | 'ACCEPTED';
  createdAt: Date;
}

export interface FriendshipRepository {
  create(requesterId: string, addresseeId: string): Promise<Friendship>;
  findByUserId(userId: string): Promise<Friendship[]>;
  updateStatus(id: string, status: 'ACCEPTED'): Promise<Friendship>;
}

class InMemoryFriendshipRepository implements FriendshipRepository {
  private store = new Map<string, Friendship>();

  async create(requesterId: string, addresseeId: string): Promise<Friendship> {
    const friendship: Friendship = {
      id: `friendship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      requesterId,
      addresseeId,
      status: 'PENDING',
      createdAt: new Date(),
    };
    this.store.set(friendship.id, friendship);
    return friendship;
  }

  async findByUserId(userId: string): Promise<Friendship[]> {
    return Array.from(this.store.values()).filter(
      f => f.requesterId === userId || f.addresseeId === userId
    );
  }

  async updateStatus(id: string, status: 'ACCEPTED'): Promise<Friendship> {
    const friendship = this.store.get(id);
    if (!friendship) throw new Error('Friendship not found');
    friendship.status = status;
    return friendship;
  }
}

export function createInMemoryFriendshipRepository(): FriendshipRepository {
  return new InMemoryFriendshipRepository();
}
