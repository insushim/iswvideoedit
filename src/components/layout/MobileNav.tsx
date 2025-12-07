import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Video, Plus, Settings, User } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isSpecial?: boolean;
}

const navItems: NavItem[] = [
  {
    label: '홈',
    href: '/dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: '프로젝트',
    href: '/projects',
    icon: <Video className="h-5 w-5" />,
  },
  {
    label: '만들기',
    href: '/create',
    icon: <Plus className="h-6 w-6" />,
    isSpecial: true,
  },
  {
    label: '설정',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    label: '프로필',
    href: '/profile',
    icon: <User className="h-5 w-5" />,
  },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/95 lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center"
              >
                <div className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg shadow-purple-500/30">
                  <span className="text-white">{item.icon}</span>
                </div>
                <span className="mt-1 text-[10px] font-medium text-purple-600 dark:text-purple-400">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2',
                isActive
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-white dark:bg-gray-900" />
    </nav>
  );
};

export default MobileNav;
