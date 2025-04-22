import { PrismaClient } from "@prisma/client";
import { json } from "@sveltejs/kit";

const prisma = new PrismaClient();

// Helper function to convert BigInt to Number
function serializeBigInt(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? Number(value) : value,
    ),
  );
}

export async function GET({ cookies }) {
  // Check authentication
  const sessionCookie = cookies.get("session");

  if (!sessionCookie) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    JSON.parse(sessionCookie);
  } catch {
    cookies.delete("session", { path: "/" });
    return new Response("Unauthorized", { status: 403 });
  }

  // Get date ranges
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setMonth(monthStart.getMonth() - 1);

  // Get visitor counts for different periods
  const [todayCount, yesterdayCount, weekCount, monthCount, totalCount] =
    await Promise.all([
      // Today's visitors
      prisma.visitorLog.count({
        where: { visitedAt: { gte: todayStart } },
      }),

      // Yesterday's visitors
      prisma.visitorLog.count({
        where: {
          visitedAt: {
            gte: yesterdayStart,
            lt: todayStart,
          },
        },
      }),

      // This week's visitors
      prisma.visitorLog.count({
        where: { visitedAt: { gte: weekStart } },
      }),

      // This month's visitors
      prisma.visitorLog.count({
        where: { visitedAt: { gte: monthStart } },
      }),

      // Total visitors
      prisma.visitorLog.count(),
    ]);

  // Use Prisma's grouped count for popular pages instead of raw query
  const popularPages = await prisma.visitorLog.groupBy({
    by: ["path"],
    _count: {
      path: true,
    },
    orderBy: {
      _count: {
        path: "desc",
      },
    },
    take: 10,
  });

  // Format the popular pages data
  const formattedPopularPages = popularPages.map((item) => ({
    path: item.path,
    count: item._count.path,
  }));

  // Use Prisma's grouped count for referrers instead of raw query
  const topReferrers = await prisma.visitorLog.groupBy({
    by: ["referrer"],
    where: {
      referrer: {
        not: null,
      },
    },
    _count: {
      referrer: true,
    },
    orderBy: {
      _count: {
        referrer: "desc",
      },
    },
    take: 10,
  });

  // Format the referrers data
  const formattedTopReferrers = topReferrers
    .filter((item) => item.referrer) // Filter out null/empty referrers
    .map((item) => ({
      referrer: item.referrer,
      count: item._count.referrer,
    }));

  return json({
    visitors: {
      today: todayCount,
      yesterday: yesterdayCount,
      week: weekCount,
      month: monthCount,
      total: totalCount,
    },
    popularPages: formattedPopularPages,
    topReferrers: formattedTopReferrers,
  });
}
