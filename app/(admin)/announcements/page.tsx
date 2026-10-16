import type { Metadata } from 'next';
import { Announcements } from '@/components/announcements/Announcements';

export const metadata: Metadata = { title: 'Announcements' };

export default function AnnouncementsPage() {
  return <Announcements />;
}
