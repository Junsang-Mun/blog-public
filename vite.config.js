import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss(), sveltekit()],
    define: {
      "import.meta.env.VITE_GITHUB_CLIENT_ID": JSON.stringify(
        env.VITE_GITHUB_CLIENT_ID,
      ),
      "import.meta.env.VITE_GITHUB_CLIENT_SECRET": JSON.stringify(
        env.VITE_GITHUB_CLIENT_SECRET,
      ),
      "import.meta.env.VITE_REDIRECT_URI": JSON.stringify(
        env.VITE_REDIRECT_URI,
      ),
      "import.meta.env.VITE_ADMIN_EMAIL": JSON.stringify(env.VITE_ADMIN_EMAIL),
    },
  };
});
