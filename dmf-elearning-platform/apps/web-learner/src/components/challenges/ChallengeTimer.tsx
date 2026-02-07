import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';

interface ChallengeTimerProps {
  expiresAt: string;
}

export function ChallengeTimer({ expiresAt }: ChallengeTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiry = new Date(expiresAt).getTime();
      const now = Date.now();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, total: difference });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const isUrgent = timeLeft.total < 3600000; // Less than 1 hour
  const isExpired = timeLeft.total <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border-2 p-6 ${
        isExpired
          ? 'border-red-200 bg-red-50'
          : isUrgent
          ? 'border-orange-200 bg-orange-50'
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        {isUrgent ? (
          <AlertCircle className={`w-5 h-5 ${isExpired ? 'text-red-600' : 'text-orange-600'}`} />
        ) : (
          <Clock className="w-5 h-5 text-gray-600" />
        )}
        <h3 className="font-semibold text-gray-900">
          {isExpired ? 'Challenge Expired' : 'Time Remaining'}
        </h3>
      </div>

      {!isExpired ? (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <TimeUnit value={timeLeft.hours} label="Hours" isUrgent={isUrgent} />
            <TimeUnit value={timeLeft.minutes} label="Minutes" isUrgent={isUrgent} />
            <TimeUnit value={timeLeft.seconds} label="Seconds" isUrgent={isUrgent} />
          </div>

          {isUrgent && (
            <p className="text-sm text-orange-600 font-medium text-center">
              ⚡ Hurry! Challenge expires soon
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-red-600 text-center">
          This challenge has expired. Come back tomorrow for a new one!
        </p>
      )}
    </motion.div>
  );
}

function TimeUnit({
  value,
  label,
  isUrgent,
}: {
  value: number;
  label: string;
  isUrgent: boolean;
}) {
  return (
    <div className={`text-center p-3 rounded-lg ${isUrgent ? 'bg-orange-100' : 'bg-gray-100'}`}>
      <motion.div
        key={value}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className={`text-2xl font-bold ${isUrgent ? 'text-orange-600' : 'text-gray-900'}`}
      >
        {value.toString().padStart(2, '0')}
      </motion.div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}
