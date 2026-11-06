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

/** Fired when the preloader starts to uncover the page (its cover begins to dissolve). */
const leaving = signal();
export const markIntroLeaving = leaving.fire;
/** Sections that animate in (Reveals) set up here, so nothing shows and then hides again. */
export const onIntroLeaving = leaving.on;

/** Fired when the preloader is gone. Also counts as "leaving" if that wasn't fired. */
const intro = signal();
export const markIntroDone = () => {
  leaving.fire();
  intro.fire();
};
export const onIntroDone = intro.on;

/**
 * Set by the preloader just before it fires `markIntroDone` when its last frame has landed exactly
 * on the home prism: the hero then shows the prism as is instead of playing its own entrance.
 */
let handoff = false;
export const setIntroHandoff = (v: boolean) => {
  handoff = v;
};
export const introHandoff = () => handoff;
