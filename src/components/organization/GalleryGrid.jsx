import { Image as ImageIcon, MapPin } from 'lucide-react';

export default function GalleryGrid({ images }) {
  if (!images.length) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-400">
        Select an event to explore the gallery images.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {images.map((image, index) => (
        <div key={`${image.url}-${index}`} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="aspect-square overflow-hidden bg-zinc-800">
            {image.url ? (
              <img src={image.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-8 w-8 text-zinc-500" />
              </div>
            )}
          </div>
          <div className="space-y-1 p-3">
            <p className="truncate text-sm font-medium text-white">{image.event_name}</p>
            <p className="text-xs text-zinc-400">{new Date(image.shoot_date).toLocaleDateString()}</p>
            <p className="flex items-center gap-1 text-xs text-zinc-400">
              <MapPin className="h-3 w-3" />
              {image.city}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
