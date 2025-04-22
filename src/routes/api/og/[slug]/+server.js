import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const fontPath = path.resolve("./src/lib/fonts/42dotSans.ttf");
const fontData = fs.readFileSync(fontPath);

export const GET = async ({ params }) => {
  const { slug } = params;
  const post = await getPostData(slug);

  if (!post) return new Response("Post not found", { status: 404 });

  const { title, content, tags } = post;

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "1200px",
          height: "630px",
          backgroundColor: "#0f0f0f",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px",
          boxSizing: "border-box",
          fontFamily: "42dot Sans",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                backgroundColor: "#18181b",
                borderRadius: "32px",
                padding: "60px",
                width: "100%",
                height: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "64px",
                      fontWeight: 700,
                      color: "#ffffff",
                      textAlign: "center",
                      lineHeight: "1.2",
                      marginBottom: "40px",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      maxWidth: "90%",
                    },
                    children: title,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "28px",
                      color: "#a1a1aa",
                      textAlign: "center",
                      lineHeight: "1.5",
                      marginBottom: "40px",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      maxWidth: "90%",
                    },
                    children:
                      content?.slice(0, 120) ?? "No description available.",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      gap: "16px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    },
                    children: tags.map((tag) => ({
                      type: "span",
                      props: {
                        style: {
                          fontSize: "20px",
                          backgroundColor: "#06b6d4",
                          color: "#fff",
                          padding: "6px 20px",
                          borderRadius: "9999px",
                          fontWeight: 600,
                        },
                        children: `#${tag}`,
                      },
                    })),
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "42dot Sans",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1200,
    },
  });

  const pngBuffer = resvg.render().asPng();

  return new Response(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
    },
  });
};

async function getPostData(slug) {
  const post = await prisma.post.findUnique({
    where: { id: parseInt(slug) },
    select: {
      title: true,
      content: true,
      tags: true,
    },
  });

  if (post) post.tags = JSON.parse(post.tags || "[]");
  return post;
}
