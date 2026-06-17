"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreateProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleUsernameChange = (val: string) => {
    setUsername(val.toLowerCase().replace(/[^a-z0-9_]/g, ""));
  };

  const handleSubmit = async () => {
    if (!displayName.trim() || !username.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    // Check username taken
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      setError("That username is taken. Try another.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("profiles").upsert({
      id: user.id,
      username,
      display_name: displayName,
    });

    if (insertError) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/inbox");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Atmospheric background glows */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 80% 10%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(59,130,246,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          zIndex: 1,
        }}
      >
        {/* Logo / wordmark */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "13px",
              letterSpacing: "0.2em",
              color: "rgba(139,92,246,0.8)",
              textTransform: "uppercase",
              marginBottom: "12px",
              fontWeight: 500,
            }}
          >
            Create your profile
          </div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            Pick your username.
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "14px",
              marginTop: "10px",
            }}
          >
            Your anonymous link will be ready instantly.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "32px",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Display name */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(139,92,246,0.6)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.1)")
              }
            />
          </div>

          {/* Username */}
          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Username
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(139,92,246,0.7)",
                  fontSize: "14px",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                unsaid.app/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="yourname"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "14px 16px 14px 98px",
                  color: "#fff",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(139,92,246,0.6)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
            </div>
            {username && (
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "rgba(139,92,246,0.7)",
                }}
              >
                ✓ Your link: unsaid.app/send/{username}
              </p>
            )}
          </div>

          {error && (
            <p
              style={{
                color: "#EC4899",
                fontSize: "13px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !displayName || !username}
            style={{
              width: "100%",
              background:
                loading || !displayName || !username
                  ? "rgba(139,92,246,0.3)"
                  : "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
              border: "none",
              borderRadius: "12px",
              padding: "15px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              cursor:
                loading || !displayName || !username
                  ? "not-allowed"
                  : "pointer",
              transition: "opacity 0.2s, transform 0.1s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.target as HTMLButtonElement).style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.opacity = "1";
            }}
          >
            {loading ? "Creating your link…" : "Create my link →"}
          </button>
        </div>
      </div>
    </div>
  );
}
