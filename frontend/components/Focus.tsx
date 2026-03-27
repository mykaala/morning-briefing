"use client";

interface Props {
  focus: string;
  Card: React.ComponentType<{ children: React.ReactNode; style?: React.CSSProperties }>;
  Eyebrow: React.ComponentType<{ children: React.ReactNode }>;
  Ghost: React.ComponentType<{ n: string }>;
}

export default function Focus({ focus, Card, Eyebrow, Ghost }: Props) {
  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Ghost n="04" />
      <Eyebrow>focus</Eyebrow>

      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 600,
          fontStyle: "italic",
          fontSize: "clamp(1.3rem, 3vw, 1.9rem)",
          lineHeight: 1.5,
          color: "#ffffff",
          marginTop: "1rem",
          textTransform: "lowercase",
        }}
      >
        &ldquo;{focus}&rdquo;
      </p>
    </Card>
  );
}
