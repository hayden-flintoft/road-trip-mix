export default function Footer() {
  return (
    <footer className="px-6 py-4 text-center text-xs" style={{ color: "var(--text-subdued)" }}>
      Made by Hayden &amp; Claude &middot;{" "}
      <a
        href="https://getsongbpm.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--text-subdued)" }}
        className="underline hover:opacity-80"
      >
        Song BPM data by GetSongBPM
      </a>{" "}
      &middot;{" "}
      <a
        href="https://reccobeats.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--text-subdued)" }}
        className="underline hover:opacity-80"
      >
        Audio features by ReccoBeats
      </a>
    </footer>
  );
}
