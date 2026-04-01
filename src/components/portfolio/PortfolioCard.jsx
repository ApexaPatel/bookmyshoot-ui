import { CalendarDays, MapPin, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PortfolioCard({ portfolio }) {
  const destinationCount = portfolio.destinations?.length || 0;

  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/80">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-800">
        {portfolio.thumbnail_url ? (
          <img src={portfolio.thumbnail_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-zinc-500" />
          </div>
        )}
      </div>
      <CardContent className="space-y-3 p-5">
        <div>
          <h3 className="truncate text-lg font-semibold text-white">{portfolio.event_name}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
            <CalendarDays className="h-4 w-4" />
            {new Date(portfolio.shoot_date).toLocaleDateString()}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
            <MapPin className="h-4 w-4" />
            {portfolio.city}
          </p>
        </div>
        <p className="text-sm text-zinc-300">
          {portfolio.days} day{portfolio.days > 1 ? 's' : ''} · {destinationCount} destination{destinationCount === 1 ? '' : 's'}
        </p>
        <Button asChild className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
          <Link to={`/portfolio/${portfolio.id}`}>Edit Photoshoot</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
