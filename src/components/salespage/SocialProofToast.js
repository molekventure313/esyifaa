"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Fallback pool kalau DB kosong / error ─────────────────────────────────────
const FALLBACK = [
  { name: "Faridah",   state: "Selangor",       product: "Sabun Garam Himalaya",     qty: 3 },
  { name: "Zulaikha",  state: "Johor Bahru",     product: "Sabun Garam Himalaya",     qty: 1 },
  { name: "Rohani",    state: "Kedah",           product: "Sabun Garam Himalaya",     qty: 2 },
  { name: "Hasnah",    state: "Pulau Pinang",    product: "Pengisian Air Tawar ESyifaa", qty: 1 },
  { name: "Nurulhuda", state: "Kelantan",        product: "Sabun Garam Himalaya",     qty: 3 },
  { name: "Aishah",    state: "Kuala Lumpur",    product: "Pakej Rawatan Ruqyah FSP", qty: 1 },
  { name: "Salmah",    state: "Terengganu",      product: "Sabun Garam Himalaya",     qty: 2 },
  { name: "Mariam",    state: "Melaka",          product: "Pengisian Air Tawar ESyifaa", qty: 1 },
  { name: "Norzahra",  state: "Pahang",          product: "Sabun Garam Himalaya",     qty: 1 },
  { name: "Khairiah",  state: "Perak",           product: "Sabun Garam Himalaya",     qty: 3 },
  { name: "Ramlah",    state: "Negeri Sembilan", product: "Pakej Rawatan Ruqyah FSP", qty: 1 },
  { name: "Siti",      state: "Selangor",        product: "Sabun Garam Himalaya",     qty: 2 },
];

const AGO_LABELS = [
  "baru sahaja",
  "2 minit lalu",
  "4 minit lalu",
  "7 minit lalu",
  "11 minit lalu",
  "15 minit lalu",
  "18 minit lalu",
  "23 minit lalu",
];

// Pages yang patut skip popup
const SKIP_PREFIXES = [
  "/dashboard",
  "/fsp-checkout",
  "/payment-success",
  "/pengisian-item",
  "/wa",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SocialProofToast() {
  const [entries, setEntries]     = useState([]);
  const [current, setCurrent]     = useState(null);
  const [visible, setVisible]     = useState(false);
  const [agoLabel, setAgoLabel]   = useState("baru sahaja");
  const indexRef  = useRef(0);
  const timerRef  = useRef(null);
  const mounted   = useRef(true);

  // Check pathname — skip kalau bukan SP page
  useEffect(() => {
    const path = window.location.pathname;
    if (SKIP_PREFIXES.some(p => path.startsWith(p))) return;

    // Fetch real orders
    fetch("/api/public/social-proof")
      .then(r => r.json())
      .then(data => {
        if (!mounted.current) return;
        const pool = data?.length >= 3 ? data : FALLBACK;
        setEntries(shuffle(pool));
      })
      .catch(() => {
        if (mounted.current) setEntries(shuffle(FALLBACK));
      });

    return () => { mounted.current = false; };
  }, []);

  const showNext = useCallback(() => {
    if (!mounted.current || entries.length === 0) return;

    const idx = indexRef.current % entries.length;
    const entry = entries[idx];
    indexRef.current += 1;

    // Pilih ago label rawak
    const ago = AGO_LABELS[Math.floor(Math.random() * AGO_LABELS.length)];
    setAgoLabel(ago);
    setCurrent(entry);
    setVisible(true);

    // Auto-hide selepas 5.5s
    timerRef.current = setTimeout(() => {
      if (!mounted.current) return;
      setVisible(false);

      // Next popup selepas 16–22s
      const delay = 16000 + Math.random() * 6000;
      timerRef.current = setTimeout(showNext, delay);
    }, 5500);
  }, [entries]);

  // Mulakan cycle bila entries dah ada
  useEffect(() => {
    if (entries.length === 0) return;
    // Delay pertama: 8–12s selepas page load
    const initial = 8000 + Math.random() * 4000;
    timerRef.current = setTimeout(showNext, initial);
    return () => clearTimeout(timerRef.current);
  }, [entries, showNext]);

  const handleDismiss = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    // Next popup selepas 16s
    timerRef.current = setTimeout(showNext, 16000);
  };

  if (!current) return null;

  const productIcon =
    current.product.includes("Sabun")     ? "🧼" :
    current.product.includes("Pengisian") ? "💧" :
    current.product.includes("FSP")       ? "📿" :
    current.product.includes("Video")     ? "🎬" :
    current.product.includes("Tasbih")    ? "📿" : "🛒";

  const qtyLabel = current.qty > 1 ? ` ${current.qty} Unit` : " 1 Unit";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "84px",
        left: "12px",
        zIndex: 9999,
        maxWidth: "300px",
        width: "calc(100vw - 24px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-110%)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderLeft: "4px solid #10B981",
          borderRadius: "14px",
          boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
          padding: "0.85rem 0.85rem 0.85rem 1rem",
          display: "flex",
          gap: "0.65rem",
          alignItems: "flex-start",
          fontFamily: "var(--font-inter), -apple-system, sans-serif",
        }}
      >
        {/* Icon */}
        <span style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0, marginTop: "2px" }}>
          {productIcon}
        </span>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>
            {current.name}
            {current.state ? (
              <span style={{ fontWeight: 400, color: "#64748B" }}> dari {current.state}</span>
            ) : null}
          </p>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "#334155", lineHeight: 1.45 }}>
            baru menempah{" "}
            <strong style={{ color: "#047857" }}>
              {current.product}{qtyLabel}
            </strong>
          </p>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.7rem", color: "#94A3B8" }}>
            🕐 {agoLabel}
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#CBD5E1",
            fontSize: "1rem",
            lineHeight: 1,
            padding: "0 0 0 0.25rem",
            flexShrink: 0,
            alignSelf: "flex-start",
          }}
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
