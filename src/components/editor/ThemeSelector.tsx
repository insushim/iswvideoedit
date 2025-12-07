'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button, Card } from '@/components/common';
import {
  Search,
  Check,
  Crown,
  GraduationCap,
  Heart,
  Briefcase,
  PartyPopper,
  Palette,
} from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };
  isPremium?: boolean;
  thumbnail?: string;
}

interface ThemeSelectorProps {
  selectedThemeId?: string;
  onSelect: (themeId: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  education: <GraduationCap className="h-5 w-5" />,
  family: <Heart className="h-5 w-5" />,
  business: <Briefcase className="h-5 w-5" />,
  events: <PartyPopper className="h-5 w-5" />,
};

const categoryNames: Record<string, string> = {
  all: '전체',
  education: '교육',
  family: '가족',
  business: '비즈니스',
  events: '이벤트',
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onSelect,
}) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchThemes();
  }, [selectedCategory, searchQuery]);

  const fetchThemes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/themes?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setThemes(data.themes);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredThemes = themes;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="테마 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          leftIcon={<Palette className="h-4 w-4" />}
        >
          전체
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            leftIcon={categoryIcons[category.id]}
          >
            {categoryNames[category.id]} ({category.count})
          </Button>
        ))}
      </div>

      {/* Theme Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800/50">
          <Palette className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            테마를 찾을 수 없습니다
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            다른 검색어나 카테고리를 선택해보세요
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredThemes.map((theme) => (
            <Card
              key={theme.id}
              isHoverable
              className={cn(
                'group cursor-pointer overflow-hidden transition-all',
                selectedThemeId === theme.id &&
                  'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900'
              )}
              onClick={() => onSelect(theme.id)}
            >
              {/* Theme Preview */}
              <div
                className="relative aspect-video"
                style={{ background: theme.colors.gradient }}
              >
                {/* Premium Badge */}
                {theme.isPremium && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Crown className="h-3 w-3" />
                    PRO
                  </div>
                )}

                {/* Selected Check */}
                {selectedThemeId === theme.id && (
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                {/* Preview Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                  <div className="text-2xl font-bold drop-shadow-lg">제목</div>
                  <div className="mt-1 text-sm opacity-80 drop-shadow">부제목</div>
                </div>

                {/* Color Swatches */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <div
                    className="h-4 w-4 rounded-full border-2 border-white/50 shadow"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="h-4 w-4 rounded-full border-2 border-white/50 shadow"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div
                    className="h-4 w-4 rounded-full border-2 border-white/50 shadow"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                  <Button variant="secondary" size="sm">
                    선택하기
                  </Button>
                </div>
              </div>

              {/* Theme Info */}
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {categoryNames[theme.category]}
                  </span>
                </div>
                <h3 className="mt-1 font-medium text-gray-900 dark:text-white">
                  {theme.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {theme.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
