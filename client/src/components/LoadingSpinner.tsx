import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 40, text = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="border-4 border-blue-200 border-t-blue-600 rounded-full"
        style={{ width: size, height: size }}
      />
      <p className="mt-4 text-sm text-gray-500">{text}</p>
    </div>
  );
}
