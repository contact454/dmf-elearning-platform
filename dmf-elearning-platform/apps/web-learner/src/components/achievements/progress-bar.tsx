import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  current: number;
  total: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const rarityGradients = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 via-orange-500 to-amber-600',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function AchievementProgressBar({
  progress,
  current,
  total,
  rarity,
  animated = true,
  size = 'md',
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {/* Progress Text */}
      <div className="flex justify-between items-center text-xs text-gray-600 mb-1.5">
        <span className="font-medium">
          {current.toLocaleString()} / {total.toLocaleString()}
        </span>
        <span className="font-bold text-gray-900">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${rarityGradients[rarity]} relative overflow-hidden`}
          initial={animated ? { width: 0 } : { width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: animated ? 1 : 0,
            ease: 'easeOut',
          }}
        >
          {/* Shimmer Effect */}
          {progress > 0 && progress < 100 && (
            <motion.div
              className="absolute inset-0 w-full h-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              }}
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}

          {/* Pulse effect when complete */}
          {progress === 100 && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Milestone Markers (optional, for visual interest) */}
      {size === 'lg' && total >= 10 && (
        <div className="flex justify-between mt-1">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className={`text-xs ${
                progress >= milestone
                  ? 'text-emerald-600 font-semibold'
                  : 'text-gray-400'
              }`}
            >
              {milestone}%
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
