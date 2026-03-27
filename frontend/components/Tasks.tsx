"use client";

import { motion } from "motion/react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Task {
  title: string;
  priority: number;
  project_name: string;
}

interface TasksData {
  all_tasks: Task[];
  focus_task: Task | null;
  focus_reason: string;
}

interface Props {
  tasks: TasksData;
  Card: React.ComponentType<{ children: React.ReactNode; style?: React.CSSProperties }>;
  Eyebrow: React.ComponentType<{ children: React.ReactNode }>;
  Ghost: React.ComponentType<{ n: string }>;
}

const DOT_COLORS: Record<number, string> = {
  3: "#ef4444",
  2: "#ffffff",
  1: "#eab308",
  0: "rgba(255,255,255,0.3)",
};

export default function Tasks({ tasks, Card, Eyebrow, Ghost }: Props) {
  const remaining = tasks.all_tasks.filter(
    (t) => !tasks.focus_task || t.title !== tasks.focus_task.title
  );

  return (
    <Card style={{ height: "100%" }}>
      <Ghost n="05" />
      <Eyebrow>tasks</Eyebrow>

      <div style={{ marginTop: "1rem" }}>
        {/* Focus task */}
        {tasks.focus_task ? (
          <div style={{ marginBottom: "1rem" }}>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                lineHeight: 1.3,
                color: "#ffffff",
                marginBottom: 6,
                textTransform: "lowercase",
              }}
            >
              {tasks.focus_task.title}
            </p>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 400,
                fontSize: 15,
                color: "#ffffff",
                fontStyle: "italic",
                lineHeight: 1.6,
                textTransform: "lowercase",
              }}
            >
              {tasks.focus_reason}
            </p>
          </div>
        ) : (
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 400,
              fontSize: 16,
              color: "#ffffff",
              fontStyle: "italic",
              lineHeight: 1.6,
              textTransform: "lowercase",
            }}
          >
            {tasks.focus_reason}
          </p>
        )}

        {/* Remaining tasks */}
        {remaining.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.18)",
              paddingTop: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            {remaining.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, ease, delay: i * 0.08 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: DOT_COLORS[t.priority] || "rgba(255,255,255,0.3)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 400,
                    fontSize: 16,
                    color: "#ffffff",
                    textTransform: "lowercase",
                    lineHeight: 1.6,
                  }}
                >
                  {t.title}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 400,
                    fontSize: 13,
                    color: "#ffffff",
                    marginLeft: "auto",
                    flexShrink: 0,
                    textTransform: "lowercase",
                  }}
                >
                  {t.project_name}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
