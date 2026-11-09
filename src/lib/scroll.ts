import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ScrollTrigger.refresh() that cannot throw. Triggers whose element has already left the page (a
 * list that re-rendered, a mode switch that rebuilt the gallery) make GSAP's refresh crash with
 * "Cannot read properties of undefined (reading 'end')", so those are dropped first.
 */
export function refreshScrollTriggers() {
  for (const st of ScrollTrigger.getAll()) {
    const el = st.trigger;
    if (el instanceof Element && !el.isConnected) st.kill();
  }
  try {
    ScrollTrigger.refresh();
  } catch {
    // positions stay as they were until the next refresh; nothing the visitor needs to see
  }
}
