import { PrismaClient } from "@prisma/client";
import { json } from "@sveltejs/kit";

const prisma = new PrismaClient();

export async function GET({ url, cookies }) {
  const query = url.searchParams.get("q");
  const isAdmin = url.searchParams.get("admin") === "true";

  console.log(`Search request: query="${query}", isAdmin=${isAdmin}`);

  if (!query || query.trim().length < 2) {
    console.log("Search query too short, returning empty results");
    return json([]);
  }

  try {
    // Build the where clause for case-insensitive search
    const searchTerm = query.trim();

    let whereClause = {
      OR: [
        { title: { contains: searchTerm } },
        { content: { contains: searchTerm } },
        { tags: { contains: searchTerm } },
      ],
    };

    // For non-admin searches, only return published posts
    if (!isAdmin) {
      whereClause.published = true;
    } else {
      // For admin searches, check if user is authenticated
      const sessionCookie = cookies.get("session");
      if (!sessionCookie) {
        console.log("Unauthorized admin search attempt - no session cookie");
        return new Response("Unauthorized", { status: 403 });
      }

      try {
        JSON.parse(sessionCookie); // Validate session
        console.log("Admin search authenticated successfully");
      } catch (e) {
        console.log("Invalid session cookie format:", e.message);
        cookies.delete("session", { path: "/" });
        return new Response("Unauthorized", { status: 403 });
      }
    }

    console.log(
      "Executing search with where clause:",
      JSON.stringify(whereClause),
    );

    const results = await prisma.post.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        content: true,
        tags: true,
      },
      take: 10, // Limit to 10 results
      orderBy: { createdAt: "desc" },
    });

    console.log(`Search found ${results.length} results`);

    // Process results
    const processedResults = results.map((post) => {
      // Create a short excerpt
      let excerpt = "";
      if (post.content) {
        // Take the first 100 characters as a fallback excerpt
        excerpt = post.content.substring(0, 100);
        if (post.content.length > 100) excerpt += "...";

        // Try to find the search term in the content
        const contentLower = post.content.toLowerCase();
        const queryLower = searchTerm.toLowerCase();
        const index = contentLower.indexOf(queryLower);

        if (index !== -1) {
          // Get snippet around the search term
          const start = Math.max(0, index - 40);
          const end = Math.min(
            post.content.length,
            index + searchTerm.length + 40,
          );
          excerpt = post.content.substring(start, end);

          // Add ellipsis if the start/end is not the beginning/end of the content
          if (start > 0) excerpt = "..." + excerpt;
          if (end < post.content.length) excerpt = excerpt + "...";
        }
      }

      let parsedTags = [];
      try {
        parsedTags = JSON.parse(post.tags || "[]");
      } catch (e) {
        console.log(`Error parsing tags for post ${post.id}: ${e.message}`);
        // If tags can't be parsed, use an empty array
        parsedTags = [];
      }

      return {
        id: post.id,
        title: post.title,
        published: post.published,
        createdAt: post.createdAt,
        excerpt,
        tags: parsedTags,
      };
    });

    return json(processedResults);
  } catch (error) {
    console.error("Search error:", error);
    return json([]);
  }
}
