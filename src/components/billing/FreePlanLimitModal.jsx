import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export default function FreePlanLimitModal({ open, message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-[1.5rem] border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <p className="text-lg font-semibold text-white">Plan limit</p>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="outline" className="border-zinc-600 text-zinc-300" onClick={onClose}>
            Close
          </Button>
          <Button type="button" className="bg-indigo-600 text-white hover:bg-indigo-700" asChild>
            <Link to="/billing#available-plans" onClick={onClose}>
              Upgrade Plan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
