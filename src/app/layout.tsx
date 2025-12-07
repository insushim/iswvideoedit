import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'PhotoStory Pro - AI 기반 감성 영상 제작',
    template: '%s | PhotoStory Pro',
  },
  description:
    '사진을 업로드하면 AI가 자동으로 감동적인 영상을 만들어 드립니다. 졸업식, 결혼식, 여행, 기념일 등 다양한 테마 지원.',
  keywords: [
    '영상 제작',
    '포토 무비',
    '슬라이드쇼',
    'AI 영상',
    '졸업 영상',
    '결혼식 영상',
    '추억 영상',
    '사진 영상',
  ],
  authors: [{ name: 'PhotoStory Pro' }],
  creator: 'PhotoStory Pro',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://photostorypro.com',
    siteName: 'PhotoStory Pro',
    title: 'PhotoStory Pro - AI 기반 감성 영상 제작',
    description: '사진을 업로드하면 AI가 자동으로 감동적인 영상을 만들어 드립니다.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PhotoStory Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhotoStory Pro - AI 기반 감성 영상 제작',
    description: '사진을 업로드하면 AI가 자동으로 감동적인 영상을 만들어 드립니다.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
