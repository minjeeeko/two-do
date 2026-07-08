import type { SVGProps } from 'react'

/**
 * Hand-drawn style house, recreated as SVG from the reference artwork.
 * Red roof, brown chimney, cream body, arched terracotta door, blue-pane window.
 */
export function HouseIllustration({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 190" className={className} {...rest} aria-hidden="true">
      {/* chimney */}
      <rect x="146" y="12" width="20" height="50" rx="5" fill="#7a2e1c" />
      {/* roof (overhangs the body) */}
      <path
        d="M100 20
           C104 20 107 22 110 26
           L189 110
           C193 115 190 121 183 121
           L17 121
           C10 121 7 115 11 110
           L90 26
           C93 22 96 20 100 20 Z"
        fill="#c0281a"
      />
      {/* body */}
      <path
        d="M36 112 L164 112 C169 112 172 115 172 120 L172 176 C172 182 168 185 162 185 L38 185 C32 185 28 182 28 176 L28 120 C28 115 31 112 36 112 Z"
        fill="#e7ded8"
      />
      {/* door */}
      <path d="M56 185 L56 150 C56 129 78 129 78 129 C78 129 100 129 100 150 L100 185 Z" fill="#c05a28" />
      <circle cx="91" cy="159" r="2.8" fill="#5f2a12" />
      {/* window */}
      <rect x="115" y="125" width="38" height="36" rx="4" fill="#8a4a2e" />
      <rect x="119" y="129" width="12.5" height="11.5" rx="1.5" fill="#bfe1ea" />
      <rect x="136.5" y="129" width="12.5" height="11.5" rx="1.5" fill="#bfe1ea" />
      <rect x="119" y="145.5" width="12.5" height="11.5" rx="1.5" fill="#bfe1ea" />
      <rect x="136.5" y="145.5" width="12.5" height="11.5" rx="1.5" fill="#bfe1ea" />
    </svg>
  )
}

/** Soft pale-blue cloud for the home "sky" area. */
export function CloudIllustration({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 60" className={className} {...rest} aria-hidden="true">
      <g fill="#e6eef7">
        <ellipse cx="38" cy="37" rx="26" ry="18" />
        <ellipse cx="66" cy="32" rx="30" ry="22" />
        <ellipse cx="92" cy="39" rx="22" ry="16" />
        <rect x="18" y="38" width="90" height="16" rx="8" />
      </g>
    </svg>
  )
}

function Flower({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="-3.3" r="2.5" fill="#fdfdf5" />
      <circle cx="3.1" cy="-1" r="2.5" fill="#fdfdf5" />
      <circle cx="1.95" cy="2.7" r="2.5" fill="#fdfdf5" />
      <circle cx="-1.95" cy="2.7" r="2.5" fill="#fdfdf5" />
      <circle cx="-3.1" cy="-1" r="2.5" fill="#fdfdf5" />
      <circle cx="0" cy="0" r="1.7" fill="#f2b21a" />
    </g>
  )
}

/**
 * Rounded green bush with scattered white daisies, recreated from the reference artwork.
 */
export function GrassIllustration({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 96" className={className} {...rest} aria-hidden="true">
      {/* back darker layer */}
      <path
        d="M18 92
           C4 92 2 70 16 62
           C10 44 30 36 44 44
           C48 24 78 24 84 42
           C96 30 120 36 118 54
           C138 52 146 72 132 84
           C130 92 120 92 120 92 Z"
        fill="#3f8a3f"
      />
      {/* front lighter layer */}
      <path
        d="M22 93
           C8 93 6 71 20 64
           C16 46 38 40 50 50
           C56 30 86 30 92 50
           C104 38 128 44 126 62
           C144 62 150 82 136 90
           C134 94 26 94 26 94
           C24 94 22 93 22 93 Z"
        fill="#5ba84e"
      />
      <Flower x={44} y={64} s={1.05} />
      <Flower x={72} y={54} s={1.15} />
      <Flower x={98} y={68} s={1} />
      <Flower x={58} y={78} s={0.95} />
      <Flower x={86} y={82} s={1.05} />
      <Flower x={118} y={74} s={0.95} />
      <Flower x={32} y={80} s={0.9} />
    </svg>
  )
}

/** A full-width lawn strip made of several overlapping bushes. */
export function GrassRow({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-[72px] overflow-hidden ${className}`} aria-hidden="true">
      <GrassIllustration className="absolute bottom-0 -left-6 w-[150px]" />
      <GrassIllustration className="absolute bottom-0 left-1/4 w-[135px]" />
      <GrassIllustration className="absolute bottom-0 left-1/2 -translate-x-1/4 w-[150px]" />
      <GrassIllustration className="absolute bottom-0 right-1/4 w-[130px]" />
      <GrassIllustration className="absolute bottom-0 -right-6 w-[150px]" />
    </div>
  )
}
