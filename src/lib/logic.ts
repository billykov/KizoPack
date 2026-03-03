import { ITEM_LIB } from './constants';
import type { Profile, SharedLibItem, ActiveTrip, PackItem, LibItem } from './types';

export function getItem(id: string): LibItem | undefined {
  for (const items of Object.values(ITEM_LIB)) {
    const found = items.find(i => i.id === id);
    if (found) return found;
  }
  return undefined;
}

export function generatePackingList(
  profiles: Profile[],
  shared: SharedLibItem[],
  dur: number,
  weather: string | null,
  acts: string[],
  travelers: string[],
): ActiveTrip['packing'] {
  const packing: ActiveTrip['packing'] = {};

  travelers.forEach(tid => {
    const p = profiles.find(x => x.id === tid);
    if (!p) return;

    const m = p.multi;
    const shirts = Math.ceil(dur * m);
    const pants  = Math.max(1, Math.ceil(dur / 2));

    const clothing: PackItem[] = [
      { name: p.type === 'baby' ? 'חליפות שלמות' : 'חולצות', emoji: '👕', qty: shirts, done: false, custom: false },
      { name: p.type === 'baby' ? 'מכנסוני תינוק' : 'מכנסיים', emoji: '👖', qty: pants, done: false, custom: false },
    ];

    if (p.type !== 'baby') {
      clothing.push({ name: 'גרביים',  emoji: '🧦', qty: Math.ceil(dur * m), done: false, custom: false });
      clothing.push({ name: 'תחתונים', emoji: '🩲', qty: shirts,              done: false, custom: false });
    }

    if (acts.includes('beach'))  clothing.push({ name: p.type === 'baby' ? 'בגד ים לתינוק' : 'בגד ים', emoji: '🩱', qty: 2, done: false, custom: false });
    if (weather === 'cold')  {
      clothing.push({ name: 'מעיל',   emoji: '🧥', qty: 1, done: false, custom: false });
      clothing.push({ name: 'סוודר',  emoji: '🧶', qty: 2, done: false, custom: false });
    }
    if (weather === 'rainy') clothing.push({ name: 'מעיל גשם', emoji: '🌧️', qty: 1, done: false, custom: false });

    // Personal items from profile
    const allProfileItems = [
      ...p.items.map(id => {
        const item = getItem(id) || p.customItems?.find(ci => ci.id === id);
        return item ? { name: item.name, emoji: item.emoji, qty: null, done: false, custom: false } as PackItem : null;
      }),
    ].filter((i): i is PackItem => i !== null);

    packing[tid] = {
      cats: [
        { id: 'clothing', name: 'ביגוד',  em: '👕', items: clothing },
        { id: 'personal', name: 'אישי',   em: '🎒', items: allProfileItems },
      ],
    };
  });

  // Shared bag — filtered by traveler types
  const travTypes = new Set(
    travelers
      .map(id => profiles.find(p => p.id === id)?.type)
      .filter((t): t is 'adult' | 'child' | 'baby' => Boolean(t))
  );

  const sharedItems = shared.filter(
    i => i.sel && (i.aud === 'all' || travTypes.has(i.aud))
  );

  if (sharedItems.length > 0) {
    packing['shared'] = {
      cats: [{
        id:    'shared',
        name:  'תיק משותף',
        em:    '🎒',
        items: sharedItems.map(i => ({ name: i.name, emoji: i.emoji, qty: null, done: false, custom: false })),
      }],
    };
  }

  return packing;
}

export function calcProgress(packing: ActiveTrip['packing']): { done: number; total: number; pct: number } {
  let total = 0, done = 0;
  Object.values(packing).forEach(list =>
    list.cats.forEach(c => {
      total += c.items.length;
      done  += c.items.filter(i => i.done).length;
    })
  );
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function isAllDone(packing: ActiveTrip['packing']): boolean {
  const hasItems = Object.values(packing).some(l => l.cats.some(c => c.items.length > 0));
  if (!hasItems) return false;
  return Object.values(packing).every(list =>
    list.cats.every(c => c.items.every(i => i.done))
  );
}
