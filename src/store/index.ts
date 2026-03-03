'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SHARED_LIB, AUTO_ITEMS, DEFAULT_MULTI } from '@/lib/constants';
import { generatePackingList } from '@/lib/logic';
import type { Profile, SharedLibItem, ActiveTrip, CompletedTrip, UIState, PackItem } from '@/lib/types';

interface PersistedSlice {
  profiles: Profile[];
  shared: SharedLibItem[];
  activeTrip: ActiveTrip | null;
  tripFinished: boolean;
  completedTrips: CompletedTrip[];
}

interface StoreState extends PersistedSlice {
  // UI state
  ui: UIState;

  // Profile actions
  addProfile: (profile: Profile) => void;
  updateProfile: (profile: Profile) => void;
  deleteProfile: (id: string) => void;

  // Shared bag actions
  toggleShared: (id: string) => void;
  saveShared: () => void;

  // Trip actions
  generateTrip: (dest: string) => void;
  toggleDone: (key: string, ci: number, ii: number) => void;
  deletePackItem: (key: string, ci: number, ii: number) => void;
  addCustomPackItem: (key: string, ci: number, name: string) => void;
  undoDelete: () => void;
  finishTrip: () => void;
  abandonTrip: () => void;
  startNewTrip: () => void;
  duplicateTrip: (id: string) => void;

  // Smart save
  confirmSS: () => void;

  // UI setters
  setUI: (partial: Partial<UIState>) => void;
  resetFormForAdd: () => void;
  resetFormForEdit: (id: string) => void;
  resetState: () => void;
}

const initialUI: UIState = {
  formEmoji:       '🦊',
  formType:        'adult',
  formMulti:       1.5,
  formSelItems:    [...AUTO_ITEMS.adult],
  formAutoItems:   [...AUTO_ITEMS.adult],
  formCustomItems: [],
  formActiveCat:   'toiletries',
  editId:          null,
  callerRoute:     '/onboard',
  sharedFilter:    'all',
  planDur:         7,
  planWeather:     null,
  planActs:        [],
  planTravelers:   [],
  activeTab:       null,
  emojiCat:        'people',
  ssItem:          null,
  ssTabKey:        null,
  ssTarget:        null,
  undoData:        null,
  undoTimer:       null,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Persisted
      profiles:       [],
      shared:         SHARED_LIB.map(i => ({ ...i, sel: false })),
      activeTrip:     null,
      tripFinished:   false,
      completedTrips: [],

      // UI (not persisted)
      ui: initialUI,

      // Profile actions
      addProfile: (profile) => set(s => ({ profiles: [...s.profiles, profile] })),
      updateProfile: (profile) => set(s => ({
        profiles: s.profiles.map(p => p.id === profile.id ? profile : p),
      })),
      deleteProfile: (id) => set(s => ({ profiles: s.profiles.filter(p => p.id !== id) })),

      // Shared bag
      toggleShared: (id) => set(s => ({
        shared: s.shared.map(i => i.id === id ? { ...i, sel: !i.sel } : i),
      })),
      saveShared: () => {/* persisted automatically */},

      // Trip generation
      generateTrip: (dest) => {
        const { profiles, shared, ui } = get();
        const { planDur, planWeather, planActs, planTravelers } = ui;
        if (!planTravelers.length) return;

        const packing = generatePackingList(
          profiles, shared, planDur, planWeather, planActs, planTravelers
        );
        const activeTab = planTravelers[0] ?? null;
        set({
          activeTrip: {
            dest,
            dur:      planDur,
            weather:  planWeather,
            acts:     [...planActs],
            travelers:[...planTravelers],
            packing,
          },
          ui: { ...get().ui, activeTab },
        });
      },

      toggleDone: (key, ci, ii) => set(s => {
        if (!s.activeTrip) return {};
        const packing = deepCopyPacking(s.activeTrip.packing);
        packing[key].cats[ci].items[ii].done = !packing[key].cats[ci].items[ii].done;
        return { activeTrip: { ...s.activeTrip, packing } };
      }),

      deletePackItem: (key, ci, ii) => set(s => {
        if (!s.activeTrip) return {};
        const packing = deepCopyPacking(s.activeTrip.packing);
        const item = { ...packing[key].cats[ci].items[ii] };

        // Clear existing undo timer
        const { undoTimer } = s.ui;
        if (undoTimer) clearTimeout(undoTimer);

        packing[key].cats[ci].items.splice(ii, 1);

        // Set new timer
        const timer = setTimeout(() => {
          set(st => ({ ui: { ...st.ui, undoData: null, undoTimer: null } }));
        }, 4000);

        return {
          activeTrip: { ...s.activeTrip, packing },
          ui: { ...s.ui, undoData: { key, ci, item }, undoTimer: timer },
        };
      }),

      addCustomPackItem: (key, ci, name) => set(s => {
        if (!s.activeTrip) return {};
        const packing = deepCopyPacking(s.activeTrip.packing);
        packing[key].cats[ci].items.push({ name, emoji: '📌', qty: null, done: false, custom: true });
        return {
          activeTrip: { ...s.activeTrip, packing },
          ui: { ...s.ui, ssItem: name, ssTabKey: key, ssTarget: key },
        };
      }),

      undoDelete: () => set(s => {
        const { undoData, undoTimer } = s.ui;
        if (!undoData || !s.activeTrip) return {};
        if (undoTimer) clearTimeout(undoTimer);

        const packing = deepCopyPacking(s.activeTrip.packing);
        packing[undoData.key].cats[undoData.ci].items.push(undoData.item);

        return {
          activeTrip: { ...s.activeTrip, packing },
          ui: { ...s.ui, undoData: null, undoTimer: null },
        };
      }),

      finishTrip: () => set(s => {
        if (!s.activeTrip) return {};
        const { dest, dur, weather, acts, travelers, packing } = s.activeTrip;
        let totalItems = 0;
        Object.values(packing).forEach(l => l.cats.forEach(c => (totalItems += c.items.length)));

        const completed: CompletedTrip = {
          id: Date.now().toString(),
          dest, dur, weather, acts: [...acts], travelers: [...travelers],
          totalItems, completedAt: Date.now(),
        };
        return { completedTrips: [...s.completedTrips, completed], tripFinished: true };
      }),

      abandonTrip: () => set({ activeTrip: null, tripFinished: false }),

      startNewTrip: () => set(s => ({
        activeTrip:   null,
        tripFinished: false,
        ui: { ...s.ui, planDur: 7, planWeather: null, planActs: [], planTravelers: [] },
      })),

      duplicateTrip: (id) => set(s => {
        const t = s.completedTrips.find(x => x.id === id);
        if (!t) return {};
        const validTravelers = t.travelers.filter(tid => s.profiles.find(p => p.id === tid));
        return { ui: { ...s.ui, planDur: t.dur, planWeather: t.weather, planActs: [...t.acts], planTravelers: validTravelers } };
      }),

      confirmSS: () => set(s => {
        const { ssTarget, ssItem } = s.ui;
        if (!ssTarget || ssTarget === 'shared' || !ssItem) return {};
        const profiles = s.profiles.map(p => {
          if (p.id !== ssTarget) return p;
          const id = 'custom_saved_' + Date.now();
          return {
            ...p,
            customItems: [...(p.customItems || []), { id, emoji: '📌', name: ssItem }],
            items: [...p.items, id],
          };
        });
        return { profiles, ui: { ...s.ui, ssItem: null, ssTabKey: null, ssTarget: null } };
      }),

      setUI: (partial) => set(s => ({ ui: { ...s.ui, ...partial } })),

      resetFormForAdd: () => set(s => ({
        ui: {
          ...s.ui,
          editId:          null,
          formEmoji:       '🦊',
          formType:        'adult',
          formMulti:       DEFAULT_MULTI.adult,
          formSelItems:    [...AUTO_ITEMS.adult],
          formAutoItems:   [...AUTO_ITEMS.adult],
          formCustomItems: [],
          formActiveCat:   'toiletries',
        },
      })),

      resetFormForEdit: (id) => set(s => {
        const p = s.profiles.find(x => x.id === id);
        if (!p) return {};
        return {
          ui: {
            ...s.ui,
            editId:          id,
            formEmoji:       p.emoji,
            formType:        p.type,
            formMulti:       p.multi,
            formSelItems:    [...p.items],
            formAutoItems:   [],
            formCustomItems: [...(p.customItems || [])],
            formActiveCat:   'toiletries',
          },
        };
      }),

      resetState: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('packsmart_v1');
          window.location.href = '/';
        }
      },
    }),
    {
      name: 'packsmart_v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      partialize: (state) => ({
        profiles:       state.profiles,
        shared:         state.shared,
        activeTrip:     state.activeTrip,
        tripFinished:   state.tripFinished,
        completedTrips: state.completedTrips,
      }),
    }
  )
);

function deepCopyPacking(packing: ActiveTrip['packing']): ActiveTrip['packing'] {
  const copy: ActiveTrip['packing'] = {};
  for (const key of Object.keys(packing)) {
    copy[key] = {
      cats: packing[key].cats.map(cat => ({
        ...cat,
        items: cat.items.map(item => ({ ...item })) as PackItem[],
      })),
    };
  }
  return copy;
}
