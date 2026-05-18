export type ActionResult = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export function success(message: string): ActionResult {
  return { ok: true, message };
}

export function failure(message: string, fieldErrors?: Record<string, string>): ActionResult {
  return { ok: false, message, fieldErrors };
}

export function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function nullableText(formData: FormData, key: string) {
  const value = formText(formData, key);
  return value.length ? value : null;
}

export function nullableNumber(formData: FormData, key: string) {
  const raw = formText(formData, key);
  if (!raw) {
    return null;
  }

  const parsed = Number(raw.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function validateEmail(email: string | null) {
  if (!email) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string | null) {
  if (!phone) {
    return true;
  }

  return /^[+()\-\s\d.]{7,20}$/.test(phone);
}

export function isAllowed<T extends readonly string[]>(value: string, allowed: T): value is T[number] {
  return allowed.includes(value);
}

export function optionalUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}
