import { headers } from 'next/headers';
import Dashboard, { type Briefing } from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';

/* ─── Demo data ──────────────────────────────────────────── */

const DEMO_BRIEFING: Briefing = {
	date: 'Saturday, March 28',
	greeting: 'Slept well and the morning is yours — get the paper done before noon and the rest takes care of itself.',
	prayer_times: [
		{ name: 'Dhuhr', time: '12:54', context: 'after class' },
		{ name: 'Asr', time: '16:22', context: 'between sessions' },
		{ name: 'Maghrib', time: '19:08', context: 'after gym' },
		{ name: 'Isha', time: '20:31', context: '' }
	],
	quran: {
		arabic: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ',
		translation: 'And whoever relies upon Allah — then He is sufficient for him.',
		surah_name: 'At-Talaq',
		ayah_number: 3,
		surah_number: 65
	},
	weather: {
		summary: "Cold 3°C morning but it'll warm up by afternoon. Clear skies — good day to walk between buildings.",
		daily: {
			temp_max_c: 9,
			temp_min_c: 2,
			feels_like_max_c: 6,
			feels_like_min_c: -2,
			precipitation_hours: 0,
			wind_speed_max_kmh: 18,
			wind_gusts_max_kmh: 28
		},
		hourly: [
			{
				time: '6 AM',
				temp_c: 2,
				feels_like_c: -2,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 20
			},
			{
				time: '7 AM',
				temp_c: 3,
				feels_like_c: -1,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 15
			},
			{
				time: '8 AM',
				temp_c: 4,
				feels_like_c: 0,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 10
			},
			{
				time: '9 AM',
				temp_c: 5,
				feels_like_c: 1,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 10
			},
			{
				time: '10 AM',
				temp_c: 6,
				feels_like_c: 3,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 15
			},
			{
				time: '11 AM',
				temp_c: 7,
				feels_like_c: 4,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 20
			},
			{
				time: '12 PM',
				temp_c: 8,
				feels_like_c: 5,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 20
			},
			{
				time: '1 PM',
				temp_c: 9,
				feels_like_c: 6,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 25
			},
			{
				time: '2 PM',
				temp_c: 9,
				feels_like_c: 6,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 30
			},
			{
				time: '3 PM',
				temp_c: 8,
				feels_like_c: 5,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 30
			},
			{
				time: '4 PM',
				temp_c: 7,
				feels_like_c: 4,
				precip_probability: 5,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 35
			},
			{
				time: '5 PM',
				temp_c: 6,
				feels_like_c: 3,
				precip_probability: 5,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 35
			},
			{
				time: '6 PM',
				temp_c: 5,
				feels_like_c: 2,
				precip_probability: 5,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 30
			},
			{
				time: '7 PM',
				temp_c: 4,
				feels_like_c: 1,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 25
			},
			{
				time: '8 PM',
				temp_c: 3,
				feels_like_c: 0,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 20
			},
			{
				time: '9 PM',
				temp_c: 2,
				feels_like_c: -1,
				precip_probability: 0,
				precipitation_mm: 0,
				rain_mm: 0,
				snowfall_cm: 0,
				cloud_cover_pct: 15
			}
		]
	},
	calendar: {
		day_summary: 'Morning paper deadline, research meeting at 2, tennis to close the day.',
		has_events: true,
		events: [
			{
				title: 'NLP Research Meeting',
				start_time: '2026-03-28T14:00:00-04:00',
				end_time: '2026-03-28T15:00:00-04:00',
				is_all_day: false,
				prep_nudge: 'review the latest benchmark results'
			},
			{
				title: 'CS 685 — LGRT 220',
				start_time: '2026-03-28T15:30:00-04:00',
				end_time: '2026-03-28T16:45:00-04:00',
				is_all_day: false,
				prep_nudge: 'readings done?'
			},
			{
				title: 'Tennis',
				start_time: '2026-03-28T18:00:00-04:00',
				end_time: '2026-03-28T19:30:00-04:00',
				is_all_day: false,
				prep_nudge: 'pack your racket'
			}
		]
	},
	news: [
		{
			title: 'Anthropic releases Claude 4 with major reasoning improvements',
			source: 'The Verge',
			url: '#',
			summary: 'New model shows breakthrough performance on coding and research benchmarks.'
		},
		{
			title: 'Tech hiring rebounds in 2026 as AI infrastructure spending surges',
			source: 'Bloomberg',
			url: '#',
			summary: 'Entry-level engineering roles up 34% year-over-year as companies scale AI teams.'
		}
	],
	tasks: {
		all_tasks: [
			{ title: 'Submit ML systems paper', priority: 5, due_time: 'Today', project_name: 'Inbox' },
			{ title: 'Push ProbeGym eval fixes', priority: 3, due_time: 'Today', project_name: 'Inbox' },
			{ title: 'Email advisor re: summer plans', priority: 1, due_time: 'Tomorrow', project_name: 'Inbox' }
		],
		focus_task: { title: 'Submit ML systems paper', priority: 5, due_time: 'Today', project_name: 'Inbox' },
		focus_reason: "Research meeting is at 2pm — submit before you walk in so it's off your plate."
	},
	focus: 'Get the paper done before noon. Everything after that is easy.',
	garmin: {
		body_battery_end: 72,
		sleep_hours: 7.2,
		sleep_score: 78,
		stress_avg: 28,
		steps: 8432,
		summary: 'Well-rested and low stress — good day to push.'
	}
};

/* ─── Page (server component) ────────────────────────────── */

// Explicitly Node.js runtime — prevents bundler from treating this as Edge
export const runtime = 'nodejs';

export default async function Home() {
	const headersList = await headers();
	const isDemo = headersList.get('x-demo-mode') === 'true';

	let briefing: Briefing | null = null;
	let fetchError: string | null = null;

	if (isDemo) {
		// No valid cookie — show landing page with demo option
		return <LandingPage demoBriefing={DEMO_BRIEFING} />;
	}

	const url = process.env.R2_URL;
	if (!url) {
		fetchError = 'R2_URL is not configured';
	} else {
		try {
			const res = await fetch(url, { cache: 'no-store' });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			briefing = (await res.json()) as Briefing;
		} catch (e) {
			fetchError = e instanceof Error ? e.message : 'unknown error';
		}
	}

	return <Dashboard briefing={briefing} isDemo={false} error={fetchError} />;
}
// deploy
