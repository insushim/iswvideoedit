import Link from 'next/link';
import {
  Play,
  Sparkles,
  Palette,
  Music,
  Mic,
  Download,
  Star,
  ArrowRight,
  Check,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'AI 자동 편집',
    description: '사진만 업로드하면 AI가 최적의 구도, 전환효과, 타이밍을 자동으로 결정합니다.',
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: '50+ 프리미엄 테마',
    description: '졸업식, 결혼식, 여행, 기념일 등 다양한 상황에 맞는 전문 테마를 제공합니다.',
  },
  {
    icon: <Music className="h-6 w-6" />,
    title: '자동 배경음악',
    description: '영상 분위기에 맞는 저작권 걱정 없는 배경음악을 자동으로 추천합니다.',
  },
  {
    icon: <Mic className="h-6 w-6" />,
    title: 'AI 나레이션',
    description: 'Gemini AI가 사진을 분석하여 감동적인 나레이션을 자동 생성합니다.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '0',
    description: '개인 사용자를 위한 기본 플랜',
    features: ['월 3개 프로젝트', '720p 내보내기', '5개 테마', '워터마크 포함'],
    cta: '무료로 시작',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '9,900',
    description: '더 많은 기능이 필요한 사용자',
    features: [
      '무제한 프로젝트',
      '1080p 내보내기',
      '모든 테마',
      '워터마크 제거',
      'AI 나레이션',
      '우선 렌더링',
    ],
    cta: 'Pro 시작하기',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '문의',
    description: '기업 및 교육기관',
    features: [
      '무제한 프로젝트',
      '4K 내보내기',
      '맞춤형 테마',
      '전용 지원',
      'API 액세스',
      '팀 협업',
    ],
    cta: '문의하기',
    highlighted: false,
  },
];

const testimonials = [
  {
    name: '김민지',
    role: '학부모',
    content:
      '아이의 졸업식 영상을 만들었는데 정말 감동적이었어요. AI 나레이션이 아이의 성장 과정을 완벽하게 담아냈습니다.',
    rating: 5,
  },
  {
    name: '이준혁',
    role: '웨딩플래너',
    content:
      '결혼식 축하 영상 제작에 항상 사용합니다. 클라이언트들의 만족도가 매우 높아요.',
    rating: 5,
  },
  {
    name: '박소연',
    role: '교사',
    content:
      '학급 추억 영상을 만들 때 정말 유용해요. 50개 이상의 테마 중에서 선택할 수 있어서 좋습니다.',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-lg dark:border-gray-800/50 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              PhotoStory Pro
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              기능
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              가격
            </Link>
            <Link
              href="#testimonials"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              후기
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/30"
            >
              무료로 시작
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              <Sparkles className="h-4 w-4" />
              AI 기반 영상 제작 서비스
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              추억을{' '}
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                아름다운 영상
              </span>
              으로
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              사진을 업로드하면 AI가 자동으로 감동적인 영상을 만들어 드립니다.
              졸업식, 결혼식, 여행 등 모든 순간을 특별하게 간직하세요.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/create"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-purple-500/25 transition hover:shadow-2xl hover:shadow-purple-500/30"
              >
                무료로 시작하기
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="#demo"
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
              >
                <Play className="h-5 w-5" />
                데모 보기
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">50+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">프리미엄 테마</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">20+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">전환 효과</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">10K+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">제작된 영상</p>
              </div>
            </div>
          </div>

          {/* Video Preview */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
              <div className="flex h-full items-center justify-center">
                <button className="group flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition hover:bg-white/20">
                  <Play className="h-10 w-10 text-white transition group-hover:scale-110" />
                </button>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-50 blur-2xl" />
            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 opacity-50 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              강력한 기능
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              복잡한 편집 없이 AI가 모든 것을 자동으로 처리합니다
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 transition hover:border-purple-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-800"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-900/50 dark:text-purple-400">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20 dark:bg-gray-900 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              심플한 가격 정책
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              필요에 맞는 플랜을 선택하세요
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlighted
                    ? 'border-purple-500 bg-white shadow-xl dark:bg-gray-800'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-1 text-sm font-medium text-white">
                    가장 인기
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ₩{plan.price}
                  </span>
                  {plan.price !== '문의' && (
                    <span className="text-gray-600 dark:text-gray-400">/월</span>
                  )}
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full rounded-lg py-3 font-medium transition ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30'
                      : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              고객 후기
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              실제 사용자들의 경험을 확인해보세요
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-12 text-white sm:p-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              지금 바로 시작하세요
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              무료로 시작하고 AI가 만드는 감동적인 영상을 직접 경험해보세요
            </p>
            <Link
              href="/create"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-purple-600 shadow-xl transition hover:bg-gray-100"
            >
              무료로 시작하기
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                PhotoStory Pro
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} PhotoStory Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
