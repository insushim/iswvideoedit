import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/common';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  CreditCard,
  HelpCircle,
  Bell,
  Search,
  Plus,
  ChevronDown,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <span className="hidden text-xl font-bold text-gray-900 dark:text-white sm:block">
              PhotoStory Pro
            </span>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="hidden max-w-md flex-1 px-8 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="프로젝트 검색..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {status === 'authenticated' && session ? (
            <>
              {/* New Project Button */}
              <Link href="/create">
                <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                  <span className="hidden sm:inline">새 프로젝트</span>
                </Button>
              </Link>

              {/* Notifications */}
              <button className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </button>

              {/* User Menu */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                        <span className="text-sm font-medium text-white">
                          {session.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-50 min-w-[200px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                    sideOffset={5}
                    align="end"
                  >
                    <div className="border-b border-gray-200 px-3 py-2 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.user?.email}
                      </p>
                    </div>

                    <DropdownMenu.Item asChild>
                      <Link
                        href="/profile"
                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <User className="h-4 w-4" />
                        프로필
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <Link
                        href="/settings"
                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4" />
                        설정
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <Link
                        href="/billing"
                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <CreditCard className="h-4 w-4" />
                        구독 관리
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <Link
                        href="/help"
                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <HelpCircle className="h-4 w-4" />
                        도움말
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  시작하기
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
