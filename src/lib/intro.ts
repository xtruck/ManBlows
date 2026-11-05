// Tiny signal between the preloader and the sections that wait for it.

/**
 * The full intro plays once per visit (per tab). Later full loads in the same visit get a
 * short fade. The inline boot script in layout.tsx reads the same key before first paint.
 */
export const INTRO_SEEN_KEY = "egc-intro-seen";

function signal() {
  let done = false;
  const listeners = new Set<() => void>();
  return {
    fire() {
      if (done) return;
      done = true;
      listeners.forEach((fn) => fn());
      listeners.clear();
    },
    on(fn: () => void) {
      if (done) {
        fn();
        return () => {};
      }
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}

/** Fired when the preloader's shutter has opened. */
const intro = signal();
export const markIntroDone = intro.fire;
export const onIntroDone = intro.on;
