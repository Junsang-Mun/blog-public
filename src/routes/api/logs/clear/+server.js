import { PrismaClient } from "@prisma/client";
import { json } from "@sveltejs/kit";

const prisma = new PrismaClient();

export async function DELETE({ cookies, url }) {
  // Check authentication first
  const sessionCookie = cookies.get("session");

  if (!sessionCookie) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    JSON.parse(sessionCookie); // Validate session format
  } catch {
    cookies.delete("session", { path: "/" });
    return new Response("Unauthorized", { status: 403 });
  }

  // Get the days parameter - how many days of logs to keep
  const days = parseInt(url.searchParams.get("days") || "30");

  // Calculate the cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  try {
    // Delete logs older than the cutoff date
    const deletedLogs = await prisma.visitorLog.deleteMany({
      where: {
        visitedAt: {
          lt: cutoffDate,
        },
      },
    });

    return json({
      success: true,
      message: `Successfully deleted ${deletedLogs.count} logs older than ${days} days`,
      deletedCount: deletedLogs.count,
      cutoffDate: cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error("Error clearing logs:", error);
    return json(
      {
        success: false,
        message: "Failed to clear logs",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
