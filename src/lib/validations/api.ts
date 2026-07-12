import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const contactFormSchema = z.object({
  formType: z.string().min(1, "Form type is required").max(50),
  name: z.string().min(2, "Name is too short").max(100),
  email: z.string().email("Invalid email format").max(255),
  phone: z.string().max(20).optional().nullable(),
  subject: z.string().min(3, "Subject is too short").max(200),
  message: z.string().min(10, "Message is too short").max(2000),
  department: z.string().optional().nullable(),
});
