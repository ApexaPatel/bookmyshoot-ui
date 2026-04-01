import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { uploadPortfolioImage } from '@/lib/uploadProfileImage';

export default function ImageUploader({ gallery, setGallery, thumbnailUrl, setThumbnailUrl }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    if (gallery.length + files.length > 10) {
      setError('You can upload up to 10 gallery images.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadPortfolioImage(file);
        uploadedUrls.push(url);
      }

      setGallery((prev) => {
        const next = [...prev, ...uploadedUrls.map((url) => ({ url, is_thumbnail: false }))];
        if (!thumbnailUrl && next[0]) {
          next[0].is_thumbnail = true;
          setThumbnailUrl(next[0].url);
        }
        return next;
      });
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload one or more images.');
    } finally {
      setUploading(false);
    }
  };

  const syncThumbnail = (nextGallery) => {
    const effectiveThumbnail = nextGallery.find((item) => item.is_thumbnail)?.url || nextGallery[0]?.url || '';
    const normalized = nextGallery.map((item, index) => ({
      ...item,
      is_thumbnail: effectiveThumbnail ? item.url === effectiveThumbnail : index === 0,
    }));
    setThumbnailUrl(effectiveThumbnail);
    return normalized;
  };

  const makeThumbnail = (url) => {
    setGallery((prev) => syncThumbnail(prev.map((item) => ({ ...item, is_thumbnail: item.url === url }))));
  };

  const removeImage = (url) => {
    setGallery((prev) => syncThumbnail(prev.filter((item) => item.url !== url)));
  };

  const moveImage = (index, direction) => {
    setGallery((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return syncThumbnail(next);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">Gallery Images</p>
          <p className="text-xs text-zinc-500">Upload 3 to 10 images. Pick any image as the thumbnail.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-zinc-600 text-zinc-300"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || gallery.length >= 10}
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
          {uploading ? 'Uploading...' : 'Add Images'}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {gallery.map((image, index) => (
          <div key={image.url} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <div className="relative aspect-square">
              <img src={image.url} alt="" className="h-full w-full object-cover" />
              {image.url === thumbnailUrl ? (
                <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-1 text-xs font-medium text-zinc-950">
                  Thumbnail
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              <Button type="button" variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={() => makeThumbnail(image.url)}>
                <Star className="mr-1 h-3 w-3" />
                Thumb
              </Button>
              <Button type="button" variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={() => removeImage(image.url)}>
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
              <Button type="button" variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={() => moveImage(index, -1)} disabled={index === 0}>
                <ArrowLeft className="mr-1 h-3 w-3" />
                Left
              </Button>
              <Button type="button" variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={() => moveImage(index, 1)} disabled={index === gallery.length - 1}>
                <ArrowRight className="mr-1 h-3 w-3" />
                Right
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
