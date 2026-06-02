import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Please select your LGA'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category_id: z.number().min(1, 'Category is required'),
  daily_rate: z.number().min(0.01, 'Daily rate must be greater than 0'),
  image_url: z.string().url('Must be a valid URL').or(z.literal('')),
  is_available: z.boolean(),
});

export const bookingSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EquipmentFormData = z.infer<typeof equipmentSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
