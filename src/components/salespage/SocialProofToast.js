"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SP_GROUPS, groupOfPath, timeAgo } from "@/lib/social-proof";

// Popup "X baru menempah ..." — dipasang dalam root layout.
// · Papar HANYA di SP produk berkenaan: SP Sabun → order sabun sahaja, SP Kasturi → order kasturi, dll.
// · Laluan lain (dashboard, homepage, checkout, TQ) → tiada popup. Disemak semula setiap kali tukar halaman.
// · Data SEBENAR sahaja (order dibayar 14 hari terakhir, masa order sebenar). Tiada order → tiada popup.

// Laluan SP yang sengaja tiada popup walaupun padan kumpulan produk
const SKIP_PREFIXES = ["/fsp-checkout", "/pengisian-item"];

export default function SocialProofToast() {
  const pathname = usePathname();
  const [group, setGroup]     = useState(null);
  const [entries, setEntries] = useState([]);
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  // Tentukan kumpulan produk setiap kali laluan berubah
  useEffect(() => {
    clearTimeout(timerRef.current);
    setVisible(false); setCurrent(null); setEntries([]); indexRef.current = 0;

    const path = pathname || "";
    if (SKIP_PREFIXES.some(p => path.startsWith(p))) { setGroup(null); return; }
    let key = groupOfPath(path);
    // SP Generator (/s/<slug>) — produk ditanda oleh halaman (data-sp-product)
    if (!key && path.startsWith("/s/")) key = document.querySelector("[data-sp-product]")?.getAttribute("data-sp-product") || null;
    setGroup(SP_GROUPS[key] ? key : null);
  }, [pathname]);

  // Ambil order sebenar untuk produk ini
  useEffect(() => {
    if (!group) return;
    let alive = true;
    fetch(`/api/public/social-proof?product=${encodeURIComponent(group)}`)
      .then(r => r.json())
      .then(data => { if (alive && Array.isArray(data)) setEntries(data); })
      .catch(() => {});
    return () => { alive = false; };
  }, [group]);

  // Kitaran popup
  useEffect(() => {
    if (!entries.length) return;
    const showNext = () => {
      const entry = entries[indexRef.current % entries.length];
      indexRef.current += 1;
      setCurrent(entry);
      setVisible(true);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        timerRef.current = setTimeout(showNext, 16000 + Math.random() * 6000);   // seterusnya 16–22s
      }, 5500);                                                                  // papar 5.5s
    };
    timerRef.current = setTimeout(showNext, 8000 + Math.random() * 4000);         // mula 8–12s
    return () => clearTimeout(timerRef.current);
  }, [entries]);

  const handleDismiss = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  const g = SP_GROUPS[group];
  if (!current || !g) return null;
  const qtyLabel = g.unit ? ` ${current.qty} ${g.unit}` : "";

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
        <span style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0, marginTop: "2px" }}>{g.icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>
            {current.name}
            {current.state ? <span style={{ fontWeight: 400, color: "#64748B" }}> dari {current.state}</span> : null}
          </p>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "#334155", lineHeight: 1.45 }}>
            menempah <strong style={{ color: "#047857" }}>{g.label}{qtyLabel}</strong>
          </p>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.7rem", color: "#94A3B8" }}>🕐 {timeAgo(current.at)}</p>
        </div>

        <button
          onClick={handleDismiss}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", fontSize: "1rem", lineHeight: 1, padding: "0 0 0 0.25rem", flexShrink: 0, alignSelf: "flex-start" }}
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
