import { PrismaClient } from "@prisma/client";
import { json } from "@sveltejs/kit";

const prismaAll = new PrismaClient();

export async function GET({ cookies }) {
  const sessionCookie = cookies.get("session");
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      JSON.parse(sessionCookie);
      isAuthenticated = true;
    } catch {
      cookies.delete("session", { path: "/" });
    }
  }

  if (!isAuthenticated) {
    return json({ error: "Unauthorized" }, { status: 403 });
  }

  const posts = await prismaAll.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  const parsed = posts.map((post) => ({
    ...post,
    tags: JSON.parse(post.tags),
  }));

  return json(parsed);
}
