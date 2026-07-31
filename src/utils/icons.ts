import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Copy,
  TickCircle,
  Clock,
  Search,
  Menu,
  Book,
  BoltLightning,
  ShieldCheck,
  InfoCircle,
  User,
  Bell,
  Settings,
} from 'reicon';

const opts = { size: 16, color: 'currentColor', weight: 'Outline' } as const;
const opts20 = { size: 20, color: 'currentColor', weight: 'Outline' } as const;
const opts24 = { size: 24, color: 'currentColor', weight: 'Outline' } as const;

export const Icons = {
  arrowLeft: ArrowLeft.toSvg(opts),
  arrowRight: ArrowRight.toSvg(opts),
  chevronRight: ChevronRight.toSvg({ size: 14, color: 'currentColor', weight: 'Outline' }),
  copy: Copy.toSvg(opts),
  copySuccess: TickCircle.toSvg({ size: 16, color: 'currentColor', weight: 'Filled' }),
  clock: Clock.toSvg({ size: 14, color: 'currentColor', weight: 'Outline' }),
  search: Search.toSvg(opts20),
  menu: Menu.toSvg(opts24),
  book: Book.toSvg(opts),
  bolt: BoltLightning.toSvg(opts),
  shieldCheck: ShieldCheck.toSvg(opts),
  info: InfoCircle.toSvg(opts),
  user: User.toSvg(opts20),
  bell: Bell.toSvg(opts20),
  settings: Settings.toSvg(opts20),
} as const;
