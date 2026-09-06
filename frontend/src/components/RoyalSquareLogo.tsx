interface RoyalSquareLogoProps {
  size?: number;
  className?: string;
}

/**
 * Royal Square Financial brand emblem for the web portals.
 * Uses the same authentic logo asset shipped with the mobile app
 * (frontend public/royalsquare-logo.svg). Aspect ratio 603 x 538.
 */
export const RoyalSquareLogo = ({ size = 36, className }: RoyalSquareLogoProps) => (
  <img
    src="/royalsquare-logo.svg"
    alt="Royal Square Financial"
    width={size}
    height={Math.round(size * (538 / 603))}
    className={className}
    style={{ objectFit: 'contain' }}
  />
);
