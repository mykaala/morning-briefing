'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Dashboard, { type Briefing } from '@/components/Dashboard';
import NightDashboard, { type NightBriefing } from '@/components/NightDashboard';

/* ─── Types ──────────────────────────────────────────────── */

type Tab = 'morning' | 'night';

interface Props {
	morningBriefing: Briefing | null;
	morningError: string | null;
	nightBriefing: NightBriefing | null;
	isDemo?: boolean;
	heroSection?: React.ReactNode;
}

/* ─── Icons ──────────────────────────────────────────────── */

function SunIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="4" />
			<line x1="12" y1="2" x2="12" y2="4" />
			<line x1="12" y1="20" x2="12" y2="22" />
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
			<line x1="2" y1="12" x2="4" y2="12" />
			<line x1="20" y1="12" x2="22" y2="12" />
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		</svg>
	);
}

function MoonIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	);
}

/* ─── Tab bar ────────────────────────────────────────────── */

function TabBar({
	active,
	onChange,
	visible,
}: {
	active: Tab;
	onChange: (tab: Tab) => void;
	visible: boolean;
}) {
	const tabs: { id: Tab; icon: React.ReactNode }[] = [
		{ id: 'morning', icon: <SunIcon /> },
		{ id: 'night', icon: <MoonIcon /> },
	];

	return (
		<div
			style={{
				position: 'fixed',
				top: '1.25rem',
				left: '50%',
				transform: visible ? 'translateX(-50%)' : 'translateX(-50%) translateY(-8px)',
				zIndex: 300,
				display: 'flex',
				alignItems: 'center',
				background: 'rgba(255,255,255,0.2)',
				backdropFilter: 'blur(12px)',
				WebkitBackdropFilter: 'blur(12px)',
				border: '1px solid rgba(255,255,255,0.3)',
				borderRadius: 9999,
				padding: 4,
				gap: 0,
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? 'auto' : 'none',
				transition: 'opacity 0.35s ease, transform 0.35s ease',
			}}
		>
			{tabs.map((tab) => {
				const isActive = active === tab.id;
				return (
					<button
						key={tab.id}
						onClick={() => onChange(tab.id)}
						aria-label={tab.id}
						style={{
							position: 'relative',
							width: 36,
							height: 36,
							borderRadius: 9999,
							border: 'none',
							background: 'transparent',
							cursor: 'pointer',
							color: isActive ? '#0f172a' : 'rgba(255,255,255,0.75)',
							transition: 'color 0.2s ease',
							zIndex: 1,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{isActive && (
							<motion.div
								layoutId='tab-active'
								transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
								style={{
									position: 'absolute',
									inset: 0,
									borderRadius: 9999,
									background: 'rgba(255,255,255,0.5)',
									zIndex: -1
								}}
							/>
						)}
						{tab.icon}
					</button>
				);
			})}
		</div>
	);
}

/* ─── Night screens ──────────────────────────────────────── */

function NightLocked() {
	return (
		<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.45)', textTransform: 'lowercase', margin: 0 }}>
				tonight&apos;s briefing unlocks at 9pm eastern.
			</p>
		</div>
	);
}

function NightNotReady() {
	return (
		<div
			style={{
				height: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<p
				style={{
					fontFamily: 'var(--font-dm-sans)',
					fontSize: 15,
					fontWeight: 400,
					color: 'rgba(255,255,255,0.45)',
					textTransform: 'lowercase',
					margin: 0
				}}
			>
				tonight&apos;s briefing isn&apos;t ready yet.
			</p>
		</div>
	);
}

/* ─── TabSwitcher ────────────────────────────────────────── */

export default function TabSwitcher({ morningBriefing, morningError, nightBriefing, isDemo = false, heroSection }: Props) {
	const nightUnlocked = !isDemo && (() => {
		const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
		return now.getHours() >= 21;
	})();

	const [activeTab, setActiveTab] = useState<Tab>(nightUnlocked ? 'night' : 'morning');
	// Tab bar starts hidden when there's a hero section (landing page) and reveals on scroll
	const [tabBarVisible, setTabBarVisible] = useState(!heroSection);

	return (
		<>
			<TabBar active={activeTab} onChange={setActiveTab} visible={tabBarVisible} />

			{activeTab === 'morning' ? (
				<Dashboard
					briefing={morningBriefing}
					isDemo={isDemo}
					error={morningError}
					heroSection={heroSection}
					onHeroHide={heroSection ? () => setTabBarVisible(true) : undefined}
				/>
			) : !isDemo && !nightUnlocked ? (
				<NightLocked />
			) : nightBriefing ? (
				<NightDashboard briefing={nightBriefing} error={null} isDemo={isDemo} />
			) : (
				<NightNotReady />
			)}
		</>
	);
}
