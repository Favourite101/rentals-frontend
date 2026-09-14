import * as React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { AtloLogo } from '@/components/layout/AtloLogo';
import { ToastContainer } from '@/components/ui/Toast';
import { waitlistApi } from '@/lib/api/waitlist';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { ROUTES, WAITLIST_INTEREST_LABELS, LAUNCH_DATE } from '@/constants';
import type { WaitlistInterest } from '@/types';
import './Waitlist.css';

const waitlistSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(100),
  email: z.string().email('Please enter a valid email address'),
  interest: z.enum(['borrow', 'lend', 'both']),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

const INTEREST_OPTIONS = Object.entries(WAITLIST_INTEREST_LABELS) as [WaitlistInterest, string][];

// Items people will be able to rent — shown on the rotating ring.
const RING_ITEMS = [
  { id: '1516035069371-29a1b244cc32', label: 'Camera' },
  { id: '1545454675-3531b543be5d', label: 'Speaker' },
  { id: '1595777457583-95e059d581b8', label: 'Dress' },
  { id: '1606144042614-b2417e99c4e3', label: 'PlayStation 5' },
  { id: '1504280390367-361c6d9f38f4', label: 'Tent' },
  { id: '1510915361894-db8b60106cb1', label: 'Guitar' },
  { id: '1473968512647-3e447244af8f', label: 'Drone' },
  { id: '1478720568477-152d9b164e26', label: 'Projector' },
  { id: '1502920917128-1aa500764cbd', label: 'DSLR camera' },
  { id: '1485965120184-e220f721d03e', label: 'Bicycle' },
  { id: '1505740420928-5e560c06d30e', label: 'Headphones' },
  { id: '1592840496694-26d035b52b48', label: 'Game controller' },
];

// TODO: replace with atlo's real social profile URLs.
const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#' },
  { label: 'X', href: '#' },
  { label: 'TikTok', href: '#' },
];

const useCountdown = (target?: string) => {
  const end = React.useMemo(() => (target ? new Date(target).getTime() : NaN), [target]);
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (Number.isNaN(end)) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [end]);

  if (Number.isNaN(end)) return null;
  const diff = Math.max(0, end - now);
  return [
    { value: Math.floor(diff / 86_400_000), unit: 'days' },
    { value: Math.floor(diff / 3_600_000) % 24, unit: 'hours' },
    { value: Math.floor(diff / 60_000) % 60, unit: 'minutes' },
    { value: Math.floor(diff / 1000) % 60, unit: 'seconds' },
  ];
};

const RollLink: React.FC<{ href?: string; to?: string; children: string }> = ({ href, to, children }) => {
  const inner = (
    <>
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </>
  );
  const className = 'atlo-roll text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-gray-900';
  return to
    ? <Link to={to} className={className}>{inner}</Link>
    : <a href={href} className={className} target="_blank" rel="noreferrer">{inner}</a>;
};

export const Waitlist: React.FC = () => {
  const countdown = useCountdown(LAUNCH_DATE);
  const [result, setResult] = React.useState<{ position: number; already: boolean } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { interest: 'both' },
  });

  const interest = watch('interest');

  const joinMutation = useMutation({
    mutationFn: waitlistApi.join,
    onSuccess: (data) => {
      setResult({ position: data.position, already: data.message.toLowerCase().includes('already') });
    },
    onError: (error) => showToast(handleApiError(error), 'error'),
  });

  const onSubmit = (data: WaitlistFormData) => joinMutation.mutate(data);

  return (
    <div className="min-h-[100svh] flex flex-col bg-white text-gray-900 overflow-x-hidden">

      {/* ── Top bar ────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 sm:px-10 pt-6">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <AtloLogo className="h-7 w-7" />
          <span className="text-xl font-bold tracking-tight">atlo</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-8" aria-label="Social media">
          {SOCIAL_LINKS.map(link => <RollLink key={link.label} href={link.href}>{link.label}</RollLink>)}
        </nav>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-4">

        {/* Rotating ring of rentable items */}
        <div className="atlo-stage" role="img" aria-label={`Things you'll be able to rent: ${RING_ITEMS.map(i => i.label).join(', ')}`}>
          <div className="atlo-ring">
            {RING_ITEMS.map((item, i) => (
              <div
                key={item.id}
                className="atlo-card"
                style={{ '--angle': `${(360 / RING_ITEMS.length) * i}deg` } as React.CSSProperties}
              >
                <img
                  src={`https://images.unsplash.com/photo-${item.id}?w=420&h=600&fit=crop&q=75&auto=format`}
                  alt=""
                  loading={i < 4 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Countdown (only when VITE_LAUNCH_DATE is set) */}
        {countdown && (
          <div className="atlo-rise relative z-10 mt-4 flex items-baseline gap-1 sm:gap-2 text-gray-900" aria-label="Time until launch">
            {countdown.map(({ value, unit }, i) => (
              <React.Fragment key={unit}>
                <span className="text-2xl sm:text-4xl font-semibold tabular-nums">{String(value).padStart(2, '0')}</span>
                <span className="text-xs sm:text-sm text-gray-400">{unit}</span>
                {i < countdown.length - 1 && <span className="text-xl sm:text-3xl text-gray-300 mx-0.5 sm:mx-1">:</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Headline */}
        <h1 className="atlo-rise relative z-10 mt-2 text-center font-extrabold uppercase leading-[0.85] tracking-[-0.04em] text-[clamp(3rem,12.5vw,7.5rem)]">
          Coming <span className="text-primary">soon</span>
        </h1>
        <p className="atlo-rise mt-4 max-w-md text-center text-sm sm:text-base text-gray-500">
          Rent what you need from people near you and earn from what you already own. Join the waitlist for early access.
        </p>

        {/* Waitlist form / success */}
        <div className="atlo-rise mt-6 w-full max-w-xl">
          {result ? (
            <div className="rounded-3xl border border-gray-200 px-6 py-6 text-center" role="status">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                {result.already ? "You're already on the list" : "You're on the list"}
              </p>
              <p className="mt-1 text-5xl font-extrabold tracking-tight text-primary">#{result.position}</p>
              <p className="mt-2 text-sm text-gray-500">
                {result.already ? 'No need to sign up again. ' : 'Check your inbox for a confirmation. '}
                We'll email you the moment atlo opens.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col sm:flex-row gap-2 rounded-3xl sm:rounded-full border border-gray-200 bg-white p-2 shadow-[0_12px_40px_-16px_rgba(17,12,46,0.18)] focus-within:border-gray-400 transition-colors">
                <label htmlFor="waitlist-name" className="sr-only">Name</label>
                <input
                  id="waitlist-name"
                  placeholder="Your name"
                  autoComplete="name"
                  {...register('name')}
                  className="min-w-0 sm:w-40 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-gray-400 sm:border-r sm:border-gray-200"
                />
                <label htmlFor="waitlist-email" className="sr-only">Email address</label>
                <input
                  id="waitlist-email"
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  {...register('email')}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={joinMutation.isPending}
                  className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:opacity-60 whitespace-nowrap"
                >
                  {joinMutation.isPending ? 'Joining…' : 'Join waitlist'}
                </button>
              </div>

              {(errors.name || errors.email) && (
                <p className="mt-2 px-4 text-sm text-red-600">{errors.name?.message || errors.email?.message}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2" role="radiogroup" aria-label="I want to">
                <span className="text-xs text-gray-400 mr-1">I want to</span>
                {INTEREST_OPTIONS.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={interest === value}
                    onClick={() => setValue('interest', value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      interest === value
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </form>
          )}
        </div>
      </main>

      {/* ── Footer bar ─────────────────────────────────────────── */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-10 pb-6 pt-4">
        <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
          © {new Date().getFullYear()} atlo. All rights reserved.
        </p>
        <nav className="flex items-center gap-6" aria-label="Legal">
          <RollLink to={ROUTES.TERMS}>Terms</RollLink>
          <RollLink to={ROUTES.PRIVACY}>Privacy</RollLink>
        </nav>
      </footer>

      <ToastContainer />
    </div>
  );
};
