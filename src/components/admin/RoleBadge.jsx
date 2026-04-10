import { cn } from '@/lib/utils';

const stylesByRole = {
  super_admin: 'bg-red-500/15 text-red-300 border-red-400/30',
  admin: 'bg-red-500/10 text-red-200 border-red-400/25',
  staff: 'bg-amber-500/12 text-amber-200 border-amber-400/30',
  photographer: 'bg-blue-500/15 text-blue-200 border-blue-400/30',
  customer: 'bg-muted text-muted-foreground border-border',
};

export default function RoleBadge({ role }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize',
        stylesByRole[role] || stylesByRole.customer
      )}
    >
      {role}
    </span>
  );
}
