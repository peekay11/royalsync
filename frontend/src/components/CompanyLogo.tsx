import { useState } from 'react';

/**
 * Web mirror of the mobile app's CompanyLogo (Logo.dev API).
 * Resolves an insurer/provider logo by domain or name, falling back to a
 * monogram badge if the logo can't be loaded — so no broken-image icon
 * ever shows. This is the only sanctioned way to render an image in a
 * component: a company logo inside a list/row/dropdown.
 */
const LOGODEV_TOKEN = 'pk_YATscD2-Rx6ItVMsD1ElFw';

// Known South African financial & insurance institutions → primary domains.
const DOMAIN_MAP: Record<string, string> = {
  'King Price': 'kingprice.co.za',
  Sanlam: 'sanlam.co.za',
  'Discovery Health': 'discovery.co.za',
  Discovery: 'discovery.co.za',
  Santam: 'santam.co.za',
  Liberty: 'liberty.co.za',
  'Old Mutual': 'oldmutual.co.za',
  Momentum: 'momentum.co.za',
  'Allan Gray': 'allangray.co.za',
  FNB: 'fnb.co.za',
  'First National Bank': 'fnb.co.za',
  'Royal Square': 'royalsquare.co.za',
};

interface CompanyLogoProps {
  name: string;
  domain?: string;
  size?: number;
  className?: string;
}

export const CompanyLogo = ({ name, domain, size = 40, className }: CompanyLogoProps) => {
  const [hasError, setHasError] = useState(false);

  const targetDomain = domain || DOMAIN_MAP[name];
  const url = targetDomain
    ? `https://img.logo.dev/${encodeURIComponent(targetDomain)}?token=${LOGODEV_TOKEN}&format=png&retina=true`
    : `https://img.logo.dev/name/${encodeURIComponent(name)}?token=${LOGODEV_TOKEN}&format=png&retina=true`;

  const monogram = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (hasError || !name) {
    return (
      <div
        className={`rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold ${className ?? ''}`}
        style={{ width: size, height: size, fontSize: size * 0.36 }}
      >
        {monogram || '—'}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      className={`rounded-full border border-gray-200 bg-white object-contain p-1 ${className ?? ''}`}
      style={{ width: size, height: size }}
      onError={() => setHasError(true)}
    />
  );
};
