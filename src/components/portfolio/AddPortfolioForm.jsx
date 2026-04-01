import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/portfolio/ImageUploader';

function TagInput({ label, placeholder, values, onChange }) {
  const [input, setInput] = useState('');

  const addValue = () => {
    const normalized = input.trim();
    if (!normalized) return;
    if (!values.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      onChange([...values, normalized]);
    }
    setInput('');
  };

  const removeValue = (value) => onChange(values.filter((item) => item !== value));

  return (
    <div className="space-y-2">
      <Label className="text-zinc-300">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          placeholder={placeholder}
          className="bg-zinc-800 border-zinc-700 text-white"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              addValue();
            }
          }}
        />
        <Button type="button" variant="outline" className="border-zinc-600 text-zinc-300" onClick={addValue}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200">
            {value}
            <button type="button" onClick={() => removeValue(value)} className="text-zinc-400 hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AddPortfolioForm({ initialData, mode = 'create' }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    event_name: '',
    shoot_date: '',
    city: '',
    destinations: [],
    days: 1,
    props: [],
    gallery: [],
    thumbnail_url: '',
  });

  useEffect(() => {
    fetch('/api/events/suggestions')
      .then((res) => res.json())
      .then((data) => setSuggestions(data.suggestions || []))
      .catch(() => setSuggestions([]));
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setForm({
      event_name: initialData.event_name || '',
      shoot_date: initialData.shoot_date ? String(initialData.shoot_date).slice(0, 10) : '',
      city: initialData.city || '',
      destinations: initialData.destinations || [],
      days: initialData.days || 1,
      props: initialData.props || [],
      gallery: initialData.gallery || [],
      thumbnail_url: initialData.thumbnail_url || initialData.gallery?.find((image) => image.is_thumbnail)?.url || '',
    });
  }, [initialData]);

  const title = useMemo(() => (mode === 'edit' ? 'Edit Photoshoot' : 'Add New Photoshoot'), [mode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.event_name.trim() || !form.shoot_date || !form.city.trim()) {
      setError('Event name, shoot date, and city are required.');
      return;
    }
    if (form.gallery.length < 3) {
      setError('Add at least 3 gallery images.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        event_name: form.event_name.trim(),
        city: form.city.trim(),
        days: Number(form.days) || 1,
        thumbnail_url: form.thumbnail_url || form.gallery[0]?.url || '',
        gallery: form.gallery.map((image) => ({
          url: image.url,
          is_thumbnail: image.url === (form.thumbnail_url || form.gallery[0]?.url || ''),
        })),
      };

      const endpoint = mode === 'edit' ? `/api/portfolio/${initialData.id}` : '/api/portfolio';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      const token = stored?.state?.token;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = data.detail;
        throw new Error(typeof detail === 'string' ? detail : 'Failed to save portfolio');
      }

      navigate('/portfolio');
    } catch (submitError) {
      setError(submitError.message || 'Failed to save portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (mode !== 'edit' || !initialData?.id || !window.confirm('Delete this photoshoot?')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      const token = stored?.state?.token;
      const response = await fetch(`/api/portfolio/${initialData.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to delete portfolio');
      }
      navigate('/portfolio');
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80">
      <CardHeader>
        <CardTitle className="text-2xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error ? <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event_name" className="text-zinc-300">Event Name</Label>
              <Input
                id="event_name"
                list="portfolio-event-suggestions"
                value={form.event_name}
                onChange={(event) => setForm((prev) => ({ ...prev, event_name: event.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
              <datalist id="portfolio-event-suggestions">
                {suggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shoot_date" className="text-zinc-300">Shoot Date</Label>
              <Input
                id="shoot_date"
                type="date"
                value={form.shoot_date}
                onChange={(event) => setForm((prev) => ({ ...prev, shoot_date: event.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-zinc-300">City / Location</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days" className="text-zinc-300">Number of Days</Label>
              <Input
                id="days"
                type="number"
                min="1"
                value={form.days}
                onChange={(event) => setForm((prev) => ({ ...prev, days: event.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
          </div>

          <TagInput
            label="Destinations"
            placeholder="Add destination and press Enter"
            values={form.destinations}
            onChange={(destinations) => setForm((prev) => ({ ...prev, destinations }))}
          />

          <TagInput
            label="Props Used"
            placeholder="Add prop and press Enter"
            values={form.props}
            onChange={(props) => setForm((prev) => ({ ...prev, props }))}
          />

          <ImageUploader
            gallery={form.gallery}
            setGallery={(updater) =>
              setForm((prev) => ({
                ...prev,
                gallery: typeof updater === 'function' ? updater(prev.gallery) : updater,
              }))
            }
            thumbnailUrl={form.thumbnail_url}
            setThumbnailUrl={(thumbnail_url) => setForm((prev) => ({ ...prev, thumbnail_url }))}
          />

          <div className="flex justify-end gap-3">
            {mode === 'edit' ? (
              <Button type="button" variant="outline" className="border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300" onClick={handleDelete} disabled={loading}>
                Delete
              </Button>
            ) : null}
            <Button type="button" variant="outline" className="border-zinc-600 text-zinc-300" onClick={() => navigate('/portfolio')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Photoshoot' : 'Create Photoshoot'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
