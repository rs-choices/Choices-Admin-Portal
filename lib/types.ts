// Shapes of every record the admin screens use. They mirror the prototype's
// mock data (lib/mock/) and are the contract a real API has to meet.

export type Role = 'super' | 'admin' | 'moderator';
export const ROLES: Role[] = ['super', 'admin', 'moderator'];
export const ROLE_LABEL: Record<Role, string> = { super: 'Super admin', admin: 'Admin', moderator: 'Moderator' };

export type Range = '7d' | '30d' | '90d';
export type Tone = 'warning' | 'success' | 'error' | 'info' | 'neutral' | 'brand';

/** Kebab-case Lucide icon name, for example `badge-check`. */
export type LucideName = string;

export type SectionId =
  | 'dashboard'
  | 'verification'
  | 'businesses'
  | 'clients'
  | 'reports'
  | 'support'
  | 'content'
  | 'billing'
  | 'announcements'
  | 'settings'
  | 'audit-log';

export type CountKey = 'queue' | 'reports' | 'tickets';

export interface Section {
  id: SectionId;
  label: string;
  icon: LucideName;
  href: string;
  roles: Role[];
  later?: boolean;
  countKey?: CountKey;
}

export type BizType = 'F&B' | 'Activity' | 'Event';
export type Emirate = 'Dubai' | 'Abu Dhabi' | 'Sharjah';

/** One line in a record's history or activity timeline. */
export interface HistoryEntry {
  at: string;
  who: string;
  what: string;
  /** Message to the business or internal note text, shown under the entry. */
  body?: string;
  kind?: 'msg' | 'note';
}

// --- Team ---

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// --- Dashboard ---

export interface Kpis {
  newClients: number;
  newBusinesses: number;
  queue: number;
  tickets: number;
  reports: number;
  trials: number;
  mrr: number;
  bookings: number;
  /** Percentage change against the previous period. */
  d: { newClients: number; newBusinesses: number; mrr: number; bookings: number };
}

export interface Series {
  labels: string[];
  clients: number[];
  businesses: number[];
  bookings: number[];
}

export interface Conversion {
  month: string;
  rate: number;
}

export type AttentionKind = 'verification' | 'report' | 'payment' | 'ticket';

export interface Attention {
  kind: AttentionKind;
  icon: LucideName;
  title: string;
  meta: string;
  href: string;
  tone: Tone;
}

export interface DashboardData {
  KPIS: Record<Range, Kpis>;
  SERIES: Record<Range, Series>;
  CONVERSION: Conversion[];
  ATTENTION: Attention[];
}

// --- Verification ---

export type VerificationKind = 'business' | 'branch' | 'outlet';
export type VerificationStatus = 'pending' | 'changes' | 'resubmitted' | 'approved' | 'rejected';

/** Position is a percentage on the map preview. */
export interface MapLocation {
  area: string;
  emirate: Emirate;
  x: number;
  y: number;
}

export interface SubmittedDoc {
  id: string;
  name: string;
  size: string;
  pages: number;
}

export interface Verification {
  id: string;
  kind: VerificationKind;
  name: string;
  /** Parent business, for branch and outlet requests. */
  parent?: string;
  type: BizType;
  emirate: Emirate;
  submitted: string;
  assignee: string | null;
  status: VerificationStatus;
  company: string;
  licence: string;
  trn: string;
  owner: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: MapLocation;
  outlets: { name: string; type: BizType }[];
  docs: SubmittedDoc[];
  history: HistoryEntry[];
  /** Fields and documents flagged by "Request changes". */
  flags?: string[];
}

export interface DuplicateSide {
  name: string;
  area: string;
  licence: string;
  whatsapp: string;
  owner: string;
  outlets: number;
  joined: string;
  status: 'Active' | 'Pending';
}

export interface Duplicate {
  id: string;
  reason: string;
  score: number;
  a: DuplicateSide;
  b: DuplicateSide;
}

// --- Businesses ---

export type BusinessStatus = 'active' | 'trial' | 'pending' | 'suspended';
export type PlanName = 'Starter' | 'Growth' | 'Enterprise';

export interface Business {
  id: string;
  name: string;
  /** The types of the business's places. A type belongs to a place (outlet), not the business. */
  types: BizType[];
  emirate: Emirate;
  status: BusinessStatus;
  /** `—` while the business is still pending. */
  plan: PlanName | '—';
  joined: string;
  trialEnds?: string;
  owner: string;
  email: string;
  phone: string;
  licence: string;
  trn: string;
  branches: number;
  outlets: number;
  rating: number;
  reviews: number;
  mrr: number;
  bookings30: number;
  paymentFailed?: boolean;
  suspendReason?: string;
}

export type ListingStatus = 'Published' | 'Draft' | 'Unpublished';
/** How expensive a place is, per person: $ under AED 50, $$ AED 50–150, $$$ AED 150+. */
export type PriceBand = '$' | '$$' | '$$$';
export type BranchStatus = 'Verified' | 'Waiting for verification';

/** An event or activity listed on top of a place (its own listing). */
export interface PlaceSubListing {
  id: string;
  kind: 'Event' | 'Activity';
  title: string;
  /** Date and time for an event, duration for an activity. */
  when: string;
  listing: ListingStatus;
  /** Admin who unpublished it; only they can publish it again. */
  unpublishedBy?: string;
}

/** A place: the branch's default outlet, or one outlet of a big branch. */
export interface Place {
  id: string;
  name: string;
  type: BizType;
  priceBand: PriceBand;
  listing: ListingStatus;
  /** Admin who unpublished it; only they can publish it again. */
  unpublishedBy?: string;
  /** Events and activities listed on top of this place. */
  listings: PlaceSubListing[];
}
export type MemberRole = 'Owner' | 'Manager' | 'Staff';

export interface BusinessDetail {
  /** A branch with one outlet shows as one place; a big branch shows each outlet as its own place. */
  branches: { name: string; area: string; status: BranchStatus; outlets: Place[] }[];
  team: { name: string; email: string; role: MemberRole; last: string }[];
  invoices: { id: string; date: string; amount: number; status: InvoiceStatus }[];
  reviews: { author: string; rating: number; date: string; text: string; status: 'Visible' | 'Reported' }[];
  tickets: { id: string; subject: string; status: 'Resolved' | 'Open'; date: string }[];
  activity: HistoryEntry[];
}

export interface Member {
  name: string;
  email: string;
  business: string;
  /** Business id. */
  bid: string;
  role: MemberRole;
  status: 'Active' | 'Invited' | 'Suspended';
  last: string;
  joined: string;
}

// --- Reports and moderation ---

export interface ReportedReview {
  id: string;
  business: string;
  author: string;
  authorWarnings: number;
  rating: number;
  posted: string;
  reportedAt: string;
  reason: string;
  note: string;
  text: string;
  history: HistoryEntry[];
}

export interface ReportedListing {
  id: string;
  kind: 'Photo' | 'Listing';
  business: string;
  /** What was reported: a place, an event or an activity, and which one. */
  target: { kind: 'Place' | 'Event' | 'Activity'; name: string };
  reporter: string;
  reportedAt: string;
  reason: string;
  text: string;
  history: HistoryEntry[];
}

/** A client reported by a business (no-show, behaviour, fake bookings). Not in the Claude Design prototype; added 2026-10-16. */
export interface ReportedClient {
  id: string;
  /** Client id, for the link to the client's page. */
  cid: string;
  client: string;
  business: string;
  reportedAt: string;
  reason: string;
  text: string;
  /** Booking the report is about, if any. */
  booking?: string;
  priorWarnings: number;
  history: HistoryEntry[];
}

// --- Support ---

export type TicketStatus = 'open' | 'waiting' | 'resolved';
export type Priority = 'urgent' | 'high' | 'normal' | 'low';
export type TicketCategory = 'Billing' | 'Verification' | 'Listing' | 'Technical' | 'Client help';
/** `sys` lines record assignment, priority and status changes. */
export type ThreadSide = 'them' | 'us' | 'note' | 'sys';

export interface Ticket {
  id: string;
  from: string;
  fromKind: 'business' | 'client';
  contact: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: Priority;
  assignee: string | null;
  updated: string;
  thread: { who: string; side: ThreadSide; at: string; text: string }[];
}

export interface SavedReply {
  id: string;
  title: string;
  body: string;
}

// --- Clients ---

export type SignUpMethod = 'Google' | 'Apple' | 'Email' | 'Phone';

export interface Client {
  id: string;
  name: string;
  contact: string;
  method: SignUpMethod;
  joined: string;
  /** `deleted` once the client deletes their account in the app. */
  status: 'active' | 'suspended' | 'deleted';
  city: Emirate;
  suspendReason?: string;
  deletionRequested?: boolean;
  prefs: { food: string[]; activities: string[]; budget: string; tags: string[] };
  bookings: { business: string; date: string; people: number; status: 'Confirmed' | 'Completed' }[];
  reviews: { business: string; rating: number; date: string; text: string }[];
  reports: { by: string; reason: string; date: string; status: 'Open' }[];
  devices: { name: string; last: string; app: string }[];
}

// --- Content ---

export interface Guide {
  id: string;
  kind: 'Guide' | 'FAQ';
  title: string;
  category: string;
  status: 'Published' | 'Draft';
  updated: string;
  helpful: number;
  notHelpful: number;
  body: string;
}

export interface Tag {
  id: string;
  name: string;
  uses: number;
  archived?: boolean;
}

export interface TagGroups {
  listing: Tag[];
  food: Tag[];
  activity: Tag[];
}

// --- Billing ---

export type InvoiceStatus = 'Paid' | 'Failed' | 'Refunded';

export interface Plan {
  id: 'starter' | 'growth' | 'enterprise';
  name: PlanName;
  price: number;
  outlets: string;
  features: string[];
  subs: number;
}

export interface Subscription {
  business: string;
  plan: PlanName;
  status: 'Active' | 'Past due' | 'Trial' | 'Paused';
  since: string;
  /** Next billing date, or `—` when paused. */
  next: string;
  amount: number;
}

export interface Invoice {
  id: string;
  business: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
}

export interface FailedPayment {
  id: string;
  business: string;
  amount: number;
  attempts: number;
  last: string;
  reason: string;
  contact: string;
}

export interface Refund {
  id: string;
  invoice: string;
  business: string;
  amount: number;
  date: string;
  by: string;
  reason: string;
}

// --- Announcements ---

export interface Announcement {
  id: string;
  channel: 'Push' | 'Email' | 'Banner';
  audience: string;
  title: string;
  body: string;
  status: 'Sent' | 'Scheduled' | 'Draft' | 'Cancelled';
  when: string | null;
  reach: number;
  by: string;
}

// --- Settings ---

export interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  last: string;
  current?: boolean;
}

export interface Invite {
  email: string;
  role: Role;
  sent: string;
  by: string;
  expires: string;
  expired?: boolean;
}

export interface LegalDoc {
  id: 'terms' | 'privacy';
  name: string;
  version: string;
  published: string;
  /** Percentage of clients who accepted the current version. */
  accepted: number;
  history: { v: string; date: string; by: string }[];
}

// --- Audit log ---

export interface AuditEntry {
  at: string;
  who: string;
  action: string;
  target: string;
  kind: 'Business' | 'Client' | 'Team' | 'Platform';
}

// --- Top bar ---

export interface SearchItem {
  name: string;
  kind: 'Business' | 'Client' | 'Ticket';
  meta: string;
  icon: LucideName;
  href: string;
}

export interface AdminNotification {
  icon: LucideName;
  text: string;
  time: string;
  href: string;
}
