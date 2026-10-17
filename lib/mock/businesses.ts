// Prototype mock data, copied from the Claude Design project's lib/mock-data*.js.
import type { Business, BusinessDetail, Member } from '@/lib/types';

export const BUSINESSES: Business[] = [
  { id: 'b1', name: 'Al Fanar Restaurant', types: ['F&B'], emirate: 'Dubai', status: 'active', plan: 'Enterprise', joined: '2024-03-02', owner: 'Rashid Bin Saeed', email: 'ops@alfanar.ae', phone: '+971 4 344 2141', licence: 'DED-0884213', trn: '100223417800003', branches: 3, outlets: 3, rating: 4.6, reviews: 1204, mrr: 1499, bookings30: 2140 },
  { id: 'b2', name: 'Zaatar w Zeit Kitchen', types: ['F&B'], emirate: 'Sharjah', status: 'active', plan: 'Growth', joined: '2024-11-21', owner: 'Nadia Khoury', email: 'nadia@zwzkitchen.ae', phone: '+971 6 556 1290', licence: 'SEDD-553190', trn: '100339812100003', branches: 2, outlets: 2, rating: 4.3, reviews: 388, mrr: 499, bookings30: 610 },
  { id: 'b3', name: 'Bait Al Qahwa Café', types: ['F&B'], emirate: 'Abu Dhabi', status: 'active', plan: 'Growth', joined: '2025-02-14', owner: 'Mohammed Al Shamsi', email: 'mohammed@baitalqahwa.ae', phone: '+971 2 667 0912', licence: 'CN-3920114', trn: '100198223000003', branches: 1, outlets: 2, rating: 4.7, reviews: 512, mrr: 499, bookings30: 430, paymentFailed: true },
  { id: 'b4', name: 'Desert Rush Safaris', types: ['Activity'], emirate: 'Dubai', status: 'active', plan: 'Growth', joined: '2025-01-19', owner: 'Hamad Al Ketbi', email: 'hamad@desertrush.ae', phone: '+971 55 001 7720', licence: 'DED-0991847', trn: '100445210900003', branches: 1, outlets: 3, rating: 4.8, reviews: 942, mrr: 499, bookings30: 1180 },
  { id: 'b5', name: 'Saadiyat Padel Club', types: ['Activity'], emirate: 'Abu Dhabi', status: 'pending', plan: '—', joined: '2026-10-09', owner: 'Khalid Al Nuaimi', email: 'khalid@saadiyatpadel.ae', phone: '+971 50 330 7781', licence: 'CN-4417820', trn: '100512983400003', branches: 1, outlets: 2, rating: 0, reviews: 0, mrr: 0, bookings30: 0 },
  { id: 'b6', name: 'Marina Jazz Nights', types: ['Event'], emirate: 'Dubai', status: 'trial', plan: 'Growth', joined: '2026-10-12', trialEnds: '2026-11-11', owner: 'Daniel Mercer', email: 'daniel@marinajazz.ae', phone: '+971 58 400 3321', licence: 'DMCC-339120', trn: '100458812700003', branches: 1, outlets: 1, rating: 4.5, reviews: 12, mrr: 0, bookings30: 86 },
  { id: 'b7', name: 'Shawarma Al Reem', types: ['F&B'], emirate: 'Abu Dhabi', status: 'trial', plan: 'Starter', joined: '2026-09-30', trialEnds: '2026-10-30', owner: 'Abdulla Al Hosani', email: 'abdulla@shawarmaalreem.ae', phone: '+971 50 214 6650', licence: 'CN-4398812', trn: '100620019800003', branches: 1, outlets: 1, rating: 4.1, reviews: 46, mrr: 0, bookings30: 112 },
  { id: 'b8', name: 'Mleiha Stargazing Camp', types: ['Activity'], emirate: 'Sharjah', status: 'suspended', plan: 'Starter', joined: '2025-08-03', owner: 'Salem Al Zaabi', email: 'salem@mleihastars.ae', phone: '+971 56 330 2219', licence: 'SEDD-610045', trn: '100519900700003', branches: 1, outlets: 1, rating: 3.2, reviews: 77, mrr: 199, bookings30: 0, suspendReason: 'Repeated reports of cancelled bookings without refund' },
  { id: 'b9', name: 'Wild Wadi Kayak Co.', types: ['Activity'], emirate: 'Dubai', status: 'active', plan: 'Starter', joined: '2025-05-22', owner: 'Priya Nair', email: 'priya@wildwadikayak.ae', phone: '+971 52 771 0034', licence: 'DED-1022189', trn: '100388120400003', branches: 1, outlets: 1, rating: 4.4, reviews: 158, mrr: 199, bookings30: 240, paymentFailed: true },
  { id: 'b10', name: 'Tawa Indian Bistro', types: ['F&B'], emirate: 'Dubai', status: 'trial', plan: 'Growth', joined: '2026-10-02', trialEnds: '2026-11-01', owner: 'Arjun Mehta', email: 'arjun@tawabistro.ae', phone: '+971 55 980 1123', licence: 'DED-1201554', trn: '100712283300003', branches: 2, outlets: 2, rating: 4.2, reviews: 31, mrr: 0, bookings30: 154 },
  { id: 'b11', name: 'Corniche Comedy Club', types: ['Event'], emirate: 'Abu Dhabi', status: 'active', plan: 'Starter', joined: '2025-11-11', owner: 'Lina Saab', email: 'lina@cornichecomedy.ae', phone: '+971 50 122 8890', licence: 'CN-4120773', trn: '100601290100003', branches: 1, outlets: 1, rating: 4.6, reviews: 203, mrr: 199, bookings30: 320 },
  { id: 'b12', name: 'Qasr Al Bahr Seafood', types: ['F&B'], emirate: 'Sharjah', status: 'pending', plan: '—', joined: '2026-10-14', owner: 'Mariam Obaid', email: 'mariam@qasralbahr.ae', phone: '+971 52 118 4402', licence: 'SEDD-772019', trn: '100277410900003', branches: 1, outlets: 1, rating: 0, reviews: 0, mrr: 0, bookings30: 0 },
];

export const BUSINESS_DETAIL: BusinessDetail = {
  branches: [
    { name: 'Al Seef', area: 'Al Seef, Dubai Creek', status: 'Verified', outlets: [
      { id: 'o1', name: 'Al Fanar · Al Seef', type: 'F&B', priceBand: '$$', listing: 'Published', listings: [
        { id: 'a1', kind: 'Activity', title: 'Emirati cooking class', when: '2 hours', listing: 'Published' },
      ] },
    ] },
    { name: 'Festival City', area: 'Dubai Festival City Mall', status: 'Verified', outlets: [
      { id: 'o2', name: 'Al Fanar · Festival City', type: 'F&B', priceBand: '$$', listing: 'Published', listings: [
        { id: 'e1', kind: 'Event', title: 'Majlis nights with live oud', when: 'Every Thursday · 8 PM', listing: 'Published' },
        { id: 'e2', kind: 'Event', title: 'National Day dinner', when: '2 Dec 2026 · 7 PM', listing: 'Draft' },
      ] },
    ] },
    { name: 'Jumeirah', area: 'Jumeirah Beach Road', status: 'Waiting for verification', outlets: [
      { id: 'o4', name: 'Al Fanar · Jumeirah', type: 'F&B', priceBand: '$$$', listing: 'Draft', listings: [] },
    ] },
  ],
  team: [
    { name: 'Rashid Bin Saeed', email: 'ops@alfanar.ae', role: 'Owner', last: '2 h ago' },
    { name: 'Fatima Al Ali', email: 'fatima@alfanar.ae', role: 'Manager', last: 'Yesterday' },
    { name: 'Joseph Dsouza', email: 'joseph@alfanar.ae', role: 'Staff', last: '3 days ago' },
  ],
  invoices: [
    { id: 'INV-24-10031', date: '2026-10-01', amount: 1499, status: 'Paid' },
    { id: 'INV-24-09012', date: '2026-09-01', amount: 1499, status: 'Paid' },
    { id: 'INV-24-08007', date: '2026-08-01', amount: 1499, status: 'Paid' },
    { id: 'INV-24-07002', date: '2026-07-01', amount: 1499, status: 'Refunded' },
  ],
  reviews: [
    { author: 'Layla Hassan', rating: 5, date: '2026-10-14', text: 'Lamb ouzi was perfect and the creek view at sunset made it.', status: 'Visible' },
    { author: 'Omar Al Suwaidi', rating: 2, date: '2026-10-11', text: 'Waited 40 minutes for a table we had booked.', status: 'Reported' },
    { author: 'Emily Clarke', rating: 4, date: '2026-10-08', text: 'Great harees and luqaimat. Busy on Fridays.', status: 'Visible' },
  ],
  tickets: [
    { id: 'T-2280', subject: 'Add a fourth branch', status: 'Resolved', date: '2026-10-03' },
    { id: 'T-2261', subject: 'Offer not showing in app', status: 'Resolved', date: '2026-09-18' },
  ],
  activity: [
    { at: '2026-10-14T13:10:00+04:00', who: 'Rashid Bin Saeed', what: 'Submitted new branch Al Seef' },
    { at: '2026-10-01T00:05:00+04:00', who: 'System', what: 'Invoice INV-24-10031 paid · AED 1,499' },
    { at: '2026-07-04T11:20:00+04:00', who: 'Ahmad Karimi', what: 'Refunded INV-24-07002 · AED 1,499' },
    { at: '2024-03-04T09:00:00+04:00', who: 'Sara Al Mansoori', what: 'Approved verification' },
  ],
};

export const MEMBERS: Member[] = [
  { name: 'Rashid Bin Saeed', email: 'ops@alfanar.ae', business: 'Al Fanar Restaurant', bid: 'b1', role: 'Owner', status: 'Active', last: '2 h ago', joined: '2024-03-02' },
  { name: 'Fatima Al Ali', email: 'fatima@alfanar.ae', business: 'Al Fanar Restaurant', bid: 'b1', role: 'Manager', status: 'Active', last: 'Yesterday', joined: '2024-03-10' },
  { name: 'Joseph Dsouza', email: 'joseph@alfanar.ae', business: 'Al Fanar Restaurant', bid: 'b1', role: 'Staff', status: 'Active', last: '3 days ago', joined: '2025-01-14' },
  { name: 'Maya Fernandes', email: 'maya@alfanar.ae', business: 'Al Fanar Restaurant', bid: 'b1', role: 'Staff', status: 'Invited', last: '—', joined: '2026-10-15' },
  { name: 'Nadia Khoury', email: 'nadia@zwzkitchen.ae', business: 'Zaatar w Zeit Kitchen', bid: 'b2', role: 'Owner', status: 'Active', last: '1 h ago', joined: '2024-11-21' },
  { name: 'Karim Haddad', email: 'karim@zwzkitchen.ae', business: 'Zaatar w Zeit Kitchen', bid: 'b2', role: 'Manager', status: 'Active', last: 'Today', joined: '2025-02-02' },
  { name: 'Mohammed Al Shamsi', email: 'mohammed@baitalqahwa.ae', business: 'Bait Al Qahwa Café', bid: 'b3', role: 'Owner', status: 'Active', last: '5 h ago', joined: '2025-02-14' },
  { name: 'Shaikha Al Mheiri', email: 'shaikha@baitalqahwa.ae', business: 'Bait Al Qahwa Café', bid: 'b3', role: 'Manager', status: 'Active', last: '2 days ago', joined: '2025-03-01' },
  { name: 'Hamad Al Ketbi', email: 'hamad@desertrush.ae', business: 'Desert Rush Safaris', bid: 'b4', role: 'Owner', status: 'Active', last: 'Today', joined: '2025-01-19' },
  { name: 'Vikram Rao', email: 'bookings@desertrush.ae', business: 'Desert Rush Safaris', bid: 'b4', role: 'Staff', status: 'Active', last: '20 min ago', joined: '2025-04-08' },
  { name: 'Khalid Al Nuaimi', email: 'khalid@saadiyatpadel.ae', business: 'Saadiyat Padel Club', bid: 'b5', role: 'Owner', status: 'Active', last: 'Yesterday', joined: '2026-10-09' },
  { name: 'Daniel Mercer', email: 'daniel@marinajazz.ae', business: 'Marina Jazz Nights', bid: 'b6', role: 'Owner', status: 'Active', last: '4 h ago', joined: '2026-10-12' },
  { name: 'Sophie Laurent', email: 'sophie@marinajazz.ae', business: 'Marina Jazz Nights', bid: 'b6', role: 'Manager', status: 'Invited', last: '—', joined: '2026-10-14' },
  { name: 'Abdulla Al Hosani', email: 'abdulla@shawarmaalreem.ae', business: 'Shawarma Al Reem', bid: 'b7', role: 'Owner', status: 'Active', last: '2 days ago', joined: '2026-09-30' },
  { name: 'Salem Al Zaabi', email: 'salem@mleihastars.ae', business: 'Mleiha Stargazing Camp', bid: 'b8', role: 'Owner', status: 'Suspended', last: '3 weeks ago', joined: '2025-08-03' },
  { name: 'Priya Nair', email: 'priya@wildwadikayak.ae', business: 'Wild Wadi Kayak Co.', bid: 'b9', role: 'Owner', status: 'Active', last: 'Today', joined: '2025-05-22' },
  { name: 'Arjun Mehta', email: 'arjun@tawabistro.ae', business: 'Tawa Indian Bistro', bid: 'b10', role: 'Owner', status: 'Active', last: '1 h ago', joined: '2026-10-02' },
  { name: 'Ritu Sharma', email: 'ritu@tawabistro.ae', business: 'Tawa Indian Bistro', bid: 'b10', role: 'Staff', status: 'Active', last: 'Yesterday', joined: '2026-10-05' },
  { name: 'Lina Saab', email: 'lina@cornichecomedy.ae', business: 'Corniche Comedy Club', bid: 'b11', role: 'Owner', status: 'Active', last: '6 h ago', joined: '2025-11-11' },
  { name: 'Mariam Obaid', email: 'mariam@qasralbahr.ae', business: 'Qasr Al Bahr Seafood', bid: 'b12', role: 'Owner', status: 'Active', last: 'Today', joined: '2026-10-14' },
];
