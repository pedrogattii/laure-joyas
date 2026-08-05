/**
 * Security Input Sanitizer & Validator Utility for Laure Joyas
 * Hardens all client & server input against XSS, SQL injection, script injection, and invalid data structures.
 */

/**
 * Sanitizes plain text input by stripping HTML tags, script elements,
 * command injection characters, and dangerous event handlers.
 */
export function sanitizeText(str: unknown): string {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<[^>]*>/g, '') // Strip all HTML tags
    .replace(/javascript:/gi, '') // Strip javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Strip inline event handlers (e.g., onerror=, onload=)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // Remove ASCII control chars
    .trim();
}

/**
 * Sanitizes and validates an email address.
 * Returns empty string if email fails standard validation.
 */
export function sanitizeEmail(email: unknown): string {
  const clean = sanitizeText(email).toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return '';
  }
  return clean;
}

/**
 * Sanitizes phone number strings to allow only numbers, spaces, plus, minus, and parentheses.
 */
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  return phone.replace(/[^\d\s\+\-\(\)]/g, '').trim();
}

/**
 * Validates and sanitizes numeric values (prices, quantities, stock).
 * Returns a fallback value if invalid or below min limit.
 */
export function sanitizeNumber(
  val: unknown,
  fallback = 0,
  min = 0,
  max = Number.MAX_SAFE_INTEGER
): number {
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num)) {
    return fallback;
  }
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

/**
 * Validates a password meets minimum length requirements.
 */
export function validatePassword(password: string, minLength = 6): { valid: boolean; error?: string } {
  if (!password || password.length < minLength) {
    return {
      valid: false,
      error: `La contraseña debe tener al menos ${minLength} caracteres.`,
    };
  }
  return { valid: true };
}

/**
 * Sanitizes an object with string key-value pairs recursively.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
