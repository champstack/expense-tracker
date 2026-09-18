"use client";

import React from "react";
import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  HeartPulse,
  Tv,
  MoreHorizontal,
  Banknote,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coffee,
  Fuel,
  Plane,
  Smartphone,
  BookOpen,
  CircleDot,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  HeartPulse,
  Tv,
  MoreHorizontal,
  Banknote,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coffee,
  Fuel,
  Plane,
  Smartphone,
  BookOpen,
  CircleDot,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ name, className = "w-5 h-5", size = 20 }: CategoryIconProps) {
  const IconComponent = ICON_MAP[name] || CircleDot;
  return <IconComponent className={className} size={size} />;
}
