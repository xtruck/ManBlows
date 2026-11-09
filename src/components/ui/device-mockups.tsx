import type { ReactNode } from "react";

/**
 * A laptop and a phone drawn in CSS (see .mk-* in globals.css): a silver laptop with its thin black
 * bezel, webcam, hinge, base and thumb notch, and a phone with its titanium frame, dynamic island
 * and side buttons. They hold whatever you put inside: here, captures of the sites the studio built.
 */
export function LaptopMockup({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mk-laptop ${className}`}>
      <div className="mk-lid">
        <div className="mk-screen">
          {children}
          <span className="mk-glare" />
        </div>
      </div>
      <div className="mk-hinge" />
      <div className="mk-base" />
      <span className="mk-floor" />
    </div>
  );
}

export function PhoneMockup({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mk-phone ${className}`}>
      <div className="mk-phone-body">
        <div className="mk-phone-screen">
          <span className="mk-island" />
          {children}
          <span className="mk-glare" />
        </div>
      </div>
    </div>
  );
}
