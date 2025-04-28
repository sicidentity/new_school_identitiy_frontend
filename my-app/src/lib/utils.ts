import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const FormSchema = () => z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
})

export const SignInFormSchema = () => z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const PasswordFormSchema = () => z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const CreateUserSchema = () => z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string().min(3),
})
