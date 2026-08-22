This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | yes | Spotify app credentials, used both for the primary login and for connecting additional accounts. |
| `NEXTAUTH_SECRET` | yes | Signs NextAuth session cookies and also derives the key used to encrypt connected-account tokens stored in cookies. |
| `NEXTAUTH_URL` | yes in production | Base URL of the deployment, used for OAuth redirect URIs. |
| `OPENROUTER_API_KEY` | optional | Server-wide fallback [OpenRouter](https://openrouter.ai) key for AI mix curation, used only when a signed-in user hasn't connected their own key on the Settings page. |

In your Spotify app dashboard, add both `${NEXTAUTH_URL}/api/auth/callback/spotify` (NextAuth login) and `${NEXTAUTH_URL}/api/spotify-accounts/callback` (linking additional accounts) as redirect URIs.

No OpenRouter app registration is required for the OAuth PKCE connection flow described below — it works against any deployment's callback URL out of the box.

## Collaborative mixes

The **Collaborative Mix** page (linked from the header once signed in) lets you connect multiple Spotify accounts — e.g. everyone going on the road trip — and automatically builds a shared playlist from each person's current favorites (recently played, top tracks, and recently saved tracks). Optionally, enable AI curation to have an LLM (via OpenRouter) pick and order the final tracklist for a requested vibe.

## Settings

The **Settings** page (linked from the header once signed in) is where connections and keys are managed:

- **Spotify accounts** — connect additional accounts and disconnect any you no longer want feeding into collaborative mixes. Your primary login account is always included and can't be disconnected here (sign out instead).
- **OpenRouter** — connect your own OpenRouter account via its [OAuth PKCE flow](https://openrouter.ai/docs/use-cases/oauth-pkce) (no API key to copy/paste — you're redirected to OpenRouter to authorize, and a personal key is issued back to this app automatically), or paste an existing API key manually instead. Each signed-in user's key is stored independently; the `OPENROUTER_API_KEY` env var is only used as a fallback when no personal key is connected.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
