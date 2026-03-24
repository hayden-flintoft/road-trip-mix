import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import LoginButton from "../login-button";

export default async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--background-tinted-base)" }}>
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-base)" }}>
        Road Trip Mix
      </h1>
      {session?.user ? (
        <div className="flex items-center gap-3">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "Profile"}
              width={36}
              height={36}
              className="rounded-full"
            />
          )}
          <span className="text-sm" style={{ color: "var(--text-subdued)" }}>
            {session.user.name}
          </span>
          <LoginButton signedIn />
        </div>
      ) : (
        <LoginButton />
      )}
    </header>
  );
}
