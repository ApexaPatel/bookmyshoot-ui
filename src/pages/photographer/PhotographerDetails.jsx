import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Images, MapPin, Star, User } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EventSidebar from '@/components/organization/EventSidebar';
import GalleryGrid from '@/components/organization/GalleryGrid';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function PhotographerDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [photographer, setPhotographer] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewEligibility, setReviewEligibility] = useState({ can_review: false, reason: 'NOT_LOGGED_IN', booking_context: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const locations = useMemo(() => {
    const seen = new Set();
    return portfolios
      .filter((portfolio) => !selectedEvent || portfolio.event_name === selectedEvent)
      .map((portfolio) => portfolio.city?.trim())
      .filter((city) => {
        if (!city) return false;
        const key = city.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [portfolios, selectedEvent]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/photographers/${id}`).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load photographer');
        return data.photographer;
      }),
      fetch(`/api/photographers/${id}/portfolios`).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load portfolios');
        return data.portfolios || [];
      }),
      fetch(`/api/photographers/${id}/events`).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load events');
        return data.events || [];
      }),
      fetch(`/api/photographers/${id}/reviews`).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load reviews');
        return data.reviews || [];
      }),
    ])
      .then(([photographerData, portfolioData, eventData, reviewsData]) => {
        setPhotographer(photographerData);
        setPortfolios(portfolioData);
        setEvents(eventData);
        setReviews(reviewsData);
        if (eventData[0]) setSelectedEvent(eventData[0]);
      })
      .catch((err) => setError(err.message || 'Failed to load photographer'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`/api/photographers/${id}/review-eligibility`, { headers })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load eligibility');
        setReviewEligibility(data);
      })
      .catch(() => {
        setReviewEligibility({ can_review: false, reason: user ? 'NO_BOOKING' : 'NOT_LOGGED_IN', booking_context: null });
      });
  }, [id, token, user]);

  useEffect(() => {
    if (!selectedEvent) {
      setGalleryImages([]);
      return;
    }
    const params = new URLSearchParams({ event: selectedEvent });
    if (selectedLocations.length) {
      params.set('location', selectedLocations.join(','));
    }
    fetch(`/api/photographers/${id}/gallery?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load gallery');
        return data.images || [];
      })
      .then((images) => setGalleryImages(images))
      .catch((err) => setError(err.message || 'Failed to load gallery'));
  }, [id, selectedEvent, selectedLocations]);

  const handleEventSelect = (eventName) => {
    setSelectedEvent(eventName);
    setSelectedLocations([]);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) return;
    setReviewSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/photographers/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || 'Failed to submit review');

      const listRes = await fetch(`/api/photographers/${id}/reviews`);
      const listData = await listRes.json().catch(() => ({}));
      if (listRes.ok) setReviews(listData.reviews || []);
      setReviewForm((prev) => ({ ...prev, comment: '' }));
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:px-10">
        {loading ? <div className="py-10 text-center text-zinc-400">Loading photographer...</div> : null}
        {error ? <div className="rounded-lg bg-red-500/10 p-4 text-red-400">{error}</div> : null}
        {!loading && !error && photographer ? (
          <>
            <section className="mb-10 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
              <div className="aspect-[16/5] w-full overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-800">
                {photographer.cover_image ? (
                  <img src={photographer.cover_image} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : null}
              </div>
              <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                <div className="h-20 w-20 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
                  {photographer.profile_picture ? (
                    <img src={photographer.profile_picture} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <User className="h-8 w-8 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{photographer.name}</h1>
                    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
                      {portfolios.length} photoshoot{portfolios.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="mt-2 text-zinc-400">{photographer.organization?.name}</p>
                  {photographer.organization?.location ? (
                    <p className="mt-1 text-sm text-zinc-500">{photographer.organization.location}</p>
                  ) : null}
                  {photographer.bio ? (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">{photographer.bio}</p>
                  ) : null}
                  <div className="mt-4">
                    {user?.role === 'customer' ? (
                      <Button asChild>
                        <Link to={`/quote?photographer_id=${id}&photographer_name=${encodeURIComponent(photographer.name || 'Photographer')}`}>
                          Request Quote / Book Photographer
                        </Link>
                      </Button>
                    ) : !user ? (
                      <Button asChild>
                        <Link to={`/login`}>Login to Request Quote</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-8">
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                    <MapPin className="h-6 w-6 text-zinc-400" />
                    <span>Locations</span>
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {locations.map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() =>
                          setSelectedLocations((current) =>
                            current.includes(location)
                              ? current.filter((item) => item !== location)
                              : [...current, location]
                          )
                        }
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selectedLocations.includes(location)
                            ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200 shadow-[0_0_0_1px_rgba(99,102,241,0.35)]'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {selectedLocations.includes(location) ? <Check className="h-4 w-4" /> : null}
                          <span>{location}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                    <Images className="h-6 w-6 text-zinc-400" />
                    <span>Gallery</span>
                  </h2>
                  <div className="mt-6">
                    <GalleryGrid images={galleryImages} />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
                  <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                    <Star className="h-6 w-6 text-zinc-400" />
                    <span>Ratings & Reviews</span>
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {photographer.rating?.toFixed?.(1) || Number(photographer.rating || 0).toFixed(1)} average • {photographer.total_reviews || 0} reviews
                  </p>

                  <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
                    {!user ? (
                      <div className="space-y-3">
                        <p className="text-sm text-zinc-300">Login to rate this photographer.</p>
                        <Button asChild size="sm">
                          <Link to="/login">Login</Link>
                        </Button>
                      </div>
                    ) : !reviewEligibility.can_review ? (
                      <p className="text-sm text-zinc-300">
                        {reviewEligibility.reason === 'NO_BOOKING'
                          ? 'You can rate only after completing a booking with this photographer.'
                          : reviewEligibility.reason === 'NOT_COMPLETED'
                            ? 'You can rate after your photoshoot is completed.'
                            : 'You can rate only after completing a booking with this photographer.'}
                      </p>
                    ) : (
                      <form className="space-y-3" onSubmit={submitReview}>
                        <p className="text-xs text-zinc-500">
                          You booked this photographer on{' '}
                          {reviewEligibility.booking_context?.completed_at
                            ? new Date(reviewEligibility.booking_context.completed_at).toLocaleDateString()
                            : 'a completed booking'}
                        </p>
                        <div>
                          <label className="mb-1 block text-sm text-zinc-300">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
                                className={`rounded-md border px-3 py-1 text-sm ${
                                  reviewForm.rating === value
                                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                                    : 'border-zinc-700 text-zinc-300'
                                }`}
                              >
                                {value}★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm text-zinc-300">Comment (optional)</label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                            className="w-full min-h-[90px] rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                            placeholder="Share your experience..."
                          />
                        </div>
                        <Button type="submit" disabled={reviewSubmitting}>
                          {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </form>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    {reviews.length === 0 ? (
                      <p className="text-sm text-zinc-500">No reviews yet.</p>
                    ) : (
                      reviews.map((review) => (
                        <div key={review.id} className="rounded-lg border border-zinc-800 bg-zinc-950/30 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">{review.reviewer_name || 'User'}</p>
                            <p className="text-sm text-amber-300">{review.rating}★</p>
                          </div>
                          {review.comment ? <p className="mt-1 text-sm text-zinc-300">{review.comment}</p> : null}
                          <p className="mt-2 text-xs text-zinc-500">
                            {review.updated_at ? new Date(review.updated_at).toLocaleString() : review.created_at ? new Date(review.created_at).toLocaleString() : ''}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div>
                <EventSidebar events={events} selectedEvent={selectedEvent} onSelect={handleEventSelect} />
              </div>
            </section>
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
