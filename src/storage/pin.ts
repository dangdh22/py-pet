import { base64ToBytes, bytesToBase64 } from "./encoding";
import type { PinHash } from "./types";

export const PIN_PATTERN = /^\d{4,6}$/;
export const PIN_ITERATIONS = 100_000;

export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

async function derive(pin: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return bytesToBase64(new Uint8Array(bits));
}

export async function hashPin(pin: string, iterations: number = PIN_ITERATIONS): Promise<PinHash> {
  if (!isValidPin(pin)) throw new Error("PIN must have 4 to 6 digits");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: bytesToBase64(salt), hash: await derive(pin, salt, iterations), iterations };
}

export async function verifyPin(pin: string, stored: PinHash): Promise<boolean> {
  return (await derive(pin, base64ToBytes(stored.salt), stored.iterations)) === stored.hash;
}
