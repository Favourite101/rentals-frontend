import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from 'react-datepicker';
import { eachDayOfInterval, parseISO, startOfDay, isSameDay, format, addDays } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Loader, PageLoader } from '@/components/ui/Loader';
import { equipmentApi } from '@/lib/api/equipment';
import { bookingsApi } from '@/lib/api/bookings';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { bookingSchema, BookingFormData } from '@/lib/utils/validators';
import { formatCurrency, calculateDays, calculateTotalPrice } from '@/lib/utils/formatters';
import { QUERY_KEYS } from '@/constants';
import { Package, Calendar } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { ROUTES } from '@/constants';
import type { UnavailableDateRange } from '@/types';

// Convert date ranges to individual blocked dates
const getBlockedDates = (unavailableDates: UnavailableDateRange[]): Date[] => {
  const blockedDates: Date[] = [];

  for (const range of unavailableDates) {
    const start = startOfDay(parseISO(range.start_date));
    const end = startOfDay(parseISO(range.end_date));

    const daysInRange = eachDayOfInterval({ start, end });
    blockedDates.push(...daysInRange);
  }

  return blockedDates;
};

/* eslint-disable react-hooks/incompatible-library */
export const BookingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: equipment, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EQUIPMENT, slug],
    queryFn: () => equipmentApi.getBySlug(slug!),
    enabled: !!slug,
  });

  // Fetch equipment availability (unavailable dates)
  const { data: availability } = useQuery({
    queryKey: [QUERY_KEYS.EQUIPMENT_AVAILABLE, equipment?.id],
    queryFn: () => bookingsApi.getEquipmentAvailability(equipment!.id),
    enabled: !!equipment?.id,
  });

  const unavailableDates = React.useMemo(
    () => availability?.unavailable_dates || [],
    [availability]
  );

  // Convert unavailable date ranges to individual blocked dates
  const blockedDates = React.useMemo(
    () => getBlockedDates(unavailableDates),
    [unavailableDates]
  );

  // Check if a specific date is blocked
  const isDateBlocked = React.useCallback((date: Date) => {
    return blockedDates.some(blocked => isSameDay(blocked, date));
  }, [blockedDates]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');

  // Parse dates for calculations
  const startDateObj = startDate ? parseISO(startDate) : null;
  const endDateObj = endDate ? parseISO(endDate) : null;

  const days = React.useMemo(() => {
    if (startDate && endDate) {
      return calculateDays(startDate, endDate);
    }
    return 0;
  }, [startDate, endDate]);

  const totalPrice = React.useMemo(() => {
    if (equipment && startDate && endDate) {
      return calculateTotalPrice(equipment.daily_rate, startDate, endDate);
    }
    return 0;
  }, [equipment, startDate, endDate]);

  const createBookingMutation = useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: (booking) => {
      showToast('Booking created successfully!', 'success');
      navigate(`/booking/${booking.id}/payment`);
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const onSubmit = (data: BookingFormData) => {
    if (!equipment) return;

    createBookingMutation.mutate({
      equipment_id: equipment.id,
      start_date: data.start_date,
      end_date: data.end_date,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (!equipment) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <p className="text-center">Equipment not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        <BackButton to={ROUTES.EQUIPMENT_DETAIL.replace(':slug', slug!)} label="Back to Item" />
        <h1 className="text-3xl font-bold mb-6">Book Item</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Rental Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Controller
                        control={control}
                        name="start_date"
                        render={({ field }) => (
                          <DatePicker
                            id="start_date"
                            selected={field.value ? parseISO(field.value) : null}
                            onChange={(date: Date | null) => {
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                            }}
                            minDate={addDays(new Date(), 1)}
                            excludeDates={blockedDates}
                            filterDate={(date) => !isDateBlocked(date)}
                            selectsStart
                            startDate={startDateObj}
                            endDate={endDateObj}
                            placeholderText="Select start date"
                            dateFormat="MMM d, yyyy"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            calendarClassName="booking-calendar"
                            dayClassName={(date) =>
                              isDateBlocked(date) ? 'unavailable-date' : ''
                            }
                            showPopperArrow={false}
                          />
                        )}
                      />
                      {errors.start_date && (
                        <p className="text-sm text-red-600">{errors.start_date.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Controller
                        control={control}
                        name="end_date"
                        render={({ field }) => (
                          <DatePicker
                            id="end_date"
                            selected={field.value ? parseISO(field.value) : null}
                            onChange={(date: Date | null) => {
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                            }}
                            minDate={startDateObj || addDays(new Date(), 1)}
                            excludeDates={blockedDates}
                            filterDate={(date) => !isDateBlocked(date)}
                            selectsEnd
                            startDate={startDateObj}
                            endDate={endDateObj}
                            placeholderText="Select end date"
                            dateFormat="MMM d, yyyy"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            calendarClassName="booking-calendar"
                            dayClassName={(date) =>
                              isDateBlocked(date) ? 'unavailable-date' : ''
                            }
                            showPopperArrow={false}
                          />
                        )}
                      />
                      {errors.end_date && (
                        <p className="text-sm text-red-600">{errors.end_date.message}</p>
                      )}
                    </div>
                  </div>

                  {blockedDates.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Dates shown in red are unavailable</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        {...register('terms')}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="terms" className="font-normal">
                        I agree to the terms and conditions
                      </Label>
                    </div>
                    {errors.terms && (
                      <p className="text-sm text-red-600">{errors.terms.message}</p>
                    )}
                  </div>

                  {days > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Rental Duration:</strong> {days} {days === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={createBookingMutation.isPending || days === 0}
                    className="w-full"
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Creating Booking...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Equipment Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {equipment.image_url ? (
                  <img
                    src={equipment.image_url}
                    alt={equipment.name}
                    className="w-full rounded-lg aspect-video object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-1">{equipment.name}</h3>
                  <p className="text-sm text-gray-600">{equipment.category?.name}</p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Rate</span>
                    <span className="font-semibold">{formatCurrency(equipment.daily_rate)}</span>
                  </div>
                  {days > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Number of Days</span>
                        <span className="font-semibold">{days}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-primary text-lg">
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
