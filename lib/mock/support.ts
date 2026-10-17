// Prototype mock data, copied from the Claude Design project's lib/mock-data*.js.
import type { SavedReply, Ticket } from '@/lib/types';

export const TICKETS: Ticket[] = [
  { id: 'T-2291', from: 'Bait Al Qahwa Café', fromKind: 'business', contact: 'Mohammed Al Shamsi', subject: 'Invoice charged twice', category: 'Billing', status: 'open', priority: 'urgent', assignee: null, updated: '2026-10-16T07:30:00+04:00',
    thread: [{ who: 'Mohammed Al Shamsi', side: 'them', at: '2026-10-16T07:30:00+04:00', text: 'Our card was charged AED 499 twice for October. Please refund one of the charges.' }] },
  { id: 'T-2290', from: 'Layla Hassan', fromKind: 'client', contact: 'layla.h@gmail.com', subject: 'Booking not showing', category: 'Client help', status: 'open', priority: 'normal', assignee: 'Rami Haddad', updated: '2026-10-16T09:12:00+04:00',
    thread: [{ who: 'Layla Hassan', side: 'them', at: '2026-10-16T09:12:00+04:00', text: 'I booked a table at Al Fanar for Friday but it is not in my bookings.' }] },
  { id: 'T-2288', from: 'Saadiyat Padel Club', fromKind: 'business', contact: 'Khalid Al Nuaimi', subject: 'Licence upload keeps failing', category: 'Verification', status: 'waiting', priority: 'high', assignee: 'John Doe', updated: '2026-10-15T18:40:00+04:00',
    thread: [
      { who: 'Khalid Al Nuaimi', side: 'them', at: '2026-10-15T14:02:00+04:00', text: 'The portal shows an error every time I upload our licence PDF.' },
      { who: 'John Doe', side: 'note', at: '2026-10-15T14:30:00+04:00', text: 'File is 14 MB. Limit is 10 MB.' },
      { who: 'John Doe', side: 'us', at: '2026-10-15T14:35:00+04:00', text: 'The file is over our 10 MB limit. Could you compress it or send a scan under 10 MB?' },
      { who: 'Khalid Al Nuaimi', side: 'them', at: '2026-10-15T18:40:00+04:00', text: 'Will try tomorrow morning.' },
    ] },
  { id: 'T-2286', from: 'Tawa Indian Bistro', fromKind: 'business', contact: 'Arjun Mehta', subject: 'Menu photos not updating', category: 'Listing', status: 'open', priority: 'normal', assignee: null, updated: '2026-10-15T13:05:00+04:00',
    thread: [{ who: 'Arjun Mehta', side: 'them', at: '2026-10-15T13:05:00+04:00', text: 'We replaced 6 menu photos yesterday but the app still shows the old ones.' }] },
  { id: 'T-2284', from: 'Omar Al Suwaidi', fromKind: 'client', contact: 'omar.suwaidi@gmail.com', subject: 'My review disappeared', category: 'Client help', status: 'open', priority: 'low', assignee: 'Noura Khalifa', updated: '2026-10-15T11:00:00+04:00',
    thread: [{ who: 'Omar Al Suwaidi', side: 'them', at: '2026-10-15T11:00:00+04:00', text: 'My review of Al Fanar is not showing any more. It was a real visit.' }] },
  { id: 'T-2281', from: 'Wild Wadi Kayak Co.', fromKind: 'business', contact: 'Priya Nair', subject: 'App crashes on bookings page', category: 'Technical', status: 'open', priority: 'high', assignee: null, updated: '2026-10-14T16:45:00+04:00',
    thread: [{ who: 'Priya Nair', side: 'them', at: '2026-10-14T16:45:00+04:00', text: 'Business Portal freezes when I open bookings for next week on Safari.' }] },
  { id: 'T-2279', from: 'Corniche Comedy Club', fromKind: 'business', contact: 'Lina Saab', subject: 'Change plan to Growth', category: 'Billing', status: 'resolved', priority: 'normal', assignee: 'Sara Al Mansoori', updated: '2026-10-13T10:00:00+04:00',
    thread: [{ who: 'Lina Saab', side: 'them', at: '2026-10-12T15:00:00+04:00', text: 'How do we move to Growth?' }, { who: 'Sara Al Mansoori', side: 'us', at: '2026-10-13T10:00:00+04:00', text: 'Done. Growth starts on your next invoice, 1 November.' }] },
  { id: 'T-2275', from: 'Aisha Rahman', fromKind: 'client', contact: 'aisha.r@outlook.com', subject: 'Delete my account', category: 'Client help', status: 'resolved', priority: 'normal', assignee: 'Rami Haddad', updated: '2026-10-12T09:30:00+04:00',
    thread: [{ who: 'Aisha Rahman', side: 'them', at: '2026-10-11T20:00:00+04:00', text: 'Please delete my account and data.' }, { who: 'Rami Haddad', side: 'us', at: '2026-10-12T09:30:00+04:00', text: 'Answered by email: open Settings › Delete account in the app and confirm with the code we send you. Your data is deleted with the account.' }] },
];

export const SAVED_REPLIES: SavedReply[] = [
  { id: 's1', title: 'Licence needs a clearer copy', body: 'Thanks for sending your trade licence. The copy we received is hard to read. Please upload a clear PDF scan from the Business Portal under Settings › Documents and we will review it the same day.' },
  { id: 's2', title: 'Refund is on its way', body: 'We have issued the refund to the card on file. Banks usually take 5 to 10 working days to show it.' },
  { id: 's3', title: 'How to add a branch', body: 'You can add a branch from Business Portal › Branches › Add branch. Each branch needs its own location and licence copy, then it goes to verification.' },
];
