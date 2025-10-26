import React from 'react';
import {
  Loader2,
  Sparkles,
  Heart,
  Leaf,
  Flower2,
  BookOpen,
  Ghost,
  Drumstick,
  TreePine
} from 'lucide-react'; 

// If you haven’t installed lucide-react yet, run this in your terminal:
// npm install lucide-react

export default function LoadingIcon({ customIcon }: { customIcon?: React.ReactNode }) {
  // detect current month (0 = January, 11 = December)
  const month = new Date().getMonth();

  // map of icons by month
  const seasonalIcons: Record<number, React.ElementType> = {
    0: Sparkles,   // January – New Year’s ✨
    1: Heart,      // February – Valentine’s ❤️
    2: Leaf,       // March – St. Patrick’s ☘️
    3: Flower2,    // April – Spring / Easter 🌸
    6: Sparkles,   // July – Independence Day 🎆
    7: BookOpen,   // August – Back to school 📚
    8: Leaf,       // September – Fall 🍂
    9: Ghost,      // October – Halloween 👻
    10: Drumstick, // November – Thanksgiving 🦃
    11: TreePine,  // December – Christmas 🎄
  };

  // pick seasonal icon or default to spinner
  const IconComponent = seasonalIcons[month] || Loader2;

  // allow manual override (custom icon)
  if (customIcon) {
    return <div className="animate-spin text-neutral-600">{customIcon}</div>;
  }

  // default seasonal spinner
  return (
    <div className="flex justify-center items-center py-8">
      <IconComponent className="animate-spin text-neutral-600" size={40} />
    </div>
  );
}
