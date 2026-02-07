import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface UnlockAnimationProps {
  achievementTitle: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  onComplete?: () => void;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 via-orange-500 to-amber-600',
};

const rarityGlow = {
  common: 'shadow-gray-400/50',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-purple-400/50',
  legendary: 'shadow-amber-400/50',
};

export function UnlockAnimation({
  achievementTitle,
  xpReward,
  rarity,
  onComplete,
}: UnlockAnimationProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
    >
      {/* Particle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-3 h-3 rounded-full bg-gradient-to-br ${rarityColors[rarity]}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -100],
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 0.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Achievement Card */}
      <motion.div
        className={`bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl border-4 ${rarityGlow[rarity]}`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
      >
        {/* Icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div
            className={`p-6 rounded-full bg-gradient-to-br ${rarityColors[rarity]} shadow-xl`}
          >
            <CheckCircle2 className="w-20 h-20 text-white" />
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Achievement Unlocked!
          </h2>
          <p className="text-xl font-semibold text-gray-700 mb-4">
            {achievementTitle}
          </p>

          {/* XP Reward */}
          <motion.div
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${rarityColors[rarity]} text-white font-bold text-lg shadow-lg`}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.1, 1] }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <Sparkles className="w-6 h-6" />
            +{xpReward} XP
          </motion.div>
        </motion.div>

        {/* Rarity Badge */}
        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span
            className={`inline-block px-4 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${rarityColors[rarity]}`}
          >
            {rarity.toUpperCase()}
          </span>
        </motion.div>

        {/* Click to dismiss */}
        <motion.p
          className="text-center text-sm text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Click anywhere to continue
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
