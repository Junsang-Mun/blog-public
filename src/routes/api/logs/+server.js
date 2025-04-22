import { PrismaClient } from "@prisma/client";
import { json } from "@sveltejs/kit";

const prisma = new PrismaClient();

export async function GET({ cookies, url }) {
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

  // Query parameters for pagination and filtering
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "100");
  const path = url.searchParams.get("path");
  const ip = url.searchParams.get("ip");
  const startDate = url.searchParams.get("start");
  const endDate = url.searchParams.get("end");

  // Build where clause
  let where = {};

  if (path) {
    where.path = { contains: path };
  }

  if (ip) {
    where.ipAddress = { contains: ip };
  }

  if (startDate) {
    where.visitedAt = {
      ...(where.visitedAt || {}),
      gte: new Date(startDate),
    };
  }

  if (endDate) {
    where.visitedAt = {
      ...(where.visitedAt || {}),
      lte: new Date(endDate),
    };
  }

  // Get logs with pagination
  const logs = await prisma.visitorLog.findMany({
    where,
    orderBy: { visitedAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Get total count for pagination
  const total = await prisma.visitorLog.count({ where });

  return json({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
