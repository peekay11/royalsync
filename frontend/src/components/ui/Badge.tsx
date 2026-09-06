type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray' | 'orange';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  green:  'bg-green-100 text-green-800 border-green-200',
  red:    'bg-red-100 text-red-700 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  blue:   'bg-blue-100 text-blue-800 border-blue-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray:   'bg-gray-100 text-gray-600 border-gray-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
};

// Auto-map common status strings
export const statusVariant = (status: string): BadgeVariant => {
  const s = status.toLowerCase().replace(/[_\s]/g, '');
  if (['active','verified','paid','live','won','settled','completed','approved','open'].includes(s)) return 'green';
  if (['lapsed','failed','rejected','lost','deactivated','cancelled','closed'].includes(s)) return 'red';
  if (['pending','new','draft','submitted','inreview','underassessment'].includes(s)) return 'yellow';
  if (['acknowledged','contacted','qualified','comparing','clientdeciding','inprogress'].includes(s)) return 'blue';
  if (['selected','inception','readytoquote','awaitingquotes'].includes(s)) return 'purple';
  if (['reopened','snoozed'].includes(s)) return 'orange';
  return 'gray';
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'xs';
}

export const Badge = ({ label, variant, size = 'sm' }: BadgeProps) => {
  const v = variant ?? statusVariant(label);
  const sz = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center rounded-full font-medium border capitalize ${sz} ${VARIANT_CLASSES[v]}`}>
      {label.replace(/_/g, ' ')}
    </span>
  );
};
