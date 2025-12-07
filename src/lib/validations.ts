import { z } from "zod";

// Phone number validation (Iranian format)
const phoneRegex = /^09\d{9}$/;

// URL validation for images
const imageUrlSchema = z.string().max(500).optional().or(z.literal("")).refine(
  (val) => !val || val.startsWith("https://") || val.startsWith("http://"),
  { message: "آدرس لینک باید با http:// یا https:// شروع شود" }
);

// Address form schema
export const addressSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "عنوان آدرس الزامی است")
    .max(50, "عنوان آدرس نباید بیشتر از ۵۰ کاراکتر باشد"),
  full_address: z.string()
    .trim()
    .min(10, "آدرس باید حداقل ۱۰ کاراکتر باشد")
    .max(500, "آدرس نباید بیشتر از ۵۰۰ کاراکتر باشد"),
  phone: z.string()
    .trim()
    .min(1, "شماره تماس الزامی است")
    .regex(phoneRegex, "فرمت شماره تماس نامعتبر است (مثال: 09123456789)"),
  postal_code: z.string()
    .trim()
    .max(10, "کد پستی نباید بیشتر از ۱۰ رقم باشد")
    .nullable()
    .optional(),
  is_default: z.boolean().nullable().optional().default(false),
});

// Product form schema
export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "نام محصول الزامی است")
    .max(100, "نام محصول نباید بیشتر از ۱۰۰ کاراکتر باشد"),
  description: z.string()
    .trim()
    .max(1000, "توضیحات نباید بیشتر از ۱۰۰۰ کاراکتر باشد")
    .nullable()
    .optional(),
  price: z.number()
    .min(0, "قیمت نمی‌تواند منفی باشد")
    .max(1000000000, "قیمت بسیار زیاد است"),
  stock: z.number()
    .int("موجودی باید عدد صحیح باشد")
    .min(0, "موجودی نمی‌تواند منفی باشد")
    .max(1000000, "موجودی بسیار زیاد است"),
  image_url: z.string().max(500).nullable().optional(),
  is_available: z.boolean().nullable().optional().default(true),
});

// Store form schema
export const storeSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "نام غرفه الزامی است")
    .max(100, "نام غرفه نباید بیشتر از ۱۰۰ کاراکتر باشد"),
  description: z.string()
    .trim()
    .max(1000, "توضیحات نباید بیشتر از ۱۰۰۰ کاراکتر باشد")
    .nullable()
    .optional(),
  phone: z.string()
    .trim()
    .regex(phoneRegex, "فرمت شماره تماس نامعتبر است (مثال: 09123456789)")
    .nullable()
    .optional()
    .or(z.literal("")),
  address: z.string()
    .trim()
    .max(500, "آدرس نباید بیشتر از ۵۰۰ کاراکتر باشد")
    .nullable()
    .optional(),
  logo_url: z.string().max(500).nullable().optional(),
});

// Profile form schema
export const profileSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, "نام و نام خانوادگی الزامی است")
    .max(100, "نام نباید بیشتر از ۱۰۰ کاراکتر باشد"),
  phone: z.string()
    .trim()
    .regex(phoneRegex, "فرمت شماره تماس نامعتبر است (مثال: 09123456789)")
    .nullable()
    .optional()
    .or(z.literal("")),
});

// Order notes schema
export const orderNotesSchema = z.string()
  .trim()
  .max(500, "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد")
  .optional()
  .or(z.literal(""));

export type AddressFormData = z.infer<typeof addressSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type StoreFormData = z.infer<typeof storeSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
