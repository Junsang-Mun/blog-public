import { PrismaClient } from "@prisma/client";
import { json } from "@sveltejs/kit";

const prisma = new PrismaClient();

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      tags: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const parsed = posts.map((post) => ({
    ...post,
    tags: JSON.parse(post.tags),
  }));

  return json(parsed);
}

export async function POST({ request }) {
  const { title, content, tags, published } = await request.json();

  const newPost = await prisma.post.create({
    data: {
      title,
      content,
      tags: JSON.stringify(tags),
      published,
    },
  });

  return json({ id: newPost.id });
}
