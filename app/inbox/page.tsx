"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  content: string;
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
  display_name: string;
}

const ANON_IDENTITIES = [
  { emoji: "🌙", name: "Midnight Poet" },
  { emoji: "🦊", name: "Silent Fox" },
  { emoji: "✨", name: "Hidden Star" },
  { emoji: "🎭", name: "Unknown Muse" },
  { emoji: "🌊", name: "Ocean Soul" },
  { emoji: "🌹", name: "Secret Admirer" },
  { emoji: "🌸", name: "Soft Whisper" },
  { emoji: "🌙", name: "Lunar Ghost" },
  { emoji: "🔮", name: "Mystic Voice" },
  { emoji: "💫", name: "Wandering Star" },
  { emoji: "🖤", name: "Dark Matter" },
  { emoji: "🌿", name: "Quiet Soul" },
];

const MOOD_TAGS = [
  { label: "Confession", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  { label: "Romantic", color: "#EC4899", bg: "rgba(236,72,153,0.12)" },
  { label: "Deep Thought", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  { label: "Positive", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  { label: "Funny", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  { label: "Hot Take", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
];

function getIdentity(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return ANON_IDENTITIES[Math.abs(hash) % ANON_IDENTITIES.length];
}

function getMood(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 17 + id.charCodeAt(i)) | 0;
  return MOOD_TAGS[Math.abs(hash) % MOOD_TAGS.length];
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function MessageCard({ msg, index }: { msg: Message; index: number }) {
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const identity = getIdentity(msg.id);
  const mood = getMood(msg.id);

  return (
    <div
      onClick={() => !revealed && setRevealed(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "rgba(255,255,255,0.07)"
          : "rgba(255,255,255,0.04)",
        border: hovered
          ? "1px solid rgba(139,92,246,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "20px 22px",
        cursor: revealed ? "default" : "pointer",
        transition: "all 0.25s ease",
        transform: hovered && !revealed ? "translateY(-2px)" : "translateY(0)",
        backdropFilter: "blur(8px)",
        animation: `fadeSlideIn 0.4s ease ${index * 0.06}s both`,
        boxShadow: hovered
          ? "0 8px 32px rgba(139,92,246,0.12)"
          : "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {!revealed ? (
        /* Sealed state */
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>✉️</div>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            New anonymous message
          </p>
          <p
            style={{
              color: "rgba(139,92,246,0.8)",
              fontSize: "13px",
              marginTop: "6px",
              fontWeight: 500,
            }}
          >
            Tap to reveal
          </p>
        </div>
      ) : (
        /* Revealed state */
        <div style={{ animation: "revealFade 0.4s ease" }}>
          {/* Sender identity */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))",
                  border: "1px solid rgba(139,92,246,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                {identity.emoji}
              </div>
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "13px",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {identity.name}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "11px",
                    margin: 0,
                  }}
                >
                  {timeAgo(msg.created_at)}
                </p>
              </div>
            </div>
            {/* Mood tag */}
            <span
              style={{
                background: mood.bg,
                color: mood.color,
                fontSize: "11px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "20px",
                letterSpacing: "0.04em",
              }}
            >
              {mood.label}
            </span>
          </div>

          {/* Message content */}
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "15px",
              lineHeight: "1.65",
              margin: 0,
            }}
          >
            {msg.content}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "16px 18px",
        textAlign: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: accent,
          lineHeight: 1,
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchMessages = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false });
    if (data) setMessages(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/";
        return;
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .eq("id", user.id)
        .single();
      if (prof) setProfile(prof);
      await fetchMessages(user.id);
      setLoading(false);
      const interval = setInterval(() => fetchMessages(user.id), 10000);
      return () => clearInterval(interval);
    };
    init();
  }, [fetchMessages]);

  const shareLink = profile
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/send/${profile.username}`
    : "";

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Stats
  const totalMessages = messages.length;
  const confessions = messages.filter((_, i) => getMood(_.id).label === "Confession").length;
  const romantic = messages.filter((_, i) => getMood(_.id).label === "Romantic").length;
  const positive = messages.filter((_, i) => getMood(_.id).label === "Positive").length;

  // Mood percentages for insight panel
  const positivePercent = totalMessages ? Math.round(((positive + romantic) / totalMessages) * 100) : 0;
  const romanticPercent = totalMessages ? Math.round((romantic / totalMessages) * 100) : 0;
  const funnyPercent = totalMessages
    ? Math.round(
        (messages.filter((m) => getMood(m.id).label === "Funny").length /
          totalMessages) *
          100
      )
    : 0;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#050505",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "2px solid rgba(139,92,246,0.3)",
              borderTopColor: "#8B5CF6",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
            Opening your inbox…
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealFade {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
        input, button { font-family: inherit; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Atmospheric glows */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 50% at 85% 5%, rgba(139,92,246,0.13) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 5% 85%, rgba(59,130,246,0.10) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 50% 50%, rgba(236,72,153,0.04) 0%, transparent 60%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "fixed",
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              borderRadius: "50%",
              background:
                i % 3 === 0
                  ? "rgba(139,92,246,0.5)"
                  : i % 3 === 1
                  ? "rgba(59,130,246,0.5)"
                  : "rgba(236,72,153,0.5)",
              left: `${10 + i * 15}%`,
              top: `${15 + i * 12}%`,
              animation: `pulse ${2 + i * 0.4}s ease-in-out infinite`,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        ))}

        {/* Main content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "32px 20px 80px",
          }}
        >
          {/* Top nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "40px",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.3px",
              }}
            >
              unsaid
            </span>
            <button
              onClick={handleSignOut}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "8px 14px",
                color: "rgba(255,255,255,0.5)",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.5)";
              }}
            >
              Sign out
            </button>
          </div>

          {/* Hero header */}
          <div
            style={{
              marginBottom: "36px",
              animation: "fadeSlideIn 0.5s ease both",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                letterSpacing: "0.15em",
                color: "rgba(139,92,246,0.7)",
                textTransform: "uppercase",
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              inbox
            </p>
            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: 800,
                margin: "0 0 6px",
                letterSpacing: "-1px",
                lineHeight: 1.1,
              }}
            >
              @{profile?.username || "you"}
              <span
                style={{
                  fontSize: "clamp(16px, 2.5vw, 22px)",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.3)",
                  display: "block",
                  marginTop: "8px",
                  letterSpacing: "0",
                }}
              >
                where untold thoughts find a voice
              </span>
            </h1>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "32px",
              animation: "fadeSlideIn 0.5s ease 0.1s both",
            }}
          >
            <StatCard value={totalMessages} label="received" accent="#8B5CF6" />
            <StatCard value={confessions} label="confessions" accent="#EC4899" />
            <StatCard value={romantic} label="romantic" accent="#3B82F6" />
            <StatCard
              value={totalMessages > 0 ? "🔥" : "—"}
              label="trending"
              accent="#F59E0B"
            />
          </div>

          {/* Shareable link box — always visible */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "18px",
              padding: "20px 24px",
              marginBottom: "32px",
              animation: "fadeSlideIn 0.5s ease 0.15s both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "rgba(139,92,246,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  Your anonymous link
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "monospace",
                  }}
                >
                  {shareLink}
                </p>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  background: copied
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(139,92,246,0.2)",
                  border: `1px solid ${copied ? "rgba(16,185,129,0.4)" : "rgba(139,92,246,0.4)"}`,
                  borderRadius: "12px",
                  padding: "10px 20px",
                  color: copied ? "#10B981" : "#8B5CF6",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s",
                  letterSpacing: "0.02em",
                }}
              >
                {copied ? "✓ Copied!" : "Copy link"}
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 300px",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Left: message feed */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: 0,
                  }}
                >
                  Messages
                </h2>
                {totalMessages > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    Auto-refreshing
                  </span>
                )}
              </div>

              {messages.length === 0 ? (
                /* Empty state */
                <div
                  style={{
                    textAlign: "center",
                    padding: "80px 24px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "20px",
                    animation: "fadeSlideIn 0.5s ease 0.2s both",
                  }}
                >
                  <div
                    style={{
                      fontSize: "56px",
                      marginBottom: "20px",
                      animation: "pulse 2.5s ease-in-out infinite",
                    }}
                  >
                    🌌
                  </div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    No secrets yet.
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "14px",
                      lineHeight: 1.6,
                      marginBottom: "28px",
                    }}
                  >
                    Share your profile and let
                    <br />
                    the unspoken find you.
                  </p>
                  <button
                    onClick={handleCopy}
                    style={{
                      background:
                        "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 28px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {copied ? "✓ Link copied!" : "Copy my link"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {messages.map((msg, i) => (
                    <MessageCard key={msg.id} msg={msg} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Right: insight panel */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                animation: "fadeSlideIn 0.5s ease 0.2s both",
              }}
            >
              {/* Tonight's Energy */}
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  padding: "20px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "14px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>✨</span>
                  <h3
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      margin: 0,
                    }}
                  >
                    Tonight's energy
                  </h3>
                </div>

                {totalMessages === 0 ? (
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    Your energy awaits. Share your link to start receiving messages.
                  </p>
                ) : (
                  <>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "13px",
                        lineHeight: 1.65,
                        marginBottom: "18px",
                        fontStyle: "italic",
                      }}
                    >
                      Your inbox feels warm tonight. Most messages are positive and filled with admiration.
                    </p>

                    {[
                      { label: "Positive vibes", pct: positivePercent, color: "#8B5CF6" },
                      { label: "Romantic", pct: romanticPercent, color: "#EC4899" },
                      { label: "Funny", pct: funnyPercent, color: "#F59E0B" },
                    ].map((item) => (
                      <div key={item.label} style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "5px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              color: "rgba(255,255,255,0.45)",
                            }}
                          >
                            {item.label}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: item.color,
                              fontWeight: 600,
                            }}
                          >
                            {item.pct}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "4px",
                            background: "rgba(255,255,255,0.07)",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${item.pct}%`,
                              background: item.color,
                              borderRadius: "4px",
                              transition: "width 1s ease",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Quick actions */}
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  padding: "20px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "14px",
                    margin: "0 0 14px",
                  }}
                >
                  Quick actions
                </h3>
                {[
                  { icon: "🔗", label: "Copy profile link", action: handleCopy },
                  {
                    icon: "📤",
                    label: "Share profile",
                    action: () => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Send ${profile?.display_name} an anonymous message`,
                          url: shareLink,
                        });
                      } else {
                        handleCopy();
                      }
                    },
                  },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "13px",
                      cursor: "pointer",
                      marginBottom: "8px",
                      transition: "all 0.2s",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(139,92,246,0.1)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.9)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "rgba(139,92,246,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.6)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "rgba(255,255,255,0.07)";
                    }}
                  >
                    <span style={{ fontSize: "15px" }}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Tip */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(139,92,246,0.08) 100%)",
                  border: "1px solid rgba(236,72,153,0.15)",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  💡 Post your link on your Instagram bio, Twitter, or WhatsApp status for more messages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 700px) {
          .inbox-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
