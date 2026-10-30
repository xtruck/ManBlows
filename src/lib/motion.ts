import { useSyncExternalStore } from "react";

/**
 * Animation mode. "full" plays everything; "gentle" keeps only soft fades (no flying camera,
 * curtain wipes, smooth-scroll or drifting lights).
 *
 * The device's "reduce motion" setting picks the default, but many phones have it switched on
 * only to feel faster (Android "Remove animations"), so the visitor can override it either way:
 * a prompt appears when the device asks for less, and the footer has a permanent switch.
 * The choice is remembered on this device.
 */
export type MotionMode = "full" | "gentle";

const KEY = "egc-motion"; // "on" | "off", chosen by the visitor
const QUERY = "(prefers-reduced-motion: reduce)";
const listeners = new Set<() => void>();
let memory: "on" | "off" | null = null; // fallback when storage is blocked

function stored(): "on" | "off" | null {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "on" || v === "off") return v;
  } catch {}
  return memory;
}

/** True when the device asks for fewer animations. */
export const osWantsLess = () => typeof window !== "undefined" && window.matchMedia(QUERY).matches;

/** The mode to use right now (safe to call anywhere on the client). */
export function motionMode(): MotionMode {
  const s = stored();
  if (s === "on") return "full";
  if (s === "off") return "gentle";
  return osWantsLess() ? "gentle" : "full";
}

/** Has the visitor made a choice yet? */
export const hasChoice = () => stored() !== null;

export function setMotion(on: boolean) {
  memory = on ? "on" : "off";
  try {
    localStorage.setItem(KEY, memory);
  } catch {}
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", fn);
  return () => {
    listeners.delete(fn);
    mql.removeEventListener("change", fn);
  };
}

export const useMotionMode = (): MotionMode => useSyncExternalStore(subscribe, motionMode, () => "full");
export const useMotionChoice = (): boolean => useSyncExternalStore(subscribe, hasChoice, () => true);
export const useOsWantsLess = (): boolean => useSyncExternalStore(subscribe, osWantsLess, () => false);
