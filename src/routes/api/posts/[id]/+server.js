import { PrismaClient } from "@prisma/client";
import { json } from "@sveltejs/kit";

const prisma = new PrismaClient();

export async function GET({ params, cookies }) {
  const id = Number(params.id);
  const sessionCookie = cookies.get("session");

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  // unpublished된 글이면 로그인 여부 확인
  if (!post.published) {
    if (!sessionCookie) {
      return new Response("Unauthorized", { status: 403 });
    }

    try {
      JSON.parse(sessionCookie); // 유효한 세션인지 확인
    } catch {
      cookies.delete("session", { path: "/" });
      return new Response("Unauthorized", { status: 403 });
    }
  }

  return json({
    ...post,
    tags: JSON.parse(post.tags),
  });
}

// Update a post
export async function PUT({ request, params, cookies }) {
  const id = Number(params.id);
  const sessionCookie = cookies.get("session");

  // Check authentication
  if (!sessionCookie) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    JSON.parse(sessionCookie); // Validate session
  } catch {
    cookies.delete("session", { path: "/" });
    return new Response("Unauthorized", { status: 403 });
  }

  const { title, content, tags, published } = await request.json();

  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      title,
      content,
      tags: JSON.stringify(tags),
      published,
      updatedAt: new Date(),
    },
  });

  return json({
    id: updatedPost.id,
    updated: true,
  });
}

// Delete a post
export async function DELETE({ params, cookies }) {
  const id = Number(params.id);
  const sessionCookie = cookies.get("session");

  // Check authentication
  if (!sessionCookie) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    JSON.parse(sessionCookie); // Validate session
  } catch {
    cookies.delete("session", { path: "/" });
    return new Response("Unauthorized", { status: 403 });
  }

  await prisma.post.delete({
    where: { id },
  });

  return json({
    deleted: true,
  });
}
