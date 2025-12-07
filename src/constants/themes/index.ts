import { Theme, ThemeCategory } from '@/types/theme';
import { EDUCATION_THEMES } from './education';
import { FAMILY_THEMES } from './family';
import { BUSINESS_THEMES } from './business';
import { EVENT_THEMES } from './events';

export const ALL_THEMES: Theme[] = [
  ...EDUCATION_THEMES,
  ...FAMILY_THEMES,
  ...BUSINESS_THEMES,
  ...EVENT_THEMES,
];

export const THEME_CATEGORIES: ThemeCategory[] = [
  {
    id: 'education',
    name: '학교/교육',
    nameEn: 'Education',
    icon: '🎓',
    description: '졸업, 학교 행사, 교육 관련 테마',
    themes: EDUCATION_THEMES,
  },
  {
    id: 'family',
    name: '가족/라이프',
    nameEn: 'Family & Life',
    icon: '👨‍👩‍👧‍👦',
    description: '가족 행사, 생일, 기념일 테마',
    themes: FAMILY_THEMES,
  },
  {
    id: 'business',
    name: '비즈니스/직장',
    nameEn: 'Business',
    icon: '💼',
    description: '회사, 팀, 비즈니스 관련 테마',
    themes: BUSINESS_THEMES,
  },
  {
    id: 'event',
    name: '이벤트/특별',
    nameEn: 'Events & Special',
    icon: '🎉',
    description: '명절, 축제, 특별 이벤트 테마',
    themes: EVENT_THEMES,
  },
];

export function getThemeById(id: string): Theme | undefined {
  return ALL_THEMES.find((theme) => theme.id === id);
}

export function getThemesByCategory(category: string): Theme[] {
  return ALL_THEMES.filter((theme) => theme.category === category);
}

export function getThemesBySubCategory(subCategory: string): Theme[] {
  return ALL_THEMES.filter((theme) => theme.subCategory === subCategory);
}

export function searchThemes(query: string): Theme[] {
  const lowerQuery = query.toLowerCase();
  return ALL_THEMES.filter(
    (theme) =>
      theme.name.toLowerCase().includes(lowerQuery) ||
      theme.nameEn.toLowerCase().includes(lowerQuery) ||
      theme.description.toLowerCase().includes(lowerQuery) ||
      theme.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getFreeThemes(): Theme[] {
  return ALL_THEMES.filter((theme) => !theme.premium);
}

export function getPremiumThemes(): Theme[] {
  return ALL_THEMES.filter((theme) => theme.premium);
}

export { EDUCATION_THEMES, FAMILY_THEMES, BUSINESS_THEMES, EVENT_THEMES };
