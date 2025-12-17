import { NextRequest, NextResponse } from 'next/server';
import { ALL_THEMES, EDUCATION_THEMES, FAMILY_THEMES, BUSINESS_THEMES, EVENT_THEMES } from '@/constants/themes';

/**
 * GET /api/themes
 * Get available themes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let themes = ALL_THEMES;

    // Filter by category
    if (category) {
      switch (category) {
        case 'education':
          themes = EDUCATION_THEMES;
          break;
        case 'family':
          themes = FAMILY_THEMES;
          break;
        case 'business':
          themes = BUSINESS_THEMES;
          break;
        case 'events':
          themes = EVENT_THEMES;
          break;
      }
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      themes = themes.filter(
        (theme) =>
          theme.name.toLowerCase().includes(searchLower) ||
          theme.description.toLowerCase().includes(searchLower) ||
          theme.tags.some((k: string) => k.toLowerCase().includes(searchLower))
      );
    }

    // Return simplified theme data for listing
    const themeList = themes.map((theme) => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      category: theme.category,
      colors: theme.colors,
      thumbnail: theme.icon,
      isPremium: theme.premium,
      keywords: theme.tags,
    }));

    return NextResponse.json({
      themes: themeList,
      total: themeList.length,
      categories: [
        { id: 'education', name: '교육', count: EDUCATION_THEMES.length },
        { id: 'family', name: '가족', count: FAMILY_THEMES.length },
        { id: 'business', name: '비즈니스', count: BUSINESS_THEMES.length },
        { id: 'events', name: '이벤트', count: EVENT_THEMES.length },
      ],
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}
