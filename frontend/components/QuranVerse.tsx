"use client";

import { motion } from "motion/react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Props {
  quran: {
    arabic: string;
    translation: string;
    surah_name: string;
    ayah_number: number;
    surah_number: number;
  };
  Card: React.ComponentType<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }>;
  Eyebrow: React.ComponentType<{ children: React.ReactNode }>;
  Ghost: React.ComponentType<{ n: string }>;
}

export default function QuranVerse({ quran, Card, Eyebrow, Ghost }: Props) {
  return (
    <Card>
      <Ghost n="01" />
      <Eyebrow>verse of the day</Eyebrow>

      {/* Arabic */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease }}
        dir="rtl"
        lang="ar"
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 700,
          fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
          lineHeight: 1.7,
          color: "#ffffff",
          textAlign: "right",
          margin: "1rem 0",
        }}
      >
        {quran.arabic}
      </motion.p>

      {/* Translation */}
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(1.05rem, 2vw, 1.3rem)",
          lineHeight: 1.6,
          color: "#ffffff",
          marginBottom: "0.75rem",
          textTransform: "lowercase",
        }}
      >
        &ldquo;{quran.translation}&rdquo;
      </p>

      {/* Reference */}
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 14,
          fontWeight: 400,
          color: "#ffffff",
          textTransform: "lowercase",
        }}
      >
        {quran.surah_name} {quran.surah_number}:{quran.ayah_number}
      </p>
    </Card>
  );
}
