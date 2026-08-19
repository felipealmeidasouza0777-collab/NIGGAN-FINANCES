import {
  Tag,
  AlertCircle,
  Banknote,
  BarChart3,
  Briefcase,
  Building,
  Car,
  Coins,
  CreditCard,
  Fuel,
  Gift,
  Hammer,
  HeartHandshake,
  Rocket,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Smile,
  Sparkles,
  Target,
  TrendingUp,
  Utensils,
  Video,
  Wallet,
  Wifi,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Explicit map (not `import * as`) so unused lucide-react icons get
// tree-shaken out of the production bundle — matters a lot for mobile load times.
const ICON_MAP: Record<string, LucideIcon> = {
  AlertCircle,
  Banknote,
  BarChart3,
  Briefcase,
  Building,
  Car,
  Coins,
  CreditCard,
  Fuel,
  Gift,
  Hammer,
  HeartHandshake,
  Rocket,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Smile,
  Sparkles,
  Target,
  TrendingUp,
  Utensils,
  Video,
  Wallet,
  Wifi,
};

/**
 * Resolves a category's stored `iconName` (e.g. "Fuel", "Wifi") into the
 * actual lucide-react icon component. Falls back to a generic tag icon
 * when the name doesn't match (e.g. custom categories created by the user
 * without picking a valid icon).
 */
export function getCategoryIcon(iconName: string | undefined): LucideIcon {
  if (!iconName) return Tag;
  return ICON_MAP[iconName] || Tag;
}
