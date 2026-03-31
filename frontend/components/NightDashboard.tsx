'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import NightHabits from '@/components/NightHabits';
import type { CalendarEvent } from '@/components/Dashboard';

/* ─── Types ──────────────────────────────────────────────── */

export interface NightBriefing {
	date: string;
	closing: string;
	day_summary: string;
	reflection_prompt: string;
	tomorrow: {
		weather_summary: string;
		events: CalendarEvent[];
		tasks_due: string[];
		preview: string;
	};
	habits: {
		steps_goal_met: boolean;
		steps: number | null;
	};
}

/* ─── Night gradient variants ────────────────────────────── */

const NIGHT_GRADIENTS = [
	// 0 · midnight — deep violet + warm amber underbelly
	`radial-gradient(ellipse 110% 80% at -10% 55%, rgba(55,14,90,0.95) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 110% -5%, rgba(17,20,65,0.98) 0%, transparent 55%),
   radial-gradient(ellipse 70% 60% at 55% 115%, rgba(110,50,10,0.75) 0%, transparent 50%),
   #060412`,

	// 1 · dusk ember — deep plum + muted rose ember
	`radial-gradient(ellipse 110% 80% at -10% 55%, rgba(88,22,120,0.9) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 110% -5%, rgba(100,20,50,0.9) 0%, transparent 55%),
   radial-gradient(ellipse 70% 60% at 55% 115%, rgba(40,10,60,0.85) 0%, transparent 50%),
   #14040e`,

	// 2 · deep ocean — dark navy + teal whisper
	`radial-gradient(ellipse 110% 80% at -10% 55%, rgba(8,30,80,0.98) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 110% -5%, rgba(5,50,70,0.9) 0%, transparent 55%),
   radial-gradient(ellipse 70% 60% at 55% 115%, rgba(15,25,55,0.9) 0%, transparent 50%),
   #03080f`
];

const NIGHT_ACCENT = '#f5c47a'; // warm amber for night

function getDailyNightGradientIndex(): number {
	const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
	const startOfYear = new Date(now.getFullYear(), 0, 1);
	const dayNum = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
	return dayNum % NIGHT_GRADIENTS.length;
}

/* ─── Scroll progress bar ────────────────────────────────── */

function ScrollProgressBar({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
	const { scrollYProgress } = useScroll({ container: containerRef });
	const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 50 });
	return (
		<motion.div
			style={{
				scaleX,
				transformOrigin: '0%',
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				height: 2,
				background: `rgba(245,196,122,0.7)`,
				zIndex: 100
			}}
		/>
	);
}

/* ─── Parallax section ───────────────────────────────────── */

function ParallaxSection({
	children,
	containerRef,
	ghost
}: {
	children: React.ReactNode;
	containerRef: React.RefObject<HTMLDivElement>;
	ghost?: string;
}) {
	const sectionRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		container: containerRef,
		offset: ['start end', 'end start']
	});
	const y = useTransform(scrollYProgress, [0, 1], [35, -35]);
	const ghostY = useTransform(scrollYProgress, [0, 1], [70, -70]);

	return (
		<div
			ref={sectionRef}
			style={{
				height: '100vh',
				scrollSnapAlign: 'start',
				scrollSnapStop: 'always',
				position: 'relative',
				overflow: 'hidden',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			{ghost && (
				<motion.span
					aria-hidden
					style={{
						y: ghostY,
						position: 'absolute',
						right: '2rem',
						bottom: '-1rem',
						fontFamily: 'var(--font-inter)',
						fontWeight: 800,
						fontSize: 'clamp(8rem, 20vw, 16rem)',
						lineHeight: 1,
						color: 'rgba(255,255,255,0.02)',
						userSelect: 'none',
						pointerEvents: 'none',
						zIndex: 0
					}}
				>
					{ghost}
				</motion.span>
			)}
			<motion.div
				style={{
					y,
					position: 'relative',
					zIndex: 1,
					width: '100%',
					maxWidth: 960,
					padding: '0 1.5rem'
				}}
			>
				{children}
			</motion.div>
		</div>
	);
}

/* ─── Glass card ─────────────────────────────────────────── */

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
	return (
		<div
			style={{
				position: 'relative',
				overflow: 'hidden',
				padding: '2rem',
				borderRadius: '1rem',
				background: 'rgba(255,255,255,0.07)',
				backdropFilter: 'blur(20px)',
				WebkitBackdropFilter: 'blur(20px)',
				border: '1px solid rgba(255,255,255,0.12)',
				...style
			}}
		>
			{children}
		</div>
	);
}

/* ─── Eyebrow label ──────────────────────────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
	return (
		<span
			style={{
				fontFamily: 'var(--font-inter)',
				fontSize: 13,
				fontWeight: 700,
				letterSpacing: '0.08em',
				textTransform: 'lowercase',
				color: 'rgba(255,255,255,0.5)'
			}}
		>
			{children}
		</span>
	);
}

/* ─── Time formatter ─────────────────────────────────────── */

function fmtTime(s?: string): string {
	if (!s) return '';
	try {
		const d = new Date(s);
		if (isNaN(d.getTime())) return s;
		return d.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	} catch {
		return s;
	}
}

/* ─── Lock icon SVG ──────────────────────────────────────── */

function LockIcon() {
	return (
		<svg
			width='20'
			height='20'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<rect width='18' height='11' x='3' y='11' rx='2' ry='2' />
			<path d='M7 11V7a5 5 0 0 1 10 0v4' />
		</svg>
	);
}

/* ─── Lock widget ────────────────────────────────────────── */

function LockWidget() {
	const [open, setOpen] = useState(false);

	async function handleLogout() {
		await fetch('/api/auth', { method: 'DELETE' });
		window.location.reload();
	}

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				aria-label='auth settings'
				style={{
					position: 'fixed',
					bottom: '1.5rem',
					right: '5rem',
					zIndex: 200,
					width: 36,
					height: 36,
					borderRadius: '50%',
					border: '1px solid rgba(255,255,255,0.2)',
					background: 'rgba(255,255,255,0.08)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
					cursor: 'pointer',
					color: '#ffffff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: 0
				}}
			>
				<LockIcon />
			</button>

			{open && (
				<div
					onClick={() => setOpen(false)}
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(0,0,0,0.7)',
						zIndex: 500,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							background: 'rgba(255,255,255,0.08)',
							backdropFilter: 'blur(20px)',
							WebkitBackdropFilter: 'blur(20px)',
							border: '1px solid rgba(255,255,255,0.12)',
							borderRadius: '1rem',
							padding: '2rem',
							width: '100%',
							maxWidth: 380,
							margin: '0 1rem'
						}}
					>
						<p
							style={{
								fontFamily: 'var(--font-inter)',
								fontWeight: 700,
								fontSize: 20,
								color: '#ffffff',
								margin: '0 0 1.25rem',
								textTransform: 'lowercase'
							}}
						>
							logged in
						</p>
						<button
							onClick={handleLogout}
							style={{
								width: '100%',
								padding: '0.65rem',
								borderRadius: 8,
								border: '1px solid rgba(255,255,255,0.2)',
								background: 'rgba(255,255,255,0.08)',
								color: '#ffffff',
								fontFamily: 'var(--font-inter)',
								fontWeight: 600,
								fontSize: 14,
								cursor: 'pointer',
								textTransform: 'lowercase'
							}}
						>
							lock this device
						</button>
					</div>
				</div>
			)}
		</>
	);
}

/* ─── Refresh button ─────────────────────────────────────── */

function RefreshButton() {
	const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');

	async function handleRefresh() {
		if (state === 'loading') return;
		setState('loading');
		try {
			const res = await fetch('/api/refresh?mode=night');
			if (res.ok) {
				window.location.reload();
			} else {
				setState('error');
				setTimeout(() => setState('idle'), 2000);
			}
		} catch {
			setState('error');
			setTimeout(() => setState('idle'), 2000);
		}
	}

	return (
		<button
			onClick={handleRefresh}
			aria-label='refresh night briefing'
			style={{
				position: 'fixed',
				bottom: '1.5rem',
				right: '8rem',
				zIndex: 200,
				height: 36,
				borderRadius: '1rem',
				border: '1px solid rgba(255,255,255,0.2)',
				background: 'rgba(255,255,255,0.08)',
				backdropFilter: 'blur(12px)',
				WebkitBackdropFilter: 'blur(12px)',
				cursor: state === 'loading' ? 'default' : 'pointer',
				color: state === 'error' ? 'rgba(255,120,120,0.9)' : '#ffffff',
				fontFamily: 'var(--font-inter)',
				fontSize: 12,
				fontWeight: 500,
				letterSpacing: '0.03em',
				textTransform: 'lowercase',
				display: 'flex',
				alignItems: 'center',
				padding: '0 0.75rem',
				transition: 'background 0.3s, color 0.2s'
			}}
		>
			{state === 'loading' ? (
				<span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
					{[0, 1, 2].map((i) => (
						<span
							key={i}
							style={{
								width: 4,
								height: 4,
								borderRadius: '50%',
								background: '#ffffff',
								display: 'inline-block',
								animation: `claudeDot 1.2s ease-in-out ${i * 0.2}s infinite`
							}}
						/>
					))}
				</span>
			) : state === 'error' ? (
				'failed'
			) : (
				'refresh'
			)}
			<style>{`@keyframes claudeDot { 0%,60%,100%{opacity:.25;transform:scale(.8)} 30%{opacity:1;transform:scale(1)} }`}</style>
		</button>
	);
}

/* ─── Wallpaper controls ─────────────────────────────────── */

const wallpaperBtnStyle: React.CSSProperties = {
	position: 'fixed',
	bottom: '1.5rem',
	zIndex: 200,
	width: 36,
	height: 36,
	borderRadius: '50%',
	border: '1px solid rgba(255,255,255,0.2)',
	background: 'rgba(255,255,255,0.08)',
	backdropFilter: 'blur(12px)',
	WebkitBackdropFilter: 'blur(12px)',
	color: '#ffffff',
	fontSize: 16,
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center'
};

/* ─── NightDashboard ─────────────────────────────────────── */

interface Props {
	briefing: NightBriefing | null;
	error: string | null;
	isDemo?: boolean;
}

export default function NightDashboard({ briefing, error, isDemo = false }: Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [gradientIndex, setGradientIndex] = useState(() => getDailyNightGradientIndex());

	useEffect(() => {
		document.documentElement.style.setProperty('--color-accent', NIGHT_ACCENT);
	}, []);

	useEffect(() => {
		document.body.style.background = NIGHT_GRADIENTS[gradientIndex];
		document.body.style.backgroundAttachment = 'fixed';
	}, [gradientIndex]);

	const prevGradient = () => setGradientIndex((i) => (i - 1 + NIGHT_GRADIENTS.length) % NIGHT_GRADIENTS.length);
	const nextGradient = () => setGradientIndex((i) => (i + 1) % NIGHT_GRADIENTS.length);

	/* ── Error / no data state ── */
	if (error || !briefing) {
		return (
			<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<Card>
					<p
						style={{
							fontFamily: 'var(--font-inter)',
							color: '#ffffff',
							textTransform: 'lowercase',
							margin: '0 0 1rem'
						}}
					>
						{error || 'no night briefing available'}
					</p>
					<button
						onClick={() => window.location.reload()}
						style={{
							padding: '8px 20px',
							borderRadius: 8,
							border: '1px solid rgba(255,255,255,0.2)',
							background: 'rgba(255,255,255,0.1)',
							color: '#fff',
							fontWeight: 600,
							fontSize: 13,
							cursor: 'pointer',
							fontFamily: 'var(--font-inter)',
							textTransform: 'lowercase'
						}}
					>
						retry
					</button>
				</Card>
			</div>
		);
	}

	const { closing, date, day_summary, reflection_prompt, tomorrow, habits } = briefing;

	return (
		<>
			<ScrollProgressBar containerRef={containerRef as React.RefObject<HTMLDivElement>} />

			{/* ── Wallpaper controls ── */}
			<button style={{ ...wallpaperBtnStyle, left: '1.5rem' }} onClick={prevGradient} aria-label='previous wallpaper'>
				‹
			</button>
			<button style={{ ...wallpaperBtnStyle, right: '1.5rem' }} onClick={nextGradient} aria-label='next wallpaper'>
				›
			</button>

			{/* ── Controls (real mode only) ── */}
			{!isDemo && <RefreshButton />}
			{!isDemo && <LockWidget />}

			{/* ── Scroll container ── */}
			<div
				ref={containerRef}
				style={{
					height: '100vh',
					overflowY: 'scroll',
					scrollSnapType: 'y mandatory',
					background: 'transparent'
				}}
			>
				{/* ─── 1. HEADER ──────────────────────────── */}
				<ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost='00'>
					<div>
						{/* Date */}
						<p
							style={{
								fontFamily: 'var(--font-inter)',
								fontSize: 15,
								fontWeight: 400,
								color: '#ffffff',
								marginBottom: 12,
								marginTop: 0,
								textTransform: 'lowercase'
							}}
						>
							{date}
						</p>

						{/* Closing line */}
						<h1
							style={{
								fontFamily: 'var(--font-inter)',
								fontWeight: 700,
								fontSize: 'clamp(2.5rem, 6vw, 4rem)',
								lineHeight: 1.1,
								letterSpacing: '-0.03em',
								color: '#ffffff',
								margin: 0,
								textTransform: 'lowercase'
							}}
						>
							{closing}
						</h1>

						{/* Scroll prompt */}
						<motion.p
							animate={{ opacity: [0.25, 0.55, 0.25], y: [0, 5, 0] }}
							transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
							style={{
								marginTop: '3rem',
								fontFamily: 'var(--font-inter)',
								fontSize: 13,
								color: 'rgba(255,255,255,0.4)',
								letterSpacing: '0.06em',
								textTransform: 'lowercase'
							}}
						>
							scroll ↓
						</motion.p>
					</div>
				</ParallaxSection>

				{/* ─── 2. DAY SUMMARY ─────────────────────── */}
				<ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost='01'>
					<Card>
						<Eyebrow>today</Eyebrow>
						<p
							style={{
								fontFamily: 'var(--font-dm-sans)',
								fontSize: 16,
								fontWeight: 400,
								color: 'rgba(255,255,255,0.85)',
								marginTop: '0.75rem',
								marginBottom: 0,
								lineHeight: 1.75,
								textTransform: 'lowercase'
							}}
						>
							{day_summary}
						</p>
					</Card>
				</ParallaxSection>

				{/* ─── 3. REFLECTION ──────────────────────── */}
				<ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost='02'>
					<Card style={{ textAlign: 'center', padding: '3rem 2.5rem' }}>
						<Eyebrow>reflect</Eyebrow>
						<p
							style={{
								fontFamily: 'var(--font-inter)',
								fontStyle: 'italic',
								fontWeight: 700,
								fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)',
								color: '#ffffff',
								marginTop: '1.5rem',
								marginBottom: 0,
								lineHeight: 1.5,
								letterSpacing: '-0.01em'
							}}
						>
							{reflection_prompt}
						</p>
					</Card>
				</ParallaxSection>

				{/* ─── 4. HABITS ──────────────────────────── */}
				<ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost='03'>
					<Card>
						<div style={{ marginBottom: '1.25rem' }}>
							<Eyebrow>habits</Eyebrow>
						</div>
						<NightHabits stepsGoalMet={habits.steps_goal_met} />
					</Card>
				</ParallaxSection>

				{/* ─── 5. TOMORROW ────────────────────────── */}
				<ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost='04'>
					<Card>
						<div style={{ marginBottom: '1.25rem' }}>
							<Eyebrow>tomorrow</Eyebrow>
							{tomorrow.preview && (
								<p
									style={{
										fontFamily: 'var(--font-dm-sans)',
										fontSize: 14,
										fontWeight: 400,
										fontStyle: 'italic',
										color: 'rgba(255,255,255,0.45)',
										marginTop: '0.5rem',
										marginBottom: 0,
										textTransform: 'lowercase',
										lineHeight: 1.6
									}}
								>
									{tomorrow.preview}
								</p>
							)}
						</div>

						{/* Weather */}
						{tomorrow.weather_summary && (
							<p
								style={{
									fontFamily: 'var(--font-dm-sans)',
									fontSize: 15,
									fontWeight: 400,
									color: 'rgba(255,255,255,0.8)',
									margin: '0 0 1.5rem',
									lineHeight: 1.65,
									textTransform: 'lowercase'
								}}
							>
								{tomorrow.weather_summary}
							</p>
						)}

						{/* Divider */}
						{tomorrow.events.length > 0 && (
							<div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: '1.25rem' }} />
						)}

						{/* Events */}
						{tomorrow.events
							.filter((e) => !e.is_all_day)
							.map((event, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, x: -16 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'baseline',
										gap: '1rem',
										padding: '0.65rem 0',
										borderBottom:
											i < tomorrow.events.filter((e) => !e.is_all_day).length - 1
												? '1px solid rgba(255,255,255,0.06)'
												: 'none'
									}}
								>
									<span
										style={{
											fontFamily: 'var(--font-inter)',
											fontSize: 15,
											fontWeight: 500,
											color: '#ffffff',
											textTransform: 'lowercase',
											lineHeight: 1.3
										}}
									>
										{event.title}
									</span>
									<span
										style={{
											fontFamily: 'var(--font-inter)',
											fontSize: 13,
											color: 'rgba(255,255,255,0.45)',
											whiteSpace: 'nowrap',
											flexShrink: 0
										}}
									>
										{fmtTime(event.start_time)}
										{event.end_time && ` – ${fmtTime(event.end_time)}`}
									</span>
								</motion.div>
							))}

						{/* All-day events */}
						{tomorrow.events
							.filter((e) => e.is_all_day)
							.map((event, i) => (
								<div
									key={`allday-${i}`}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '0.75rem',
										padding: '0.5rem 0'
									}}
								>
									<span
										style={{
											fontFamily: 'var(--font-inter)',
											fontSize: 10,
											fontWeight: 600,
											letterSpacing: '0.07em',
											color: 'rgba(255,255,255,0.4)',
											textTransform: 'uppercase'
										}}
									>
										all day
									</span>
									<span
										style={{
											fontFamily: 'var(--font-inter)',
											fontSize: 14,
											color: 'rgba(255,255,255,0.75)',
											textTransform: 'lowercase'
										}}
									>
										{event.title}
									</span>
								</div>
							))}

						{/* Tasks due */}
						{tomorrow.tasks_due.length > 0 && (
							<>
								<div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '1.25rem 0' }} />
								<p
									style={{
										fontFamily: 'var(--font-inter)',
										fontSize: 11,
										fontWeight: 700,
										letterSpacing: '0.08em',
										textTransform: 'lowercase',
										color: 'rgba(255,255,255,0.4)',
										margin: '0 0 0.75rem'
									}}
								>
									due tomorrow
								</p>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
									{tomorrow.tasks_due.map((task, i) => (
										<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
											<span
												style={{
													width: 4,
													height: 4,
													borderRadius: '50%',
													background: 'rgba(255,255,255,0.3)',
													flexShrink: 0,
													display: 'inline-block'
												}}
											/>
											<span
												style={{
													fontFamily: 'var(--font-dm-sans)',
													fontSize: 14,
													color: 'rgba(255,255,255,0.7)',
													textTransform: 'lowercase'
												}}
											>
												{task}
											</span>
										</div>
									))}
								</div>
							</>
						)}

						{/* Empty state */}
						{tomorrow.events.length === 0 && tomorrow.tasks_due.length === 0 && (
							<p
								style={{
									fontFamily: 'var(--font-inter)',
									color: 'rgba(255,255,255,0.4)',
									fontSize: 15,
									textTransform: 'lowercase',
									margin: 0
								}}
							>
								clear day ahead.
							</p>
						)}
					</Card>
				</ParallaxSection>

				{/* ─── 6. FOOTER ──────────────────────────── */}
				<ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>}>
					<div style={{ textAlign: 'center' }}>
						<div style={{ width: 40, height: 1, background: `rgba(245,196,122,0.4)`, margin: '0 auto 1.5rem' }} />
						<p
							style={{
								fontFamily: 'var(--font-inter)',
								fontSize: 12,
								color: 'rgba(255,255,255,0.25)',
								margin: 0,
								letterSpacing: '0.04em',
								textTransform: 'lowercase'
							}}
						>
							sweet dreams.
						</p>
					</div>
				</ParallaxSection>
			</div>
		</>
	);
}
