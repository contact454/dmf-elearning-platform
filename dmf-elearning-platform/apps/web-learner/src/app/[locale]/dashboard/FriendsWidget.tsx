'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Friend {
  friendId: string;
  since: string;
}

export function FriendsWidget({ userId }: { userId: string }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/social/friends/${userId}`);
      const data = await response.json();
      setFriends(data.friends || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load friends:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-medium text-slate-600 mb-4">👥 Friends Activity</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-slate-600">👥 Friends Activity</h2>
        <span className="text-sm text-slate-400">{friends.length} friends</span>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm mb-4">No friends yet</p>
          <a
            href="/dashboard/leaderboard"
            className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all"
          >
            Find Friends on Leaderboard
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {friends.slice(0, 5).map((friend, index) => (
            <motion.div
              key={friend.friendId}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-xl">
                👤
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800 text-sm">{friend.friendId}</p>
                <p className="text-xs text-slate-400">
                  Friends since {new Date(friend.since).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1">
                <span className="text-green-500 text-xs">●</span>
                <span className="text-slate-400 text-xs">Active</span>
              </div>
            </motion.div>
          ))}

          {friends.length > 5 && (
            <a
              href="/dashboard/leaderboard"
              className="block text-center text-purple-600 hover:text-purple-700 text-sm font-medium pt-2"
            >
              View all {friends.length} friends →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
