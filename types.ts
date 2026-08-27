import { LucideIcon } from 'lucide-react';

export interface ServiceItem {
  title: string;
  description: string;
  icon: LucideIcon;
  popular?: boolean;
}

export interface ReasonItem {
  title: string;
  description: string;
  icon: LucideIcon;
  imageUrl?: string;
}

export interface TestimonialItem {
  text: string;
  author: string;
}