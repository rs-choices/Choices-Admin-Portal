// Prototype mock data, copied from the Claude Design project's lib/mock-data*.js.
import type { ReportedClient, Offer, ReportedListing, ReportedReview } from '@/lib/types';

export const REPORTED_REVIEWS: ReportedReview[] = [
  { id: 'r1', business: 'Al Fanar Restaurant', author: 'Omar Al Suwaidi', authorWarnings: 0, rating: 2, posted: '2026-10-11', reportedAt: '2026-10-15T03:20:00+04:00', reason: 'False claim', note: 'This guest never had a booking with us on that date.', text: 'Waited 40 minutes for a table we had booked. Staff were rude and the food came cold.',
    history: [{ at: '2026-10-11T21:40:00+04:00', who: 'Omar Al Suwaidi', what: 'Posted review' }, { at: '2026-10-15T03:20:00+04:00', who: 'Al Fanar Restaurant', what: 'Reported: False claim' }] },
  { id: 'r2', business: 'Desert Rush Safaris', author: 'Ben Walker', authorWarnings: 1, rating: 1, posted: '2026-10-13', reportedAt: '2026-10-15T09:00:00+04:00', reason: 'Abusive language', note: 'Contains insults towards our driver.', text: 'Driver was an absolute idiot, drove like a maniac. Never again with these clowns.',
    history: [{ at: '2026-10-13T22:10:00+04:00', who: 'Ben Walker', what: 'Posted review' }, { at: '2026-10-15T09:00:00+04:00', who: 'Desert Rush Safaris', what: 'Reported: Abusive language' }] },
  { id: 'r3', business: 'Zaatar w Zeit Kitchen', author: 'Hind Al Qassimi', authorWarnings: 0, rating: 3, posted: '2026-10-12', reportedAt: '2026-10-15T08:10:00+04:00', reason: 'Off-topic', note: 'Review is about parking, not our restaurant.', text: 'Food was fine but parking around Al Qasba is impossible on weekends.',
    history: [{ at: '2026-10-12T20:00:00+04:00', who: 'Hind Al Qassimi', what: 'Posted review' }, { at: '2026-10-15T08:10:00+04:00', who: 'Zaatar w Zeit Kitchen', what: 'Reported: Off-topic' }] },
  { id: 'r4', business: 'Corniche Comedy Club', author: 'Anonymous client', authorWarnings: 2, rating: 1, posted: '2026-10-15', reportedAt: '2026-10-16T07:45:00+04:00', reason: 'Spam or advertising', note: 'Links to a competitor.', text: 'Better shows at laughsabudhabi dot com, use code LOL20.',
    history: [{ at: '2026-10-15T23:58:00+04:00', who: 'Anonymous client', what: 'Posted review' }, { at: '2026-10-16T07:45:00+04:00', who: 'Corniche Comedy Club', what: 'Reported: Spam or advertising' }] },
];

export const REPORTED_LISTINGS: ReportedListing[] = [
  { id: 'l1', kind: 'Photo', business: 'Shawarma Al Reem', reporter: 'Client · Aisha Rahman', reportedAt: '2026-10-15T12:30:00+04:00', reason: 'Photo is from another business', text: 'Cover photo shows a restaurant interior in Beirut, watermark visible.',
    history: [{ at: '2026-10-15T12:30:00+04:00', who: 'Aisha Rahman', what: 'Reported photo' }] },
  { id: 'l2', kind: 'Listing', business: 'Mleiha Stargazing Camp', reporter: 'Client · Tom Baker', reportedAt: '2026-10-14T18:00:00+04:00', reason: 'Business appears closed', text: 'Listing says open nightly. Phone unreachable for 2 weeks.',
    history: [{ at: '2026-10-14T18:00:00+04:00', who: 'Tom Baker', what: 'Reported listing' }] },
  { id: 'l3', kind: 'Photo', business: 'Tawa Indian Bistro', reporter: 'Client · Sam Lee', reportedAt: '2026-10-16T08:05:00+04:00', reason: 'Inappropriate content', text: 'Gallery photo 6 shows a guest without consent.',
    history: [{ at: '2026-10-16T08:05:00+04:00', who: 'Sam Lee', what: 'Reported photo' }] },
];

export const OFFERS: Offer[] = [
  { id: 'f1', business: 'Zaatar w Zeit Kitchen', title: '2-for-1 manakeesh before 11 am', validity: '20 Oct – 30 Nov 2026', price: 'AED 18', submitted: '2026-10-15T10:00:00+04:00', terms: 'Dine-in only. Weekdays.' },
  { id: 'f2', business: 'Desert Rush Safaris', title: '70% off evening safari', validity: '18 Oct – 18 Nov 2026', price: 'AED 89 (was AED 299)', submitted: '2026-10-15T16:20:00+04:00', terms: 'Subject to availability.' },
  { id: 'f3', business: 'Corniche Comedy Club', title: 'Free mocktail with Thursday tickets', validity: '23 Oct – 25 Dec 2026', price: 'AED 120', submitted: '2026-10-16T09:10:00+04:00', terms: 'One per ticket.' },
];

// Clients reported by businesses. Not in the Claude Design prototype: added
// when Ralph asked for businesses to be able to report clients (2026-10-16).
export const REPORTED_CLIENTS: ReportedClient[] = [
  { id: 'rc1', cid: 'c2', client: 'Omar Al Suwaidi', business: 'Al Fanar Restaurant', reportedAt: '2026-10-15T22:10:00+04:00', reason: 'No-show', booking: 'Table for 6 · 15 Oct, 20:30', priorWarnings: 0,
    text: 'Booked a table for 6 on a busy night and never came. Third no-show with us this month.',
    history: [{ at: '2026-10-15T22:10:00+04:00', who: 'Al Fanar Restaurant', what: 'Reported client: No-show' }] },
  { id: 'rc2', cid: 'c3', client: 'Ben Walker', business: 'Desert Rush Safaris', reportedAt: '2026-10-14T19:40:00+04:00', reason: 'Abusive behaviour', booking: 'Evening safari for 2 · 12 Oct, 16:00', priorWarnings: 1,
    text: 'Shouted at our driver during the tour and threatened to leave a fake review if we did not refund him.',
    history: [{ at: '2026-10-14T19:40:00+04:00', who: 'Desert Rush Safaris', what: 'Reported client: Abusive behaviour' }] },
  { id: 'rc3', cid: 'c6', client: 'Rashed Al Mazrouei', business: 'Tawa Indian Bistro', reportedAt: '2026-10-16T08:30:00+04:00', reason: 'Fake or spam bookings', priorWarnings: 0,
    text: 'Five bookings for tonight under slightly different names, all from this account.',
    history: [{ at: '2026-10-16T08:30:00+04:00', who: 'Tawa Indian Bistro', what: 'Reported client: Fake or spam bookings' }] },
];
