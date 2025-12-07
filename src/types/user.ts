export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  provider?: string;
  providerId?: string;
  subscription?: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  exportCount: number;
  storageUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionPlan = 'free' | 'pro' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface PlanLimits {
  maxProjects: number;
  maxPhotosPerProject: number;
  maxStorageMB: number;
  maxExportsPerMonth: number;
  maxVideoDurationMinutes: number;
  maxQuality: 'medium' | 'high' | 'ultra';
  watermarkRequired: boolean;
  aiNarrationEnabled: boolean;
  aiMusicEnabled: boolean;
  premiumThemes: boolean;
  premiumTransitions: boolean;
  collaborationEnabled: boolean;
  priorityRendering: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxProjects: 3,
    maxPhotosPerProject: 20,
    maxStorageMB: 500,
    maxExportsPerMonth: 3,
    maxVideoDurationMinutes: 3,
    maxQuality: 'medium',
    watermarkRequired: true,
    aiNarrationEnabled: false,
    aiMusicEnabled: false,
    premiumThemes: false,
    premiumTransitions: false,
    collaborationEnabled: false,
    priorityRendering: false,
  },
  pro: {
    maxProjects: 20,
    maxPhotosPerProject: 100,
    maxStorageMB: 5000,
    maxExportsPerMonth: 20,
    maxVideoDurationMinutes: 10,
    maxQuality: 'high',
    watermarkRequired: false,
    aiNarrationEnabled: true,
    aiMusicEnabled: false,
    premiumThemes: true,
    premiumTransitions: true,
    collaborationEnabled: false,
    priorityRendering: false,
  },
  premium: {
    maxProjects: 100,
    maxPhotosPerProject: 500,
    maxStorageMB: 50000,
    maxExportsPerMonth: 100,
    maxVideoDurationMinutes: 30,
    maxQuality: 'ultra',
    watermarkRequired: false,
    aiNarrationEnabled: true,
    aiMusicEnabled: true,
    premiumThemes: true,
    premiumTransitions: true,
    collaborationEnabled: true,
    priorityRendering: true,
  },
  enterprise: {
    maxProjects: -1,
    maxPhotosPerProject: -1,
    maxStorageMB: -1,
    maxExportsPerMonth: -1,
    maxVideoDurationMinutes: -1,
    maxQuality: 'ultra',
    watermarkRequired: false,
    aiNarrationEnabled: true,
    aiMusicEnabled: true,
    premiumThemes: true,
    premiumTransitions: true,
    collaborationEnabled: true,
    priorityRendering: true,
  },
};

export interface UserPreferences {
  language: 'ko' | 'en' | 'ja' | 'zh';
  theme: 'light' | 'dark' | 'system';
  defaultQuality: 'low' | 'medium' | 'high' | 'ultra';
  defaultAspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  autoSaveInterval: number;
  emailNotifications: boolean;
}
