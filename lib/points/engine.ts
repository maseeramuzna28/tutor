// Gamification & Concurrency-Safe Reward Engine for TUTO
import { createAdminClient } from '../supabase/admin';
import { Badge } from '../types/database';

export const REWARD_AMOUNTS = {
  ASK_QUESTION: 5,
  PUBLISH_ANONYMOUS: 5,
  ANSWER_QUESTION: 10,
  RECEIVE_UPVOTE: 2,
  FACULTY_VERIFIED: 25,
  POST_PROJECT: 15,
  ACCEPTED_CONTRIBUTION: 20,
} as const;

export const DAILY_POINTS_CAP = 100;

export interface AwardResult {
  awarded: number;
  requested: number;
  pointsToday: number;
  dailyCap: number;
  totalPoints: number;
}

/**
 * Award points to a user with strict 100 points/day limit and atomic logging
 */
export async function awardPoints(
  userId: string,
  action: string,
  pointsToAward: number
): Promise<AwardResult> {
  const admin = createAdminClient();

  // The database function performs the idempotency and daily-cap checks atomically.
  try {
    const { data, error } = await admin.rpc('award_user_points', {
      p_user_id: userId,
      p_action: action,
      p_points: pointsToAward,
    });

    if (error) {
      console.error('Failed to award points via database function:', error);
      throw new Error('Failed to award points.');
    }
    if (!data) {
      throw new Error('Points database function returned no result.');
    }

    return {
      awarded: data.awarded,
      requested: data.requested,
      pointsToday: data.points_today,
      dailyCap: data.daily_cap,
      totalPoints: data.total_points,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'Failed to award points.') {
      throw error;
    }
    console.error('Failed to execute points database function:', error);
    throw new Error('Failed to award points.');
  }
}

/**
 * Compute badges dynamically from user activity without requiring an extra table
 */
export async function computeUserBadges(userId: string): Promise<Badge[]> {
  const admin = createAdminClient();

  // 1. Count questions asked by user
  const { count: questionsCount } = await admin
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  // 2. Count answers provided by user
  const { count: answersCount } = await admin
    .from('answers')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  // 3. Count projects created by user
  const { count: projectsCount } = await admin
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId);

  const badges: Badge[] = [
    {
      id: 'first_doubt',
      name: 'First Doubt',
      description: 'Asked your first academic doubt out loud',
      icon: 'HelpCircle',
      unlocked: (questionsCount || 0) >= 1,
    },
    {
      id: 'helper',
      name: 'Helper',
      description: 'Helped peers by answering 3 doubts',
      icon: 'Award',
      unlocked: (answersCount || 0) >= 3,
    },
    {
      id: 'builder',
      name: 'Builder',
      description: 'Created a cross-college project',
      icon: 'Code',
      unlocked: (projectsCount || 0) >= 1,
    },
  ];

  return badges;
}
