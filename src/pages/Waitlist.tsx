import * as React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { waitlistApi } from '@/lib/api/waitlist';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { ROUTES, QUERY_KEYS, WAITLIST_INTEREST_LABELS } from '@/constants';
import { CheckCircle, Sparkles, ArrowLeft } from 'lucide-react';
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

  if (result) {
    return (
      <Layout>
        <div className="container-custom py-12 flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">
                {result.already ? "You're already on the list" : "You're on the list!"}
              </CardTitle>
              <CardDescription className="mt-2">
                {result.already
                  ? <>We already have <strong>{result.email}</strong> — no need to sign up again.</>
                  : <>We've sent a confirmation to <strong>{result.email}</strong>.</>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-primary/5 border border-primary/10 py-5 text-center">
                <p className="text-xs uppercase tracking-wider text-gray-500">Your spot</p>
                <p className="text-4xl font-bold text-primary">#{result.position}</p>
              </div>
              <p className="text-sm text-gray-600 text-center">
                We'll email you as soon as atlo opens up in your area.
              </p>
              <Link to={ROUTES.HOME} className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-12 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Join the atlo waitlist</CardTitle>
            <CardDescription>
              Rent what you need from people near you — and earn from what you already own. Be first in when we launch.
            </CardDescription>
            {!!count && count > 0 && (
              <p className="mt-3 text-sm font-medium text-primary">
                {count.toLocaleString()} {count === 1 ? 'person has' : 'people have'} already joined
              </p>
            )}
          </CardHeader>
          <CardContent>
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

              <div className="space-y-2">
                <Label htmlFor="location">Area <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input id="location" placeholder="e.g. Lekki, Yaba, Ikeja" {...register('location')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_source">How did you hear about us? <span className="text-gray-400 font-normal">(optional)</span></Label>
                <select
                  id="referral_source"
                  {...register('referral_source')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select an option</option>
                  {REFERRAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={joinMutation.isPending}>
                {joinMutation.isPending ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Joining...
                  </>
                ) : (
                  'Join the waitlist'
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                By joining you agree to our <Link to={ROUTES.PRIVACY} className="underline">privacy policy</Link>. No spam — just launch news.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
