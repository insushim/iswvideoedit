import { NextRequest, NextResponse } from 'next/server';
import { ALL_THEMES } from '@/constants/themes';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/themes/[id]
 * Get a specific theme with full details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const theme = ALL_THEMES.find((t) => t.id === params.id);

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      theme: {
        id: theme.id,
        name: theme.name,
        description: theme.description,
        category: theme.category,
        colors: theme.colors,
        fonts: theme.fonts,
        transitions: [theme.defaultTransition],
        effects: [theme.defaultEffect],
        musicGenres: [theme.defaultMusic],
        thumbnail: theme.icon,
        isPremium: theme.premium,
        keywords: theme.tags,
        introStyles: theme.introStyles,
        outroStyles: theme.outroStyles,
        introPrompts: theme.introPrompts,
        outroPrompts: theme.outroPrompts,
      },
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    );
  }
}
