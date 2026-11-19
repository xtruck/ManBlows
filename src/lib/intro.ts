// Tiny signal between the preloader and the sections that wait for it.

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
