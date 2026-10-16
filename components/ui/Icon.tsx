import {
  Archive, ArchiveRestore, ArrowDown, ArrowLeft, ArrowUp, Ban, Banknote, BadgeCheck, Bell, BookOpen, CalendarCheck, Check, ChevronRight, CircleX, Clock,
  CloudOff, CreditCard, FileText, Flag, Hourglass, Image, Inbox, Info, LayoutDashboard, LifeBuoy, Lock, LogOut, MapPin, Megaphone, Menu,
  PanelRightOpen, Pencil, Receipt, ScrollText, Search, Settings, ShieldAlert, Store, TimerOff, User, UserPlus, Users, X,
  type LucideIcon,
} from 'lucide-react';
import type { LucideName } from '@/lib/types';

// The prototype names its icons by Lucide's kebab-case names. Only the icons
// in use are registered, so the bundle carries these and no others.
const REGISTRY: Record<LucideName, LucideIcon> = {
  archive: Archive,
  'archive-restore': ArchiveRestore,
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-up': ArrowUp,
  'badge-check': BadgeCheck,
  ban: Ban,
  banknote: Banknote,
  bell: Bell,
  'book-open': BookOpen,
  'calendar-check': CalendarCheck,
  check: Check,
  'chevron-right': ChevronRight,
  'circle-x': CircleX,
  clock: Clock,
  'cloud-off': CloudOff,
  'credit-card': CreditCard,
  'file-text': FileText,
  flag: Flag,
  hourglass: Hourglass,
  image: Image,
  inbox: Inbox,
  info: Info,
  'layout-dashboard': LayoutDashboard,
  'life-buoy': LifeBuoy,
  lock: Lock,
  'log-out': LogOut,
  'map-pin': MapPin,
  megaphone: Megaphone,
  menu: Menu,
  'panel-right-open': PanelRightOpen,
  pencil: Pencil,
  receipt: Receipt,
  'scroll-text': ScrollText,
  search: Search,
  settings: Settings,
  'shield-alert': ShieldAlert,
  store: Store,
  'timer-off': TimerOff,
  user: User,
  'user-plus': UserPlus,
  users: Users,
  x: X,
};

export function Icon({ name, size = 18, className }: { name: LucideName; size?: number; className?: string }) {
  const Glyph = REGISTRY[name];
  if (!Glyph) return null;
  return <Glyph size={size} strokeWidth={2} className={className} aria-hidden="true" />;
}
