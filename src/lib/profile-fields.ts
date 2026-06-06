// Shared customer profile field model — progressive profiling.
// The 6 fields (name, WhatsApp mobile, email, nationality, residency,
// gender) are OPTIONAL on sign-up and on /my-account/profile, but
// MANDATORY at checkout. Extra fields persist as Woo customer meta
// (schema-probed live 2026-06-07: updateCustomer.metaData accepted,
// customer.metaData(keysIn:) readable, checkout.metaData accepted).
import { isCountryCode } from './countries'

export const META_KEYS = {
  nationality: 'uaej_nationality',
  residency: 'uaej_residency',
  gender: 'uaej_gender',
} as const

export const META_KEYS_IN = Object.values(META_KEYS)

export const RESIDENCY_OPTIONS: ReadonlyArray<readonly [string, string]> = [
  ['resident', 'UAE Resident'],
  ['non_resident', 'Non-Resident (Visitor)'],
]

export const GENDER_OPTIONS: ReadonlyArray<readonly [string, string]> = [
  ['male', 'Male'],
  ['female', 'Female'],
  ['unspecified', 'Prefer not to say'],
]

export function isResidency(v: string): boolean {
  return RESIDENCY_OPTIONS.some(([k]) => k === v)
}
export function isGender(v: string): boolean {
  return GENDER_OPTIONS.some(([k]) => k === v)
}
export function isNationality(v: string): boolean {
  return isCountryCode(v)
}

export type ExtendedProfile = {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  nationality: string
  residency: string
  gender: string
}

/** Map customer.metaData(keysIn:) nodes → flat fields. */
export function metaToFields(
  meta: Array<{ key: string | null; value: string | null }> | null | undefined,
): { nationality: string; residency: string; gender: string } {
  const get = (k: string) => meta?.find((m) => m.key === k)?.value ?? ''
  return {
    nationality: get(META_KEYS.nationality),
    residency: get(META_KEYS.residency),
    gender: get(META_KEYS.gender),
  }
}

/** Build the metaData input array for updateCustomer / checkout. */
export function fieldsToMeta(f: { nationality?: string; residency?: string; gender?: string }) {
  const out: Array<{ key: string; value: string }> = []
  if (f.nationality) out.push({ key: META_KEYS.nationality, value: f.nationality })
  if (f.residency) out.push({ key: META_KEYS.residency, value: f.residency })
  if (f.gender) out.push({ key: META_KEYS.gender, value: f.gender })
  return out
}

/** Profile completeness 0–100 across the 6 customer data points. */
export function profileCompleteness(p: Partial<ExtendedProfile>): number {
  const checks = [
    Boolean(p.firstName?.trim() && p.lastName?.trim()),
    Boolean(p.phone?.trim()),
    Boolean(p.email?.trim()),
    Boolean(p.nationality),
    Boolean(p.residency),
    Boolean(p.gender),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}
