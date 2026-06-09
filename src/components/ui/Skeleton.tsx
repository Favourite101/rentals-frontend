import * as React from 'react';
import { cn } from '@/lib/utils/helpers';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
);

// Matches EquipmentCard.tsx full-size card shape
export const EquipmentCardSkeleton: React.FC = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-9 w-full rounded-xl mt-1" />
    </div>
  </div>
);

// Matches EquipmentDetail.tsx two-column layout
export const EquipmentDetailSkeleton: React.FC = () => (
  <div className="bg-white">
    <div className="container-custom py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10">
        {/* Left column */}
        <div>
          <Skeleton className="w-full aspect-[4/3] rounded-2xl mb-3" />
          <div className="flex gap-2 mb-6">
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-16 w-20 rounded-xl flex-shrink-0" />)}
          </div>
          <Skeleton className="h-5 w-24 rounded-full mb-4" />
          <Skeleton className="h-8 w-2/3 mb-2" />
          <div className="flex gap-3 mb-5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full mb-1.5" />
          <Skeleton className="h-4 w-5/6 mb-6" />
          {/* Specs strip */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl mb-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
          {/* Owner */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Right: booking panel */}
        <div>
          <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm space-y-5">
            <div className="flex justify-between items-end">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Matches Dashboard.tsx: header + 3 stat cards + quick actions + table
export const DashboardSkeleton: React.FC = () => (
  <div className="container-custom py-12">
    <div className="mb-8">
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-40" />
    </div>

    {/* Stat cards */}
    <div className="grid gap-6 md:grid-cols-3 mb-8">
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-14" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>

    {/* Quick action buttons */}
    <div className="mb-8 flex flex-wrap gap-4">
      {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-11 w-36 rounded-md" />)}
    </div>

    {/* Bookings table card */}
    <div className="rounded-lg border bg-card">
      <div className="p-6 border-b">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="p-6">
        <div className="space-y-1">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="w-28 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Matches PaymentPage.tsx two-column layout
export const PaymentPageSkeleton: React.FC = () => (
  <div className="container-custom py-12">
    <Skeleton className="h-4 w-16 mb-6" />
    <Skeleton className="h-9 w-52 mb-6" />

    <div className="grid gap-8 lg:grid-cols-2">
      {/* Booking summary card */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="border-t pt-4 space-y-2">
            <Skeleton className="h-4 w-48" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="flex justify-between pt-2 border-t">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment card */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b space-y-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg space-y-2.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="flex justify-between border-t pt-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  </div>
);
