"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface HourlyItem {
  time: string;
  temp_c: number;
  feels_like_c: number;
  precip_probability: number;
  precipitation_mm: number;
  rain_mm: number;
  snowfall_cm: number;
  cloud_cover_pct: number;
}

interface DailyData {
  temp_max_c: number;
  temp_min_c: number;
  feels_like_max_c: number;
  feels_like_min_c: number;
  precipitation_hours: number;
  wind_speed_max_kmh: number;
  wind_gusts_max_kmh: number;
}

interface WeatherData {
  summary: string;
  daily?: DailyData;
  hourly?: HourlyItem[];
}

interface Props {
  weather: WeatherData;
  Card: React.ComponentType<{ children: React.ReactNode; style?: React.CSSProperties }>;
  Eyebrow: React.ComponentType<{ children: React.ReactNode }>;
}

/* interpolate #60a5fa (cool blue) → #fb923c (warm amber) */
function tempColor(temp: number, min: number, max: number): string {
  const t = max === min ? 0.5 : Math.max(0, Math.min(1, (temp - min) / (max - min)));
  const r = Math.round(96  + t * (251 - 96));
  const g = Math.round(165 + t * (146 - 165));
  const b = Math.round(250 + t * (60  - 250));
  return `rgba(${r},${g},${b},0.9)`;
}

const BAR_MAX = 72;
const BAR_MIN = 12;

export default function Weather({ weather, Card, Eyebrow }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { summary, daily, hourly } = weather;
  const hasHourly = Array.isArray(hourly) && hourly.length > 0;

  const tempMin = daily?.feels_like_min_c ?? (hasHourly ? Math.min(...hourly!.map(h => h.feels_like_c)) : 0);
  const tempMax = daily?.feels_like_max_c ?? (hasHourly ? Math.max(...hourly!.map(h => h.feels_like_c)) : 30);

  /* auto-scroll: put current hour (index 0) roughly centered */
  useEffect(() => {
    if (!scrollRef.current || !hasHourly) return;
    const el = scrollRef.current;
    const colW = 58; // column width + gap
    const target = Math.max(0, 0 * colW - el.clientWidth / 2 + colW / 2);
    el.scrollLeft = target;
  }, [hasHourly]);

  return (
    <Card style={{ height: "100%" }}>
      <Eyebrow>weather</Eyebrow>

      {/* Hourly bar chart */}
      {hasHourly ? (
        <div
          ref={scrollRef}
          style={{
            overflowX: "auto",
            scrollBehavior: "smooth",
            marginBottom: daily ? "1rem" : 0,
            /* hide scrollbar */
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
              width: "max-content",
              padding: "4px 2px 8px",
              alignItems: "flex-end",
            }}
          >
            {hourly!.map((h, i) => {
              const isCurrent = i === 0;
              const ratio = tempMax === tempMin ? 0.5 : (h.feels_like_c - tempMin) / (tempMax - tempMin);
              const barH = Math.round(BAR_MIN + ratio * (BAR_MAX - BAR_MIN));
              const color = tempColor(h.feels_like_c, tempMin, tempMax);
              const showRain = h.precip_probability > 40;
              const showCloud = h.cloud_cover_pct > 70 && !showRain;

              return (
                <div
                  key={i}
                  style={{
                    width: 48,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    padding: "4px 3px",
                    borderRadius: 8,
                    border: isCurrent ? "1px solid rgba(255,255,255,0.25)" : "1px solid transparent",
                    background: isCurrent ? "rgba(255,255,255,0.08)" : "transparent",
                  }}
                >
                  {/* Time label */}
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 12,
                      fontWeight: isCurrent ? 600 : 400,
                      color: "#ffffff",
                      letterSpacing: "0.02em",
                      textTransform: "lowercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.time.toLowerCase().replace(":00", "").replace(" ", "")}
                  </span>

                  {/* Icon row */}
                  <span style={{ fontSize: 11, lineHeight: 1, minHeight: 14 }}>
                    {showRain ? (
                      <span style={{ color: "#ffffff", opacity: 0.9 }}>💧</span>
                    ) : showCloud ? (
                      <span style={{ opacity: 0.55 }}>☁</span>
                    ) : null}
                  </span>

                  {/* Bar */}
                  <div
                    style={{
                      position: "relative",
                      height: BAR_MAX,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      whileInView={{ scaleY: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease, delay: i * 0.04 }}
                      style={{
                        width: isCurrent ? 18 : 12,
                        height: barH,
                        background: color,
                        borderRadius: 4,
                        transformOrigin: "bottom",
                        boxShadow: isCurrent ? `0 0 8px ${color}` : "none",
                      }}
                    />
                  </div>

                  {/* Temp label */}
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    {Math.round(h.feels_like_c)}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            fontWeight: 400,
            fontStyle: "italic",
            color: "#ffffff",
            marginTop: "0.75rem",
            marginBottom: "0.5rem",
            textTransform: "lowercase",
          }}
        >
          hourly forecast appears each morning.
        </p>
      )}

      {/* Daily H/L + wind */}
      {daily && (
        <div
          style={{
            display: "flex",
            gap: "1.25rem",
            flexWrap: "wrap",
            borderTop: hasHourly ? "1px solid rgba(255,255,255,0.12)" : "none",
            paddingTop: hasHourly ? "0.75rem" : 0,
          }}
        >
          {[
            { label: "high", value: `${Math.round(daily.temp_max_c)}°` },
            { label: "low",  value: `${Math.round(daily.temp_min_c)}°` },
            { label: "wind", value: `${Math.round(daily.wind_speed_max_kmh)} km/h` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "#ffffff",
                  textTransform: "lowercase",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* GPT summary */}
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 400,
          fontSize: "clamp(1.05rem, 1.6vw, 1.2rem)",
          lineHeight: 1.6,
          color: "#ffffff",
          marginTop: "1rem",
          marginBottom: 0,
          textTransform: "lowercase",
        }}
      >
        {summary}
      </p>
    </Card>
  );
}
