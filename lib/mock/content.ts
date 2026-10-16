// Prototype mock data, copied from the Claude Design project's lib/mock-data*.js.
import type { Guide, TagGroups } from '@/lib/types';

export const GUIDES: Guide[] = [
  { id: 'g1', kind: 'Guide', title: 'Verify your business', category: 'Getting started', status: 'Published', updated: '2026-09-28', helpful: 412, notHelpful: 38, body: 'Upload your trade licence as a clear PDF, add your TRN and pin your branch on the map. Verification usually takes 1 working day.' },
  { id: 'g2', kind: 'Guide', title: 'Add a branch or outlet', category: 'Branches and outlets', status: 'Published', updated: '2026-09-14', helpful: 268, notHelpful: 51, body: 'Go to Branches, choose Add branch, then add outlets under it. Each outlet has one type and one listing.' },
  { id: 'g3', kind: 'Guide', title: 'Create an offer that gets approved', category: 'Offers', status: 'Published', updated: '2026-10-02', helpful: 190, notHelpful: 72, body: 'Show the original price, the dates and the terms. Discounts over 50% need proof of the original price.' },
  { id: 'g4', kind: 'Guide', title: 'Reply to reviews', category: 'Reviews', status: 'Draft', updated: '2026-10-15', helpful: 0, notHelpful: 0, body: 'Reply within 48 hours. Keep it short and specific. You can report a review that breaks the guidelines.' },
  { id: 'g5', kind: 'FAQ', title: 'How long is the free trial?', category: 'Billing', status: 'Published', updated: '2026-08-01', helpful: 530, notHelpful: 12, body: '30 days on any plan. We email you 7 days and 1 day before it ends.' },
  { id: 'g6', kind: 'FAQ', title: 'Can I change my plan mid-month?', category: 'Billing', status: 'Published', updated: '2026-08-01', helpful: 211, notHelpful: 40, body: 'Yes. Upgrades apply straight away and are prorated. Downgrades apply on your next invoice.' },
  { id: 'g7', kind: 'FAQ', title: 'Why was my listing unpublished?', category: 'Listings', status: 'Draft', updated: '2026-10-12', helpful: 0, notHelpful: 0, body: 'Usually a reported photo or outdated opening hours. Check your email for the reason, fix it and publish again.' },
];

export const TAG_GROUPS: TagGroups = {
  listing: [
    { id: 't1', name: 'Family friendly', uses: 1840 }, { id: 't2', name: 'Outdoor seating', uses: 1512 }, { id: 't3', name: 'Shisha', uses: 640 },
    { id: 't4', name: 'Parking', uses: 1205 }, { id: 't5', name: 'Wheelchair accessible', uses: 702 }, { id: 't6', name: 'Vegan options', uses: 488 }, { id: 't7', name: 'Pet friendly', uses: 214, archived: true },
  ],
  food: [
    { id: 'f1', name: 'Emirati', uses: 920 }, { id: 'f2', name: 'Levantine', uses: 1302 }, { id: 'f3', name: 'Indian', uses: 1110 }, { id: 'f4', name: 'Seafood', uses: 806 },
    { id: 'f5', name: 'Brunch', uses: 1440 }, { id: 'f6', name: 'Cafés', uses: 2010 }, { id: 'f7', name: 'Burgers', uses: 770 },
  ],
  activity: [
    { id: 'a1', name: 'Desert safaris', uses: 640 }, { id: 'a2', name: 'Beach clubs', uses: 512 }, { id: 'a3', name: 'Live music', uses: 488 }, { id: 'a4', name: 'Water sports', uses: 455 },
    { id: 'a5', name: 'Museums', uses: 301 }, { id: 'a6', name: 'Padel and tennis', uses: 270 },
  ],
};
