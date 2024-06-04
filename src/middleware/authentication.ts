import { Hono } from "hono";
import { Env } from "../utils/config.env";
import { verify } from "hono/jwt";
import { decode } from "hono/jwt";

export const authRouter = new Hono<{ Bindings: Env }>();

authRouter.get("/", async (c) => {
  const env: Env = c.env;

  const responseType = "code";
  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/userinfo.email"
  );
  const accessType = "offline"; // For getting a refresh token
  const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
  // Construct the authorization URL manually
  const authUrl = `${GOOGLE_AUTH_ENDPOINT}?response_type=${responseType}&client_id=${encodeURIComponent(
    env.GOOGLE_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    env.GOOGLE_REDIRECT_URI
  )}&scope=${scope}&access_type=${accessType}`;

  return c.redirect(authUrl);
});

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  scope?: number;
  token_type?: number;
  error?: string;
  error_description?: string;
};

// OAuth callback route
authRouter.get("/callback", async (c) => {
  const env: Env = c.env;
  const url = new URL(c.req.url);
  const code = url.searchParams.get("code");
  const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
  if (!code) {
    return c.text("Authorization code not found", 400);
  }

  try {
    const tokenResponse: any = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData: TokenResponse = await tokenResponse.json();
    console.log("🚀 ~ authRouter.get ~ access token:", tokenData.access_token);
    console.log(
      "🚀 ~ authRouter.get ~ refresh token:",
      tokenData.refresh_token
    );
    console.log("🚀 ~ authRouter.get ~ refresh token:", tokenData.expires_in);
    console.log("🚀 ~ authRouter.get ~ id token:", tokenData.id_token);

    if (!tokenResponse.ok) {
      return c.text(
        `Failed to obtain access token: ${
          tokenData.error_description || tokenData.error
        }`,
        400
      );
    }
    const { header, payload } = decode(tokenData.id_token!!);
    console.log("🚀 ~ authRouter.get ~ payload:", payload);
    if (!tokenData.access_token) {
      return c.text("Failed to obtain access token", 400);
    }

    // Process the access token and create the user account here
    return c.json(
      {
        status: true,
        statusCode: 200,
        message: "Login with google successfully",
        data: {
          email: payload.email,
          emailVerified: payload.email_verified,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in,
          scope: tokenData.scope,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          // idToken: tokenData.id_token,
        },
      },
      200
    );
  } catch (error) {
    return c.text(
      `Error during token exchange: ${(error as Error).message}`,
      500
    );
  }
});
