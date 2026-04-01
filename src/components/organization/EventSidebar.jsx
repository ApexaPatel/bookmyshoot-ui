export default function EventSidebar({ events, selectedEvent, onSelect }) {
  return (
    <aside className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      <h3 className="text-lg font-semibold text-white">Events</h3>
      <p className="mt-1 text-sm text-zinc-400">Select an event to view all gallery images for that event.</p>
      <div className="mt-4 flex flex-col gap-2">
        {events.map((event) => (
          <button
            key={event}
            type="button"
            onClick={() => onSelect(event)}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
              selectedEvent === event
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            {event}
          </button>
        ))}
      </div>
    </aside>
  );
}
