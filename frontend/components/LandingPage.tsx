'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Dashboard, { type Briefing } from '@/components/Dashboard';

interface Props {
	demoBriefing: Briefing;
}

export default function LandingPage({ demoBriefing }: Props) {
	const [password, setPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [shakeKey, setShakeKey] = useState(0);

	async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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

	const heroSection = (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
		>
			<div
				style={{
					padding: '2.25rem 2rem',
					borderRadius: '1.25rem',
					background: 'rgba(255,255,255,0.18)',
					backdropFilter: 'blur(20px)',
					WebkitBackdropFilter: 'blur(20px)',
					border: '1px solid rgba(255,255,255,0.35)'
				}}
			>
				<p
					style={{
						fontFamily: 'var(--font-inter)',
						fontSize: 12,
						fontWeight: 700,
						letterSpacing: '0.1em',
						textTransform: 'lowercase',
						color: '#ffffff',
						margin: '0 0 0.75rem'
					}}
				>
					morning-briefing
				</p>

				<h1
					style={{
						fontFamily: 'var(--font-inter)',
						fontWeight: 800,
						fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
						lineHeight: 1.1,
						letterSpacing: '-0.03em',
						color: '#ffffff',
						margin: '0 0 0.75rem',
						textTransform: 'lowercase'
					}}
				>
					this site is custom-designed for mykaala.
				</h1>

				<p
					style={{
						fontFamily: 'var(--font-inter)',
						fontWeight: 400,
						fontSize: 15,
						lineHeight: 1.7,
						color: 'rgba(255,255,255,0.85)',
						margin: '0 0 1.75rem',
						textTransform: 'lowercase'
					}}
				>
					a personal daily briefing — packed with news, weather, calendar, tasks, prayer times, a daily quran verse, and
					garmin health data. you&apos;re welcome to look around or{' '}
					<a
						href='https://github.com/mykaala/morning-briefing'
						target='_blank'
						rel='noopener noreferrer'
						style={{
							color: '#ffffff',
							textDecoration: 'underline',
							textDecorationColor: 'rgba(255,255,255,0.5)',
							textUnderlineOffset: 3
						}}
					>
						learn how this was made!
					</a>
					.
				</p>

				<div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginBottom: '1.5rem' }} />

				<form onSubmit={handleSubmit}>
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
			</div>

			<motion.p
				animate={{ opacity: [0.7, 1, 0.7], y: [0, 7, 0] }}
				transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
				style={{
					marginTop: '2rem',
					textAlign: 'center',
					fontFamily: 'var(--font-inter)',
					fontSize: 15,
					fontWeight: 700,
					letterSpacing: '0.08em',
					textTransform: 'lowercase',
					color: '#ffffff',
					margin: '2rem 0 0'
				}}
			>
				scroll for demo ↓
			</motion.p>
		</motion.div>
	);

	return <Dashboard briefing={demoBriefing} isDemo={true} error={null} heroSection={heroSection} />;
}
