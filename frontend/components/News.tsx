"use client";

import { motion } from "motion/react";
import { useState } from "react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface NewsItem {
  title: string;
  source: string;
  url: string;
  summary: string;
}

interface Props {
  news: NewsItem[];
  Card: React.ComponentType<{ children: React.ReactNode; style?: React.CSSProperties }>;
  Eyebrow: React.ComponentType<{ children: React.ReactNode }>;
  Ghost: React.ComponentType<{ n: string }>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 4,
        fontSize: "0.9rem",
        fontFamily: "var(--font-inter)",
        fontWeight: 500,
        background: "rgba(255,255,255,0.2)",
        color: "#ffffff",
        textTransform: "lowercase",
      }}
    >
      {children}
    </span>
  );
}

function NewsRow({ item, delay }: { item: NewsItem; delay: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease, delay }}
      whileHover={{ x: 4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        textDecoration: "none",
        padding: "1rem 0 1rem 0.75rem",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        borderLeft: hovered
          ? "2px solid #ffffff"
          : "2px solid transparent",
        transition: "border-color 0.18s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Pill>{item.source}</Pill>
      </div>
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 600,
          fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
          lineHeight: 1.35,
          color: "#ffffff",
          margin: "0 0 6px",
          textTransform: "lowercase",
        }}
      >
        {item.title}
      </p>
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 400,
          fontSize: 15,
          color: "#ffffff",
          margin: 0,
          lineHeight: 1.6,
          textTransform: "lowercase",
        }}
      >
        {item.summary}
      </p>
    </motion.a>
  );
}

export default function News({ news, Card, Eyebrow, Ghost }: Props) {
  const items = news.slice(0, 2);

  return (
    <Card>
      <Ghost n="03" />
      <Eyebrow>this morning</Eyebrow>

      <div style={{ marginTop: "0.75rem" }}>
        {items.length === 0 ? (
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 16, color: "#ffffff", textTransform: "lowercase" }}>
            no news this morning.
          </p>
        ) : (
          items.map((item, i) => (
            <NewsRow key={i} item={item} delay={i * 0.08} />
          ))
        )}
      </div>
    </Card>
  );
}
