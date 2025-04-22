import { redirect } from "@sveltejs/kit";

export function load({ cookies }) {
  const sessionCookie = cookies.get("session");

  console.log("Checking session cookie:", !!sessionCookie); // Log if cookie exists

  if (!sessionCookie) {
    console.log("No session cookie found, redirecting to login");
    throw redirect(302, "/login");
  }

  try {
    const user = JSON.parse(sessionCookie);
    console.log("User authenticated in konsole layout:", user.login);
    return { user };
  } catch (error) {
    // Cookie is invalid
    console.error("Invalid session cookie:", error);
    cookies.delete("session", { path: "/" });
    throw redirect(302, "/login");
  }
}
