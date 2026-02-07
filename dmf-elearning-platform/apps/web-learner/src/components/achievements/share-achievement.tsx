import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Check, Copy, Twitter, Facebook, Link as LinkIcon } from 'lucide-react';

interface ShareAchievementProps {
  achievementTitle: string;
  achievementDescription: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

const rarityEmoji = {
  common: '🥈',
  rare: '🥇',
  epic: '💎',
  legendary: '👑',
};

export function ShareAchievement({
  achievementTitle,
  achievementDescription,
  rarity,
  xpReward,
}: ShareAchievementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `🎉 I just unlocked "${achievementTitle}" ${rarityEmoji[rarity]} on DMF E-Learning!\n\n${achievementDescription}\n\n+${xpReward} XP earned! 🚀`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'native') => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
          '_blank'
        );
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: achievementTitle,
            text: shareText,
            url: shareUrl,
          });
        }
        break;
    }
  };

  return (
    <div className="relative">
      {/* Share Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Share2 className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700" />
      </motion.button>

      {/* Share Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <motion.div
            className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 z-50 min-w-[240px]"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="font-semibold text-gray-900 mb-3">
              Share Achievement
            </h3>

            <div className="space-y-2">
              {/* Twitter */}
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-left"
              >
                <div className="w-5 h-5 bg-blue-400 rounded flex items-center justify-center">
                  <Twitter className="w-3 h-3 text-white" fill="currentColor" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Share on Twitter
                </span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-left"
              >
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                  <Facebook className="w-3 h-3 text-white" fill="currentColor" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Share on Facebook
                </span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors text-left"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-600">
                      Copied!
                    </span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Copy Link
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
