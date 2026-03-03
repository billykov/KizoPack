export interface Profile {
  id: string;
  emoji: string;
  name: string;
  type: 'adult' | 'child' | 'baby';
  multi: number;
  items: string[];
  customItems: CustomItem[];
}

export interface CustomItem {
  id: string;
  emoji: string;
  name: string;
}

export interface LibItem {
  id: string;
  emoji: string;
  name: string;
}

export interface SharedLibItem {
  id: string;
  emoji: string;
  name: string;
  aud: 'all' | 'adult' | 'child' | 'baby';
  sel: boolean;
}

export interface PackItem {
  name: string;
  emoji: string;
  qty: number | null;
  done: boolean;
  custom: boolean;
}

export interface PackCategory {
  id: string;
  name: string;
  em: string;
  items: PackItem[];
}

export interface PackPersonList {
  cats: PackCategory[];
}

export interface ActiveTrip {
  dest: string;
  dur: number;
  weather: string | null;
  acts: string[];
  travelers: string[];
  packing: Record<string, PackPersonList>;
}

export interface CompletedTrip {
  id: string;
  dest: string;
  dur: number;
  weather: string | null;
  acts: string[];
  travelers: string[];
  totalItems: number;
  completedAt: number;
}

// Persisted state
export interface PersistedState {
  profiles: Profile[];
  shared: SharedLibItem[];
  activeTrip: ActiveTrip | null;
  tripFinished: boolean;
  completedTrips: CompletedTrip[];
}

// UI state (transient)
export interface UIState {
  formEmoji: string;
  formType: 'adult' | 'child' | 'baby';
  formMulti: number;
  formSelItems: string[];
  formAutoItems: string[];
  formCustomItems: CustomItem[];
  formActiveCat: string;
  editId: string | null;
  callerRoute: string;
  sharedFilter: 'all' | 'adult' | 'child' | 'baby';
  planDur: number;
  planWeather: string | null;
  planActs: string[];
  planTravelers: string[];
  activeTab: string | null;
  emojiCat: string;
  ssItem: string | null;
  ssTabKey: string | null;
  ssTarget: string | null;
  undoData: { key: string; ci: number; item: PackItem } | null;
  undoTimer: ReturnType<typeof setTimeout> | null;
}
