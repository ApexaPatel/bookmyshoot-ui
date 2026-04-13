/** Normalize API event_type e.g. pre_wedding → "pre wedding" */
export function normalizeEventType(et) {
  if (!et) return '';
  return String(et).replace(/_/g, ' ').trim().toLowerCase();
}

/**
 * Match photographers by optional text q and optional event_type (from quotation enums).
 * Search covers: name, bio, profile location, org name/location, portfolio shoot cities/destinations,
 * portfolio event names (for type + keyword search).
 */
export function photographerMatches(p, q, eventType) {
  const qn = (q || '').trim().toLowerCase();
  const et = normalizeEventType(eventType);
  const bio = (p.bio || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const personalLoc = (p.location || '').toLowerCase();
  const orgName = (p.organizationId?.name || '').toLowerCase();
  const orgLoc = (p.organizationId?.location || '').toLowerCase();
  const eventsStr = (p.portfolio_events || []).join(' ');
  const citiesStr = (p.portfolio_cities || []).join(' ');
  const blob = [name, bio, personalLoc, orgName, orgLoc, citiesStr, eventsStr].join(' ');

  if (et) {
    const etWords = et.split(/\s+/).filter(Boolean);
    const matchesEt = etWords.every(
      (w) => eventsStr.includes(w) || blob.includes(w) || et === eventsStr.trim()
    );
    if (!matchesEt) return false;
  }

  if (qn) {
    const tokens = qn.split(/\s+/).filter(Boolean);
    const matchesToken = (tok) =>
      blob.includes(tok) ||
      (p.portfolio_events || []).some((e) => e.includes(tok)) ||
      (p.portfolio_cities || []).some((c) => c.includes(tok));
    if (!tokens.every(matchesToken)) return false;
  }

  return true;
}
