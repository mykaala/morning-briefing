'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Dashboard, { type Briefing } from '@/components/Dashboard';

/* ─── Gradient (kept in sync with Dashboard) ─────────────── */

const GRADIENT_VARIANTS = [
	`radial-gradient(ellipse 100% 80% at -5% 70%, rgba(251,146,60,.9) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(167,139,250,.9) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(244,114,182,.85) 0%, transparent 52%),
   #f0aac0`,
	`radial-gradient(ellipse 100% 80% at -5% 70%, rgba(14,165,233,.95) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(67,56,202,.95) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(6,182,212,.9) 0%, transparent 52%),
   #4e8ac4`,
	`radial-gradient(ellipse 100% 80% at -5% 70%, rgba(16,185,129,.95) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(13,148,136,.95) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(101,163,13,.85) 0%, transparent 52%),
   #4da898`,
	`radial-gradient(ellipse 100% 80% at -5% 70%, rgba(217,119,6,.95) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(234,88,12,.95) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(220,38,38,.8) 0%, transparent 52%),
   #c8863a`,
	`radial-gradient(ellipse 100% 80% at -5% 70%, rgba(244,63,94,.8) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(192,38,211,.85) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(168,85,247,.8) 0%, transparent 52%),
   #c87aba`,
	`radial-gradient(ellipse 100% 80% at -5% 70%, rgba(125,211,252,.9) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(165,180,252,.9) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(196,181,253,.85) 0%, transparent 52%),
   #aabff0`,
	`radial-gradient(ellipse 100% 80% at -5% 70%, rgba(74,222,128,.95) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(202,138,4,.9) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(22,163,74,.9) 0%, transparent 52%),
   #6aad7a`
];

// function getWeeklyGradientIndex(): number {
// 	const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
// 	const startOfYear = new Date(now.getFullYear(), 0, 1);
// 	const weekNum = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 86_400_000));
// 	return weekNum % GRADIENT_VARIANTS.length;
// }

/* ─── Props ──────────────────────────────────────────────── */

interface Props {
	demoBriefing: Briefing;
}

/* ─── Landing page ───────────────────────────────────────── */

export default function LandingPage({ demoBriefing }: Props) {
	const [showDemo, setShowDemo] = useState(false);
	const [password, setPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [shakeKey, setShakeKey] = useState(0);

	useEffect(() => {
		document.body.style.background = GRADIENT_VARIANTS[0]; // warm
		document.body.style.backgroundAttachment = 'fixed';
	}, []);

	if (showDemo) {
		return <Dashboard briefing={demoBriefing} isDemo={true} error={null} onBack={() => setShowDemo(false)} />;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitting(true);
		setErrorMsg('');
		try {
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});
			if (res.ok) {
				window.location.reload();
			} else {
				setErrorMsg('incorrect key');
				setShakeKey((k) => k + 1);
				setPassword('');
			}
		} catch {
			setErrorMsg('something went wrong');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '1.5rem'
			}}
		>
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
				style={{ width: '100%', maxWidth: 720 }}
				suppressHydrationWarning
			>
				{/* Card */}
				<div
					style={{
						padding: '2.5rem 2rem',
						borderRadius: '1.25rem',
						background: 'rgba(255,255,255,0.18)',
						backdropFilter: 'blur(20px)',
						WebkitBackdropFilter: 'blur(20px)',
						border: '1px solid rgba(255,255,255,0.35)'
					}}
				>
					{/* Eyebrow */}
					<p
						style={{
							fontFamily: 'var(--font-inter)',
							fontSize: 12,
							fontWeight: 700,
							letterSpacing: '0.1em',
							textTransform: 'lowercase',
							color: '#ffffff',
							margin: '0 0 1rem'
						}}
					>
						morning-briefing
					</p>

					{/* Heading */}
					<h1
						style={{
							fontFamily: 'var(--font-inter)',
							fontWeight: 800,
							fontSize: 'clamp(2rem, 6vw, 2.8rem)',
							lineHeight: 1.1,
							letterSpacing: '-0.03em',
							color: '#ffffff',
							margin: '0 0 1rem',
							textTransform: 'lowercase'
						}}
					>
						this site is custom-designed for mykaala.
					</h1>

					{/* Description */}
					<p
						style={{
							fontFamily: 'var(--font-inter)',
							fontWeight: 400,
							fontSize: 15,
							lineHeight: 1.7,
							color: '#ffffff',
							margin: '0 0 2rem',
							textTransform: 'lowercase'
						}}
					>
						a personal daily briefing assistant — packed with news, weather, calendar, tasks, and prayer times.
						you&apos;re welcome to look around though.
					</p>

					{/* Divider */}
					<div
						style={{
							borderTop: '1px solid rgba(255,255,255,0.15)',
							marginBottom: '1.75rem'
						}}
					/>

					{/* Sign-in form */}
					<form onSubmit={handleSubmit} style={{ marginBottom: '1.25rem' }}>
						<p
							style={{
								fontFamily: 'var(--font-inter)',
								fontSize: 13,
								fontWeight: 600,
								color: '#ffffff',
								textTransform: 'lowercase',
								margin: '0 0 0.6rem',
								letterSpacing: '0.04em'
							}}
						>
							are you mykaala signing in from a new device?
						</p>

						<motion.div
							key={shakeKey}
							animate={shakeKey > 0 ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
							transition={{ duration: 0.4 }}
							style={{ display: 'flex', gap: 8 }}
						>
							<input
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder='access key'
								autoComplete='current-password'
								style={{
									flex: 1,
									padding: '0.65rem 0.85rem',
									borderRadius: 8,
									border: '1px solid rgba(255,255,255,0.25)',
									background: 'rgba(255,255,255,0.1)',
									color: '#ffffff',
									fontFamily: 'var(--font-inter)',
									fontSize: 15,
									outline: 'none',
									minWidth: 0
								}}
							/>
							<button
								type='submit'
								disabled={submitting || !password}
								style={{
									padding: '0.65rem 1.1rem',
									borderRadius: 8,
									border: '1px solid rgba(255,255,255,0.3)',
									background: 'rgba(255,255,255,0.2)',
									color: '#ffffff',
									fontFamily: 'var(--font-inter)',
									fontWeight: 600,
									fontSize: 14,
									cursor: submitting || !password ? 'not-allowed' : 'pointer',
									opacity: submitting || !password ? 0.5 : 1,
									textTransform: 'lowercase',
									whiteSpace: 'nowrap',
									flexShrink: 0
								}}
							>
								{submitting ? '...' : 'sign in →'}
							</button>
						</motion.div>

						{errorMsg && (
							<p
								style={{
									fontFamily: 'var(--font-inter)',
									fontSize: 13,
									color: '#f87171',
									margin: '6px 0 0',
									textTransform: 'lowercase'
								}}
							>
								{errorMsg}
							</p>
						)}
					</form>

					{/* Demo link */}
					<button
						onClick={() => setShowDemo(true)}
						style={{
							background: 'none',
							border: 'none',
							padding: 0,
							cursor: 'pointer',
							fontFamily: 'var(--font-inter)',
							fontSize: 14,
							fontWeight: 500,
							color: '#ffffff',
							textTransform: 'lowercase',
							textDecoration: 'underline',
							textDecorationColor: 'rgba(255,255,255,0.4)',
							textUnderlineOffset: 3
						}}
					>
						or view the demo version →
					</button>
				</div>
			</motion.div>
		</div>
	);
}
