// src/utils/validators.js
import { z } from 'zod';

export const signUpSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email:       z.string().email('Invalid email address'),
  password:    z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirm:     z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path:    ['confirm'],
});

export const signInSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
});

export const apiKeySchema = z.object({
  apiKey: z.string().startsWith('sk-ant-', 'Anthropic API keys start with sk-ant-').min(20),
});

export const passkeyNameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(40),
});
