export interface Fan {
  id: string;
  email: string;
  name: string | null;
  source: string;
  founding_member: number;
  lifetime_dp: number;
  current_rank: number;
  rank_title: string;
  acquired_at: string;
  created_at: string;
  engagement_count: number;
}

export interface FanDetail extends Fan {
  events: EngagementEvent[];
}

export interface EngagementEvent {
  id: string;
  event_type: string;
  dp_awarded: number;
  dp_base: number;
  multiplier: number;
  approved: number;
  created_at: string;
}

export interface Offering {
  id: string;
  category: string;
  title: string | null;
  description: string | null;
  content_url: string | null;
  content_type: string;
  fan_email: string | null;
  fan_name: string | null;
  status: string;
  submitted_at: string;
  featured: number;
}

export interface Reaction {
  id: string;
  youtube_url: string;
  youtube_id: string;
  title: string | null;
  channel_name: string | null;
  thumbnail_url: string | null;
  song_tag: string | null;
  status: string;
  discovered_at: string;
  submitted_by_email: string | null;
  submitted_by_name: string | null;
}

export interface ChronicleEvent {
  id: string;
  date_display: string;
  title: string;
  body: string;
  era: string | null;
  video_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  media: ChronicleMedia[];
  tracks: ChronicleTrack[];
}

export interface ChronicleMedia {
  id: string;
  chronicle_event_id: string;
  media_type: string;
  src: string;
  alt: string;
  caption: string | null;
  sort_order: number;
}

export interface ChronicleTrack {
  id: string;
  chronicle_event_id: string;
  name: string;
  sort_order: number;
}

export interface DashboardData {
  total_fans: number;
  founding_fans: number;
  pending_offerings: number;
  pending_reactions: number;
  total_dp_awarded: number;
  by_rank: { rank: number; title: string; count: number }[];
  by_source: { source: string; count: number }[];
  recent_events: {
    id: string;
    fan_id: string;
    event_type: string;
    dp_awarded: number;
    created_at: string;
    email: string | null;
    name: string | null;
  }[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pages: number;
  fans?: T[];
  offerings?: T[];
  reactions?: T[];
}
