This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | yes | Spotify app credentials, used both for the primary login and for connecting additional accounts. |
| `NEXTAUTH_SECRET` | yes | Signs NextAuth session cookies and also derives the key used to encrypt connected-account tokens stored in cookies. |
| `NEXTAUTH_URL` | yes in production | Base URL of the deployment, used for OAuth redirect URIs. |
| `OPENROUTER_API_KEY` | optional | Server-wide fallback [OpenRouter](https://openrouter.ai) key for AI mix curation, used only when a signed-in user hasn't connected their own key on the Settings page. |
| `APPLE_MUSIC_TEAM_ID` / `APPLE_MUSIC_KEY_ID` / `APPLE_MUSIC_PRIVATE_KEY` | optional | Apple Developer "MusicKit" identifiers, used to sign the developer tokens Apple Music connections require. See [Apple Music setup](#apple-music-setup) below. Omit all three to leave Apple Music connections disabled. |
| `APPLE_MUSIC_STOREFRONT` | optional | Apple Music storefront country code (e.g. `us`, `gb`) used when resolving Spotify-sourced tracks against the Apple Music catalog for cross-platform playlists. Defaults to `us`. |

In your Spotify app dashboard, add both `${NEXTAUTH_URL}/api/auth/callback/spotify` (NextAuth login) and `${NEXTAUTH_URL}/api/spotify-accounts/callback` (linking additional accounts) as redirect URIs.

No OpenRouter app registration is required for the OAuth PKCE connection flow described below — it works against any deployment's callback URL out of the box.

### Apple Music setup

Apple Music connections need an [Apple Developer Program](https://developer.apple.com/programs/) membership with a MusicKit identifier and a private key:

1. In [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list), register a MusicKit identifier and note your **Team ID**.
2. Under [Keys](https://developer.apple.com/account/resources/authkeys/list), create a new key with the MusicKit capability enabled. Note the **Key ID** and download the `.p8` private key file — it can only be downloaded once.
3. Set `APPLE_MUSIC_TEAM_ID`, `APPLE_MUSIC_KEY_ID`, and `APPLE_MUSIC_PRIVATE_KEY` (the full contents of the `.p8` file — literal `\n` line-break escapes are fine if your platform doesn't support multiline env vars).

Unlike Spotify, there's no redirect URI to register: the app signs a developer token server-side and the browser (via MusicKit JS) handles user authorization directly against Apple.

## Collaborative mixes

The **Collaborative Mix** page (linked from the header once signed in) lets you connect multiple Spotify and Apple Music accounts — e.g. everyone going on the road trip — and automatically builds a shared playlist from each person's current favorites (recently played, top tracks/heavy rotation, and recently added library tracks). A track favorited on both Spotify and Apple Music by different people is recognized as the same song and merged. Optionally, enable AI curation to have an LLM (via OpenRouter) pick and order the final tracklist for a requested vibe. The playlist can be created on either Spotify or Apple Music; tracks sourced from the other platform are best-effort matched against the destination's catalog by title and artist, and any that can't be matched are skipped and reported.

## Settings

The **Settings** page (linked from the header once signed in) is where connections and keys are managed:

- **Spotify accounts** — connect additional accounts and disconnect any you no longer want feeding into collaborative mixes. Your primary login account is always included and can't be disconnected here (sign out instead).
- **Apple Music accounts** — connect accounts via MusicKit JS's in-browser authorization (no redirect back to this app; a "music user token" is handed to us directly once you approve). Requires the `APPLE_MUSIC_*` env vars above.
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
