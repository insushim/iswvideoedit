import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  FolderVideo,
  Image,
  Palette,
  Music,
  Mic,
  Settings,
  HelpCircle,
  Sparkles,
  Clock,
  Star,
  Trash2,
  Users,
  Crown,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isPro?: boolean;
}

const mainNavItems: NavItem[] = [
  {
    label: '대시보드',
    href: '/dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: '내 프로젝트',
    href: '/projects',
    icon: <FolderVideo className="h-5 w-5" />,
  },
  {
    label: '최근 작업',
    href: '/recent',
    icon: <Clock className="h-5 w-5" />,
  },
  {
    label: '즐겨찾기',
    href: '/favorites',
    icon: <Star className="h-5 w-5" />,
  },
  {
    label: '휴지통',
    href: '/trash',
    icon: <Trash2 className="h-5 w-5" />,
  },
];

const createNavItems: NavItem[] = [
  {
    label: '새 프로젝트',
    href: '/create',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    label: '사진 관리',
    href: '/photos',
    icon: <Image className="h-5 w-5" />,
  },
  {
    label: '테마 선택',
    href: '/themes',
    icon: <Palette className="h-5 w-5" />,
  },
  {
    label: '배경음악',
    href: '/music',
    icon: <Music className="h-5 w-5" />,
  },
  {
    label: '나레이션',
    href: '/narration',
    icon: <Mic className="h-5 w-5" />,
    isPro: true,
  },
];

const otherNavItems: NavItem[] = [
  {
    label: '공동작업',
    href: '/collaboration',
    icon: <Users className="h-5 w-5" />,
    isPro: true,
  },
  {
    label: '설정',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    label: '도움말',
    href: '/help',
    icon: <HelpCircle className="h-5 w-5" />,
  },
];

const NavSection: React.FC<{
  title: string;
  items: NavItem[];
  pathname: string;
}> = ({ title, items, pathname }) => (
  <div className="mb-6">
    <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {title}
    </h3>
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            <span
              className={cn(
                'transition-colors',
                isActive
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
              )}
            >
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.isPro && (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                <Crown className="h-3 w-3" />
                PRO
              </span>
            )}
            {item.badge && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4">
          {/* Main Navigation */}
          <NavSection title="메인" items={mainNavItems} pathname={pathname} />

          {/* Create Navigation */}
          <NavSection title="제작" items={createNavItems} pathname={pathname} />

          {/* Other Navigation */}
          <NavSection title="기타" items={otherNavItems} pathname={pathname} />

          {/* Storage Usage */}
          <div className="mt-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                저장 공간
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                2.4GB / 10GB
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: '24%' }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              더 많은 공간이 필요하신가요?{' '}
              <Link
                href="/billing"
                className="font-medium text-purple-600 hover:underline dark:text-purple-400"
              >
                업그레이드
              </Link>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
