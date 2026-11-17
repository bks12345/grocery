import {
  PartyPopper,
  Sparkles,
  Flame,
  Zap,
  Gift,
  ShoppingBag,
  Tag,
  Percent,
  Star,
  Heart,
  BadgePercent,
  Clock,
} from "lucide-react";

export const FESTIVE_ICON_MAP = {
  flame: { label: "Diya / Flame", icon: Flame, emoji: "🪔" },
  party: { label: "Party Popper", icon: PartyPopper, emoji: "🎉" },
  sparkles: { label: "Sparkles", icon: Sparkles, emoji: "✨" },
  zap: { label: "Flash Sale", icon: Zap, emoji: "⚡" },
  gift: { label: "Gift Box", icon: Gift, emoji: "🎁" },
  bag: { label: "Shopping Bag", icon: ShoppingBag, emoji: "🛍️" },
  tag: { label: "Offer Tag", icon: Tag, emoji: "🏷️" },
  percent: { label: "50% Discount", icon: Percent, emoji: "%" },
  star: { label: "Best Seller", icon: Star, emoji: "⭐" },
};

export const FESTIVE_EMOJI_PRESETS = [
  "🪔",
  "🎉",
  "🎆",
  "⚡",
  "🎁",
  "🛍️",
  "🪅",
  "✨",
  "🏮",
  "🥩",
];

export default function FestiveIcon({ icon, size = 16, className = "" }) {
  if (!icon) return <Flame size={size} className={className} />;

  const val = String(icon).trim().toLowerCase();

  if (val === "flame" || val === "diya" || val === "🪔") {
    return <Flame size={size} className={className} />;
  }
  if (val === "party" || val === "partypopper" || val === "🎉") {
    return <PartyPopper size={size} className={className} />;
  }
  if (val === "sparkles" || val === "✨") {
    return <Sparkles size={size} className={className} />;
  }
  if (val === "zap" || val === "flash" || val === "⚡") {
    return <Zap size={size} className={className} />;
  }
  if (val === "gift" || val === "🎁") {
    return <Gift size={size} className={className} />;
  }
  if (val === "bag" || val === "shoppingbag" || val === "🛍️") {
    return <ShoppingBag size={size} className={className} />;
  }
  if (val === "tag" || val === "🏷️") {
    return <Tag size={size} className={className} />;
  }
  if (val === "percent" || val === "%") {
    return <Percent size={size} className={className} />;
  }
  if (val === "star" || val === "⭐") {
    return <Star size={size} className={className} />;
  }

  // Fallback to text/emoji string
  return <span className={`inline-block leading-none ${className}`}>{icon}</span>;
}
