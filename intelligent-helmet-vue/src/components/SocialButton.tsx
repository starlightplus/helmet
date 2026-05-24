import { motion } from 'motion/react';
import React from 'react';

interface SocialButtonProps {
  id: string;
  provider: 'google' | 'github' | 'apple';
  onClick: () => void;
}

export default function SocialButton({ id, provider, onClick }: SocialButtonProps) {
  // Let's draw clean custom SVGs to make sure they look genuine and top-tier!
  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          name: 'Google',
          brandColor: 'hover:border-red-500/30 hover:bg-red-500/5',
          svg: (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.29 5.29 0 0 1 8.68 13.2a5.29 5.29 0 0 1 5.31-5.314c1.2 0 2.28.4 3.144 1.144l3.12-3.12C18.36 4.17 16.14 3 13.99 3c-5.1 0-9.24 4.14-9.24 9.24s4.14 9.24 9.24 9.24c5.1 0 8.411-3.585 8.411-8.571 0-.48-.037-.96-.11-1.429l-10.05.001Z"
              />
            </svg>
          ),
        };
      case 'github':
        return {
          name: 'GitHub',
          brandColor: 'hover:border-violet-500/30 hover:bg-violet-500/5',
          svg: (
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10Z"
              />
            </svg>
          ),
        };
      case 'apple':
        return {
          name: 'Apple',
          brandColor: 'hover:border-zinc-300/30 hover:bg-zinc-300/5',
          svg: (
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.1.67-2.82 1.52-.61.7-1.14 1.84-1 2.94 1.1.09 2.14-.58 2.83-1.4Z" />
            </svg>
          ),
        };
    }
  };

  const config = getProviderConfig();

  return (
    <motion.button
      id={id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center justify-center flex-1 py-2.5 px-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-semibold text-gray-300 transition-colors duration-200 cursor-pointer ${config.brandColor}`}
    >
      {config.svg}
      <span>{config.name}</span>
    </motion.button>
  );
}
