import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo users
  const admin = await prisma.user.upsert({
    where: { email: "admin@superteam.ng" },
    update: {},
    create: {
      email: "admin@superteam.ng",
      name: "Admin User",
      role: "ADMIN",
      githubUsername: "superteam-admin",
      bio: "Community lead at Superteam Nigeria",
      level: 4,
      xp: 6000,
    },
  });

  const dev = await prisma.user.upsert({
    where: { email: "dev@superteam.ng" },
    update: {},
    create: {
      email: "dev@superteam.ng",
      name: "Ade Builder",
      role: "MEMBER",
      githubUsername: "ade-builder",
      twitterHandle: "ade_builds",
      bio: "Full-stack developer building on Solana",
      level: 3,
      xp: 2500,
    },
  });

  const writer = await prisma.user.upsert({
    where: { email: "writer@superteam.ng" },
    update: {},
    create: {
      email: "writer@superteam.ng",
      name: "Ngozi Writes",
      role: "MEMBER",
      githubUsername: "ngozi-writes",
      twitterHandle: "ngozi_writes",
      bio: "Technical writer and content creator",
      level: 2,
      xp: 1200,
    },
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: { name: "SuperLog", category: "MAIN", description: "Proof-of-work tracking platform", repoUrl: "https://github.com/example/superlog", userId: dev.id },
  });

  const project2 = await prisma.project.create({
    data: { name: "Solana DeFi Dashboard", category: "SIDE", description: "Analytics dashboard for Solana DeFi", userId: dev.id },
  });

  const project3 = await prisma.project.create({
    data: { name: "Web3 Blog", category: "COMMUNITY", description: "Educational blog about Web3 development", userId: writer.id },
  });

  // Create GitHub activities
  const now = new Date();
  const activities = [
    { type: "COMMIT" as const, title: "feat: add user authentication", repo: "example/superlog", githubId: "abc123", userId: dev.id, projectId: project1.id },
    { type: "PR" as const, title: "Add dashboard components", repo: "example/superlog", githubId: "pr456", userId: dev.id, projectId: project1.id },
    { type: "COMMIT" as const, title: "fix: resolve routing issue", repo: "example/superlog", githubId: "def789", userId: dev.id, projectId: project1.id },
    { type: "ISSUE" as const, title: "Bug: Calendar not loading on mobile", repo: "example/superlog", githubId: "issue101", userId: dev.id, projectId: project1.id },
    { type: "REVIEW" as const, title: "Review: Updated API endpoints", repo: "example/defi-dash", githubId: "review202", userId: dev.id, projectId: project2.id },
  ];

  for (let i = 0; i < activities.length; i++) {
    await prisma.gitHubActivity.create({
      data: { ...activities[i], url: `https://github.com/${activities[i].repo}`, occurredAt: new Date(now.getTime() - i * 86400000) },
    });
  }

  // Create tweets
  await prisma.tweet.create({
    data: { url: "https://x.com/ade_builds/status/123456", content: "Just shipped the auth flow for SuperLog! Building in public is amazing", tags: ["buildinpublic", "solana"], postedAt: now, userId: dev.id },
  });

  await prisma.tweet.create({
    data: { url: "https://x.com/ngozi_writes/status/789012", content: "New article: Getting Started with Solana Development in 2026", tags: ["solana", "web3", "tutorial"], postedAt: now, userId: writer.id },
  });

  // Create blog posts
  await prisma.blogPost.create({
    data: { title: "Building a Proof-of-Work Platform with Next.js", url: "https://dev.to/ngozi/pow-nextjs", platform: "Dev.to", summary: "How we built SuperLog using Next.js 14 and Prisma", tags: ["nextjs", "prisma", "typescript"], publishedAt: now, userId: writer.id },
  });

  // Create goals
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  await prisma.goal.createMany({
    data: [
      { title: "Complete auth system", type: "WEEKLY", status: "COMPLETED", targetDate: weekStart, projectId: project1.id, userId: dev.id },
      { title: "Write 2 blog posts", type: "WEEKLY", status: "IN_PROGRESS", targetDate: weekStart, userId: writer.id },
      { title: "Ship dashboard MVP", type: "WEEKLY", status: "PLANNED", targetDate: weekStart, projectId: project1.id, userId: dev.id },
    ],
  });

  // Create streaks
  await prisma.streak.createMany({
    data: [
      { type: "ACTIVITY", currentLength: 7, longestLength: 14, lastActiveDate: now, userId: dev.id },
      { type: "CODE", currentLength: 5, longestLength: 10, lastActiveDate: now, userId: dev.id },
      { type: "WRITING", currentLength: 3, longestLength: 8, lastActiveDate: now, userId: writer.id },
      { type: "ACTIVITY", currentLength: 4, longestLength: 4, lastActiveDate: now, userId: writer.id },
    ],
  });

  // Create badges
  await prisma.badge.createMany({
    data: [
      { name: "First Log", description: "Logged your first activity", icon: "zap", category: "milestone", userId: dev.id },
      { name: "Week Warrior", description: "7-day activity streak", icon: "flame", category: "streak", userId: dev.id },
      { name: "First Log", description: "Logged your first activity", icon: "zap", category: "milestone", userId: writer.id },
    ],
  });

  // Create onboarding progress
  await prisma.onboardingProgress.createMany({
    data: [
      { userId: dev.id, steps: { profileSetup: true, githubConnected: true, twitterConnected: true, firstProject: true, firstPlan: true, firstLog: true } },
      { userId: writer.id, steps: { profileSetup: true, githubConnected: true, twitterConnected: true, firstProject: true, firstPlan: false, firstLog: true } },
      { userId: admin.id, steps: { profileSetup: true, githubConnected: true, twitterConnected: false, firstProject: false, firstPlan: false, firstLog: false } },
    ],
  });

  console.log("Seed complete!");
  console.log(`  Admin: ${admin.email}`);
  console.log(`  Dev: ${dev.email}`);
  console.log(`  Writer: ${writer.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
