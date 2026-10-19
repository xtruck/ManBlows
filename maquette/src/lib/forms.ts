import { z } from "zod";

/** Ivorian numbers: optional +225/00225 prefix, then 10 digits starting 01, 05, 07, 21, 25 or 27. */
const IVORIAN_PHONE = /^(?:\+225|00225)?(?:0[157]|2[157])\d{8}$/;

const MAX_DAYS_AHEAD = 180;

function todayIso() {
  // Abidjan is on UTC all year round.
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const nom = z.string().trim().min(2, { error: "Indiquez votre nom (2 caractères minimum)." }).max(80, { error: "80 caractères maximum." });

const telephone = z
  .string()
  .transform((v) => v.replace(/[\s.\-()]/g, ""))
  .refine((v) => IVORIAN_PHONE.test(v), { error: "Numéro ivoirien attendu, par ex. 07 00 00 00 00." });

const email = z.union([z.literal(""), z.email({ error: "Adresse e-mail invalide." })]).optional().default("");

// Kept for templates that book dates (visits, reservations).
export const futureDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Choisissez une date." })
  .refine((v) => v >= todayIso(), { error: "La date ne peut pas être dans le passé." })
  .refine((v) => v <= addDays(todayIso(), MAX_DAYS_AHEAD), { error: `Réservations possibles jusqu'à ${MAX_DAYS_AHEAD} jours à l'avance.` });

const consentement = z.literal(true, { error: "Votre accord est nécessaire pour traiter la demande." });

/** Hidden field left empty by humans; bots that fill it are silently ignored. */
const website = z.string().max(0).optional().default("");

export const renseignementSchema = z.object({
  kind: z.literal("renseignement"),
  nom,
  telephone,
  email,
  profil: z.string().min(1, { error: "Indiquez qui vous êtes." }),
  unite: z.string().min(1, { error: "Choisissez une option." }),
  niveau: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(10, { error: "Précisez votre demande (10 caractères minimum)." }).max(1000, { error: "1000 caractères maximum." }),
  consentement,
  website,
});

export const formSchemas = {
  renseignement: renseignementSchema,
} as const;

export type FormKind = keyof typeof formSchemas;

export type FieldErrors = Record<string, string[] | undefined>;

export function isFormKind(value: unknown): value is FormKind {
  return typeof value === "string" && value in formSchemas;
}

export function validate(kind: FormKind, data: unknown) {
  const schema: z.ZodType = formSchemas[kind];
  const result = schema.safeParse(data);
  if (result.success) return { ok: true as const, data: result.data };
  return { ok: false as const, errors: z.flattenError(result.error).fieldErrors as FieldErrors };
}

export const dateBounds = () => ({ min: todayIso(), max: addDays(todayIso(), MAX_DAYS_AHEAD) });
