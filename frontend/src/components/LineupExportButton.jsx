import { useRef, useState } from "react";

const W = 800;
const PITCH_H = 900;
const TOTAL_H = 100 + PITCH_H + 20;
function JerseySvg({ number, filled }) {
  const body   = filled ? "#aab0b8" : "#233222";
  const sleeve = filled ? "#7f8790" : "#1c2a1b";
  const num    = filled ? "#0f1014" : "transparent";

  return (
    <svg
      viewBox="0 0 50 56"
      width="54"
      height="60"
      style={{ display: "block", flexShrink: 0 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sleeve left */}
      <polygon points="15,2 1,18 13,25" fill={sleeve} />
      {/* Sleeve right */}
      <polygon points="35,2 49,18 37,25" fill={sleeve} />
      {/* Body with rounded V-collar */}
      <path
        d="M15,2 L1,18 L13,25 L13,56 L37,56 L37,25 L49,18 L35,2 C32,0 29,9 25,9 C21,9 18,0 15,2 Z"
        fill={body}
      />
      {/* Collar shadow */}
      <path
        d="M18,2 C19,7 22,9 25,9 C28,9 31,7 32,2"
        fill="none"
        stroke={sleeve}
        strokeWidth="1"
      />
      {/* Shirt number */}
      {number != null && (
        <text
          x="25"
          y="41"
          textAnchor="middle"
          fill={num}
          fontSize="14"
          fontWeight="bold"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {number}
        </text>
      )}
    </svg>
  );
}

function lastName(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].toUpperCase();
}

function ExportTemplate({ formation, assignedSlots, club, lineupTitle }) {
  const positions = formation?.positions || [];
  const formationName = formation?.name || "";

  return (
    <div
      style={{
        width: W,
        height: TOTAL_H,
        background: "#0b0b10",
        fontFamily: "Arial, Helvetica, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #16a34a, #22c55e, #4ade80)" }} />

      {/* Header */}
      <div
        style={{
          padding: "18px 36px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1c1c28",
        }}
      >
        <div>
          <div
            style={{
              color: "#22c55e",
              fontSize: 10,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            {club?.name || "Mein Verein"}
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "0.02em",
              lineHeight: 1,
            }}
          >
            {lineupTitle || "Aufstellung"}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          {formationName && (
            <div
              style={{
                display: "inline-block",
                padding: "5px 14px",
                background: "#0d1f0e",
                border: "1px solid #22c55e33",
                borderRadius: 20,
                color: "#22c55e",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              {formationName}
            </div>
          )}
          <div style={{ color: "#252530", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 8 }}>
            MATCHDAY
          </div>
        </div>
      </div>

      {/* Pitch */}
      <div
        style={{
          margin: "16px 20px 16px",
          height: PITCH_H,
          borderRadius: 12,
          position: "relative",
          overflow: "hidden",
          border: "2px solid #0f2214",
          background:
            "repeating-linear-gradient(180deg, #1b6030 0px, #1b6030 45px, #1e6b35 45px, #1e6b35 90px)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* ── Field markings ── */}

        {/* Outer border (inside) */}
        <div
          style={{
            position: "absolute", inset: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 4,
            pointerEvents: "none",
          }}
        />

        {/* Center line */}
        <div style={{ position: "absolute", left: "8px", right: "8px", top: "50%", height: 1, background: "rgba(255,255,255,0.22)" }} />

        {/* Center circle */}
        <div
          style={{
            position: "absolute", left: "50%", top: "50%",
            width: 140, height: 140,
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* Center spot */}
        <div
          style={{
            position: "absolute", left: "50%", top: "50%",
            width: 8, height: 8,
            background: "rgba(255,255,255,0.4)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Top penalty box */}
        <div style={{ position: "absolute", left: "20%", right: "20%", top: 8, height: "17%", border: "1px solid rgba(255,255,255,0.2)", borderTop: "none" }} />
        {/* Top goal box */}
        <div style={{ position: "absolute", left: "32%", right: "32%", top: 8, height: "7%", border: "1px solid rgba(255,255,255,0.2)", borderTop: "none" }} />
        {/* Top penalty spot */}
        <div style={{ position: "absolute", left: "50%", top: "12%", width: 5, height: 5, background: "rgba(255,255,255,0.3)", borderRadius: "50%", transform: "translate(-50%,-50%)" }} />

        {/* Bottom penalty box */}
        <div style={{ position: "absolute", left: "20%", right: "20%", bottom: 8, height: "17%", border: "1px solid rgba(255,255,255,0.2)", borderBottom: "none" }} />
        {/* Bottom goal box */}
        <div style={{ position: "absolute", left: "32%", right: "32%", bottom: 8, height: "7%", border: "1px solid rgba(255,255,255,0.2)", borderBottom: "none" }} />
        {/* Bottom penalty spot */}
        <div style={{ position: "absolute", left: "50%", top: "88%", width: 5, height: 5, background: "rgba(255,255,255,0.3)", borderRadius: "50%", transform: "translate(-50%,-50%)" }} />

        {/* Corner arcs */}
        {[
          { top: 2, left: 2, origin: "top left" },
          { top: 2, right: 2, origin: "top right" },
          { bottom: 2, left: 2, origin: "bottom left" },
          { bottom: 2, right: 2, origin: "bottom right" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute", ...s,
              width: 24, height: 24,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.2)",
              transformOrigin: s.origin,
            }}
          />
        ))}

        {/* ── Players ── */}
        {positions.map((pos) => {
          const player = assignedSlots[pos.id]?.player_detail;
          const nameLabel = player ? lastName(player.name) : pos.label;
          const nameColor = player ? "#f0f0f0" : "#2d4a30";

          return (
            <div
              key={pos.id}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                width: 76,
              }}
            >
              <JerseySvg number={player?.shirt_number ?? null} filled={!!player} />
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: nameColor,
                  textAlign: "center",
                  letterSpacing: "0.04em",
                  textShadow: "0 1px 4px rgba(0,0,0,0.95)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 72,
                  lineHeight: 1.2,
                }}
              >
                {nameLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LineupExportButton({ formation, assignedSlots, club, lineupTitle, opponent }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (!formation || !containerRef.current) return;
    setLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        backgroundColor: "#0b0b10",
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `aufstellung-${(lineupTitle || "export").replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !formation;

  return (
    <>
      <button
        onClick={handleExport}
        disabled={disabled}
        style={{
          padding: "8px 16px",
          background: "transparent",
          border: "1px solid #1e1e24",
          borderRadius: 8,
          color: disabled ? "#2a2a35" : "#71717a",
          fontSize: 13,
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          transition: "border-color 0.2s, color 0.2s",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = "#22c55e"; e.currentTarget.style.color = "#22c55e"; }}}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e24"; e.currentTarget.style.color = disabled ? "#2a2a35" : "#71717a"; }}
      >
        {loading ? "⏳ Exportiert…" : "⬇ PNG Export"}
      </button>

      {/* Off-screen render target */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none", zIndex: -1 }}>
        <div ref={containerRef}>
          <ExportTemplate
            formation={formation}
            assignedSlots={assignedSlots}
            club={club}
            lineupTitle={lineupTitle}
            opponent={opponent}
          />
        </div>
      </div>
    </>
  );
}
