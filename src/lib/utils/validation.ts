import { z } from "zod";

// ─── Reusable primitives ──────────────────────────────────────────────────────

const nonEmptyString = z.string().min(1, "This field is required");
const optionalString = z.string().optional();
const optionalUrl = z.string().url("Must be a valid URL").optional().or(z.literal(""));
const futureOrPresentDate = z.coerce.date();

// ─── Project ─────────────────────────────────────────────────────────────────

const ProjectCategoryEnum = z.enum([
  "MAIN",
  "SIDE",
  "OPEN_SOURCE",
  "COMMUNITY",
]);

export const projectCreateSchema = z.object({
  name: nonEmptyString.max(120, "Name must be 120 characters or fewer"),
  description: optionalString,
  category: ProjectCategoryEnum.default("SIDE"),
  repoUrl: optionalUrl,
});

export const projectUpdateSchema = projectCreateSchema.partial();

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

// ─── Tweet ───────────────────────────────────────────────────────────────────

export const tweetCreateSchema = z.object({
  url: z.string().url("Must be a valid tweet URL"),
  content: optionalString,
  tweetId: optionalString,
  tags: z.array(z.string()).default([]),
  postedAt: futureOrPresentDate.optional(),
});

export type TweetCreateInput = z.infer<typeof tweetCreateSchema>;

// ─── Blog Post ───────────────────────────────────────────────────────────────

export const blogPostCreateSchema = z.object({
  title: nonEmptyString.max(255, "Title must be 255 characters or fewer"),
  url: z.string().url("Must be a valid URL"),
  platform: optionalString,
  summary: optionalString,
  tags: z.array(z.string()).default([]),
  publishedAt: futureOrPresentDate.optional(),
});

export type BlogPostCreateInput = z.infer<typeof blogPostCreateSchema>;

// ─── Goal ────────────────────────────────────────────────────────────────────

const GoalTypeEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);
const GoalStatusEnum = z.enum([
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "MISSED",
  "CARRIED_OVER",
]);

export const goalCreateSchema = z.object({
  title: nonEmptyString.max(255, "Title must be 255 characters or fewer"),
  description: optionalString,
  type: GoalTypeEnum.default("WEEKLY"),
  status: GoalStatusEnum.default("PLANNED"),
  targetDate: futureOrPresentDate.optional(),
  projectId: optionalString,
  keyResultId: optionalString,
});

export const goalUpdateSchema = goalCreateSchema.partial();

export type GoalCreateInput = z.infer<typeof goalCreateSchema>;
export type GoalUpdateInput = z.infer<typeof goalUpdateSchema>;

// ─── Calendar Event ──────────────────────────────────────────────────────────

const CalendarEventTypeEnum = z.enum([
  "FOCUS_BLOCK",
  "COMMUNITY_EVENT",
  "HACKATHON",
  "CONTENT_PUBLISH",
  "LEARNING",
  "COLLABORATION",
  "PERSONAL",
]);

const CalendarEventStatusEnum = z.enum([
  "SCHEDULED",
  "COMPLETED",
  "PARTIAL",
  "MISSED",
]);

export const calendarEventCreateSchema = z
  .object({
    title: nonEmptyString.max(255, "Title must be 255 characters or fewer"),
    type: CalendarEventTypeEnum.default("FOCUS_BLOCK"),
    startTime: futureOrPresentDate,
    endTime: futureOrPresentDate,
    status: CalendarEventStatusEnum.default("SCHEDULED"),
    goalId: optionalString,
    projectId: optionalString,
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const calendarEventUpdateSchema = z
  .object({
    title: nonEmptyString.max(255).optional(),
    type: CalendarEventTypeEnum.optional(),
    startTime: futureOrPresentDate.optional(),
    endTime: futureOrPresentDate.optional(),
    status: CalendarEventStatusEnum.optional(),
    goalId: optionalString,
    projectId: optionalString,
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export type CalendarEventCreateInput = z.infer<typeof calendarEventCreateSchema>;
export type CalendarEventUpdateInput = z.infer<typeof calendarEventUpdateSchema>;

// ─── Daily Focus ─────────────────────────────────────────────────────────────

export const dailyFocusSchema = z.object({
  date: futureOrPresentDate,
  focus: nonEmptyString.max(500, "Focus must be 500 characters or fewer"),
});

export type DailyFocusInput = z.infer<typeof dailyFocusSchema>;

// ─── Shoutout ────────────────────────────────────────────────────────────────

export const shoutoutCreateSchema = z.object({
  toUserId: nonEmptyString,
  message: nonEmptyString.max(500, "Message must be 500 characters or fewer"),
  weekStart: futureOrPresentDate,
});

export type ShoutoutCreateInput = z.infer<typeof shoutoutCreateSchema>;
