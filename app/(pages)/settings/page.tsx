import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginButton from "@/app/components/login-button";
import SpotifyConnections from "@/app/components/SpotifyConnections";
import OpenRouterConnection from "@/app/components/OpenRouterConnection";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-10">
      {session?.user ? (
        <section
          className="rounded-md p-6"
          style={{ backgroundColor: "var(--background-elevated-base)" }}
        >
          <h2 className="text-xl font-semibold mb-1" style={{ color: "var(--text-base)" }}>
            Settings
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-subdued)" }}>
            Manage connected accounts and integrations used to build collaborative, AI-curated mixes.
          </p>

          <div className="pb-6 mb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <SpotifyConnections />
          </div>

          <OpenRouterConnection />
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p style={{ color: "var(--text-subdued)" }}>Login to manage settings</p>
          <LoginButton />
        </div>
      )}
    </div>
  );
}
