export interface ListingMediaItem {
  id: string;
  url: string;
  altText?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface ListingServiceItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  duration?: string;
  category?: string;
  popular?: boolean;
}

export interface ListingInsightItem {
  iconName?: string;
  title: string;
  description?: string;
}

export interface ListingHoursSlot {
  open: string;
  close: string;
  closed?: boolean;
}

export type WeeklyOpeningHours = Record<string, ListingHoursSlot>;

export interface ListingReviewItem {
  id: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  verifiedVisit?: boolean;
  ownerReply?: string | null;
  ownerReplyAt?: Date | string | null;
  createdAt: Date | string;
}
