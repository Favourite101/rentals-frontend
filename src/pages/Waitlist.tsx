import * as React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { AtloLogo } from '@/components/layout/AtloLogo';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { waitlistApi } from '@/lib/api/waitlist';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { ROUTES, QUERY_KEYS, WAITLIST_INTEREST_LABELS } from '@/constants';
import { CheckCircle, Search, Wallet, Shield, Users, CreditCard, MessageSquare } from 'lucide-react';
import type { WaitlistInterest } from '@/types';

const waitlistSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(100),
  email: z.string().email('Please enter a valid email address'),
  interest: z.enum(['borrow', 'lend', 'both']),
  location: z.string().max(100).optional(),
  referral_source: z.string().max(100).optional(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

const INTEREST_OPTIONS = Object.entries(WAITLIST_INTEREST_LABELS) as [WaitlistInterest, string][];

const REFERRAL_OPTIONS = ['Friend or family', 'Instagram', 'X / Twitter', 'TikTok', 'WhatsApp', 'Search engine', 'Other'];

const HOW_IT_WORKS = [
  { icon: Search, title: 'Borrow', text: 'Find cameras, speakers, gaming consoles, outfits and more from people near you — for a fraction of the price of buying.' },
  { icon: Wallet, title: 'Lend', text: 'List things you already own and earn when they would otherwise sit unused. You approve every request.' },
  { icon: Shield, title: 'Stay protected', text: 'Verified users, secure payments and refundable security deposits on every rental.' },
];

const TRUST_ITEMS = [
  { icon: Users, label: 'Verified users' },
  { icon: CreditCard, label: 'Secure payments' },
  { icon: MessageSquare, label: 'Chat before you rent' },
];

export const Waitlist: React.FC = () => {
  const queryClient = useQueryClient();
  const [result, setResult] = React.useState<{ position: number; email: string; already: boolean } | null>(null);

  const { data: count } = useQuery({
    queryKey: [QUERY_KEYS.WAITLIST_COUNT],
    queryFn: waitlistApi.getCount,
  });

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
    onSuccess: (data, variables) => {
      const already = data.message.toLowerCase().includes('already');
      setResult({ position: data.position, email: variables.email, already });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAITLIST_COUNT] });
      if (!already) showToast("You're on the waitlist!", 'success');
    },
    onError: (error) => showToast(handleApiError(error), 'error'),
  });

  const onSubmit = (data: WaitlistFormData) => {
    joinMutation.mutate({
      ...data,
      location: data.location || undefined,
      referral_source: data.referral_source || undefined,
    });
  };

  return (
    <Layout>
      {/* ── Hero + form ────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="container-custom py-12 lg:py-20 relative">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

            {/* Pitch */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Launching soon in Lagos
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Rent what you need,
                <span className="block text-primary">from people near you.</span>
              </h1>
              <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-lg">
                atlo is the trusted community marketplace for borrowing and lending everyday things.
                Join the waitlist to get early access when we open.
              </p>

              {!!count && count > 0 && (
                <p className="mt-6 text-sm font-semibold text-gray-900">
                  <span className="text-primary">{count.toLocaleString()}</span>{' '}
                  {count === 1 ? 'person has' : 'people have'} already joined
                </p>
              )}

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Form card */}
            <div id="join" className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8">
              {result ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {result.already ? "You're already on the list" : "You're on the list!"}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {result.already
                      ? <>We already have <strong>{result.email}</strong> — no need to sign up again.</>
                      : <>We've sent a confirmation to <strong>{result.email}</strong>.</>}
                  </p>
                  <div className="my-6 rounded-xl bg-primary/5 border border-primary/10 py-5">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Your spot</p>
                    <p className="text-4xl font-bold text-primary">#{result.position}</p>
                  </div>
                  <p className="text-sm text-gray-600">We'll email you as soon as atlo opens up.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <AtloLogo className="h-10 w-10" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Join the waitlist</h2>
                      <p className="text-sm text-gray-500">Be first in when we launch.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" autoComplete="name" {...register('name')} />
                      {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} />
                      {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>I want to</Label>
                      <div className="grid grid-cols-3 gap-2" role="radiogroup">
                        {INTEREST_OPTIONS.map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={interest === value}
                            onClick={() => setValue('interest', value)}
                            className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors ${
                              interest === value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="location">Area <span className="text-gray-400 font-normal">(optional)</span></Label>
                        <Input id="location" placeholder="e.g. Lekki, Yaba" {...register('location')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="referral_source">Heard from <span className="text-gray-400 font-normal">(optional)</span></Label>
                        <select
                          id="referral_source"
                          {...register('referral_source')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Select</option>
                          {REFERRAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>

                    <Button type="submit" className="w-full rounded-xl" disabled={joinMutation.isPending}>
                      {joinMutation.isPending ? (
                        <>
                          <Loader size="sm" className="mr-2" />
                          Joining...
                        </>
                      ) : (
                        'Get early access'
                      )}
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                      By joining you agree to our <Link to={ROUTES.PRIVACY} className="underline">privacy policy</Link>. No spam — just launch news.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-14">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-gray-900 text-center">How atlo works</h2>
          <p className="text-gray-500 text-sm text-center mt-2 mb-10">Access what you need. Earn from what you own.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      {!result && (
        <section className="bg-indigo-900">
          <div className="container-custom py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-bold text-white">Don't miss launch day.</h2>
              <p className="text-indigo-200 text-sm mt-1">Early members get first access to listings in their area.</p>
            </div>
            <a href="#join">
              <Button className="bg-white text-indigo-900 hover:bg-white/90 font-semibold px-6 rounded-xl">
                Join the waitlist
              </Button>
            </a>
          </div>
        </section>
      )}
    </Layout>
  );
};
