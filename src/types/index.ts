// ─── Onboarding ──────────────────────────────────────────────────────────────

export interface OnboardingSteps {
  profileSetup: boolean;
  githubConnected: boolean;
  twitterConnected: boolean;
  firstProject: boolean;
  firstPlan: boolean;
  firstLog: boolean;
}

// ─── Activity ────────────────────────────────────────────────────────────────

/**
 * Union of all activity types that can appear in a user's feed / scoring
 * pipeline.  The first four mirror GitHubActivityType in the Prisma schema;
 * the rest are content / planning activities.
 */
export type ActivityType =
  | "COMMIT"
  | "PR"
  | "ISSUE"
  | "REVIEW"
  | "RELEASE"
  | "TWEET"
  | "BLOG_POST"
  | "GOAL_COMPLETE"
  | "STREAK";

// ─── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Points awarded for each activity type in the developer track.
 * Adjust weights here and all scoring calculations stay consistent.
 */
export const DEV_SCORING_CONFIG = {
  COMMIT: 2,
  PR: 10,
  ISSUE: 3,
  REVIEW: 5,
  RELEASE: 15,
  GOAL_COMPLETE: 8,
  STREAK: 5,
} as const satisfies Partial<Record<ActivityType, number>>;

/**
 * Points awarded for each activity type in the writer / content track.
 */
export const WRITER_SCORING_CONFIG = {
  TWEET: 3,
  BLOG_POST: 20,
  GOAL_COMPLETE: 8,
  STREAK: 5,
} as const satisfies Partial<Record<ActivityType, number>>;

/** Combined view of both scoring configs for convenience. */
export const SCORING_CONFIG = {
  dev: DEV_SCORING_CONFIG,
  writer: WRITER_SCORING_CONFIG,
} as const;

export type DevScoringConfig = typeof DEV_SCORING_CONFIG;
export type WriterScoringConfig = typeof WRITER_SCORING_CONFIG;
export type ScoringConfig = typeof SCORING_CONFIG;
