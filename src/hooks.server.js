import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Keep track of processed requests to avoid duplicate logging
const processedRequests = new Set();

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const requestId = `${event.url.pathname}:${Date.now()}`;
  const path = event.url.pathname;

  // Skip logging for:
  // - Asset requests (files with extensions like .css, .js, .png)
  // - API endpoints (we'll log the actual page visits, not the API calls)
  // - Repeated requests in the same navigation
  const isAssetRequest =
    path.match(/\.(js|css|png|jpg|svg|ico|woff|woff2|ttf|map)$/i) !== null;
  const isApiRequest = path.startsWith("/api/");
  const isKonsoleRequest = path.startsWith("/konsole");
  const isDuplicateRequest = processedRequests.has(requestId);

  // Log only actual page visits, not API calls or assets
  const shouldLog =
    !isAssetRequest &&
    !isApiRequest &&
    !isKonsoleRequest &&
    !isDuplicateRequest;

  if (shouldLog) {
    try {
      // Add to processed set to prevent duplicate logging
      processedRequests.add(requestId);

      // Clean up the set occasionally to prevent memory leaks
      setTimeout(() => {
        processedRequests.delete(requestId);
      }, 10000); // Remove after 10 seconds

      // Get the client IP address with fallbacks
      const ipAddress =
        event.request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        event.getClientAddress() ||
        "0.0.0.0";

      // Get user agent
      const userAgent = event.request.headers.get("user-agent") || "";

      // Get referrer if available
      const referrer = event.request.headers.get("referer") || null;

      // Log the visit
      await prisma.visitorLog.create({
        data: {
          ipAddress,
          userAgent,
          path,
          referrer,
        },
      });

      console.log(`✅ Page Visit: ${path} from ${ipAddress}`);
    } catch (error) {
      // Log error but don't break the application
      console.error("❌ Failed to log visitor:", error);
    }
  }

  // Continue processing the request
  const response = await resolve(event);
  return response;
}
