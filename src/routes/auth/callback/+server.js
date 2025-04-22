import { redirect } from "@sveltejs/kit";

export async function GET({ url, cookies, fetch }) {
  const code = url.searchParams.get("code");
  console.log("OAuth callback with code:", !!code);

  if (!code) {
    throw redirect(302, "/login?error=no_code");
  }

  try {
    // Exchange code for access token
    console.log("Exchanging code for token...");
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
          client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: import.meta.env.VITE_REDIRECT_URI,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token error:", tokenData.error);
      throw redirect(302, "/login?error=token_error");
    }

    const accessToken = tokenData.access_token;

    // Get user info
    console.log("Fetching user data...");
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    if (userData.message && userData.message.includes("Bad credentials")) {
      console.error("GitHub API error:", userData.message);
      throw redirect(302, "/login?error=bad_credentials");
    }

    // Fetch user's emails
    console.log("Fetching user emails...");
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const emails = await emailsResponse.json();

    // Check if any email matches the admin email
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const isAuthorized = emails.some(
      (email) => email.email === adminEmail && email.verified === true,
    );

    if (!isAuthorized) {
      console.log(
        `Unauthorized access attempt by ${userData.login} with emails:`,
        emails.map((e) => e.email).join(", "),
      );
      throw redirect(302, "/login?error=unauthorized");
    }

    console.log("User authenticated successfully:", userData.login);
    console.log("Email verified as admin:", adminEmail);

    // Set session cookie with basic user info
    cookies.set(
      "session",
      JSON.stringify({
        id: userData.id,
        login: userData.login,
        avatar: userData.avatar_url,
        email: adminEmail,
        isAdmin: true,
      }),
      {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      },
    );

    console.log("Session cookie set, redirecting to konsole");

    // Return a redirect response
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/konsole",
      },
    });
  } catch (error) {
    console.error("Authentication error:", error.message);
    console.error(error.stack);
    throw redirect(302, "/login?error=server_error");
  }
}
