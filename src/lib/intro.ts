// Tiny signals between the preloader, the hero and the 3D scene.
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

/** Fired when the 3D camera model is loaded and on screen. */
const scene = signal();
export const markSceneReady = scene.fire;
export const onSceneReady = scene.on;

/** Loading progress of the 3D assets, 0 → 1, so the preloader shows real progress. */
const progressListeners = new Set<(value: number) => void>();
export function setSceneProgress(value: number) {
  progressListeners.forEach((fn) => fn(value));
}
export function onSceneProgress(fn: (value: number) => void) {
  progressListeners.add(fn);
  return () => {
    progressListeners.delete(fn);
  };
}
