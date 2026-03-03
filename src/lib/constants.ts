import type { LibItem, SharedLibItem } from './types';

export const ITEM_LIB: Record<string, LibItem[]> = {
  toiletries: [
    { id: 'toothbrush',  emoji: '🪥', name: 'מברשת שיניים' },
    { id: 'sunscreen',   emoji: '🧴', name: 'קרם הגנה' },
    { id: 'soap',        emoji: '🧼', name: 'סבון' },
    { id: 'shampoo',     emoji: '🚿', name: 'שמפו' },
    { id: 'moisturizer', emoji: '💧', name: 'קרם לחות' },
    { id: 'makeup',      emoji: '💄', name: 'איפור' },
    { id: 'deodorant',   emoji: '✨', name: 'דאודורנט' },
    { id: 'razor',       emoji: '🪒', name: 'סכין גילוח' },
  ],
  health: [
    { id: 'medicine',    emoji: '💊', name: 'תרופות' },
    { id: 'thermometer', emoji: '🌡️', name: 'מד חום' },
    { id: 'bandages',    emoji: '🩹', name: 'פלסטרים' },
    { id: 'painkiller',  emoji: '💊', name: 'משכך כאבים' },
  ],
  documents: [
    { id: 'passport',    emoji: '📄', name: 'דרכון' },
    { id: 'insurance',   emoji: '📋', name: 'ביטוח נסיעות' },
    { id: 'tickets',     emoji: '✈️', name: 'כרטיסי טיסה' },
  ],
  electronics: [
    { id: 'charger',     emoji: '🔌', name: 'מטען' },
    { id: 'headphones',  emoji: '🎧', name: 'אוזניות' },
    { id: 'tablet',      emoji: '📱', name: 'טאבלט' },
    { id: 'camera',      emoji: '📷', name: 'מצלמה' },
    { id: 'powerbank',   emoji: '🔋', name: 'סוללת גיבוי' },
  ],
  baby: [
    { id: 'bottles',     emoji: '🍼', name: 'בקבוקים' },
    { id: 'pacifiers',   emoji: '🍭', name: 'מוצצים' },
    { id: 'diapers',     emoji: '🧷', name: 'חיתולים' },
    { id: 'babycream',   emoji: '🧴', name: 'קרם תינוק' },
    { id: 'babytoy',     emoji: '🧸', name: 'צעצוע מוכר' },
    { id: 'babyfood',    emoji: '🍶', name: 'אוכל לתינוק' },
    { id: 'wipes',       emoji: '🧻', name: 'מגבונים' },
    { id: 'babyblanket', emoji: '🛏️', name: 'שמיכת תינוק' },
  ],
  misc: [
    { id: 'sunglasses',  emoji: '🕶️', name: 'משקפי שמש' },
    { id: 'hat',         emoji: '🧢', name: 'כובע' },
    { id: 'waterbottle', emoji: '💧', name: 'בקבוק מים' },
    { id: 'snacks',      emoji: '🍪', name: 'חטיפים' },
    { id: 'book',        emoji: '📚', name: 'ספר' },
    { id: 'backpack',    emoji: '🎒', name: 'תיק יום' },
  ],
};

export const CAT_LABELS: Record<string, string> = {
  toiletries:  '🧴 טואלטיקה',
  health:      '💊 בריאות',
  documents:   '📄 מסמכים',
  electronics: '📱 אלקטרוניקה',
  baby:        '👶 תינוק',
  misc:        '🎒 שונות',
};

export const AUTO_ITEMS: Record<string, string[]> = {
  baby:  ['bottles', 'pacifiers', 'diapers', 'babycream', 'babytoy', 'thermometer', 'wipes'],
  child: ['toothbrush', 'sunscreen', 'headphones', 'tablet', 'hat', 'sunglasses'],
  adult: ['toothbrush', 'passport'],
};

export const DEFAULT_MULTI: Record<string, number> = {
  adult: 1.5,
  child: 2,
  baby:  3,
};

export const SHARED_LIB: Omit<SharedLibItem, 'sel'>[] = [
  { id: 'speaker',      emoji: '🔊', name: 'רמקול',            aud: 'all' },
  { id: 'beach_towel',  emoji: '🏖️', name: 'מגבת חוף',         aud: 'all' },
  { id: 'sunscreen_s',  emoji: '🧴', name: 'קרם הגנה (גדול)',   aud: 'all' },
  { id: 'first_aid',    emoji: '🩺', name: 'ערכת עזרה ראשונה', aud: 'all' },
  { id: 'cards',        emoji: '🎲', name: 'משחק קלפים',       aud: 'all' },
  { id: 'umbrella',     emoji: '☂️', name: 'מטריה',            aud: 'all' },
  { id: 'snorkeling',   emoji: '🤿', name: 'ציוד שנורקל',      aud: 'adult' },
  { id: 'beach_ball',   emoji: '⚽', name: 'כדור חוף',          aud: 'child' },
  { id: 'floatie',      emoji: '🏊', name: 'מצוף לילדים',      aud: 'child' },
  { id: 'games',        emoji: '🎮', name: 'משחקי נסיעה',      aud: 'child' },
  { id: 'carrier',      emoji: '👶', name: 'מנשא תינוק',       aud: 'baby' },
  { id: 'stroller',     emoji: '🛒', name: 'עגלת תינוק',       aud: 'baby' },
];

export const EMOJIS: Record<string, { label: string; list: string[] }> = {
  people:  { label: 'אנשים ומשפחה', list: ['👨','👩','🧔','👧','👦','👶','🧒','👴','👵','🧑','🧕','👱','🧑‍🦱','🧑‍🦰'] },
  animals: { label: 'חיות חמודות',  list: ['🐶','🐱','🐻','🐼','🦁','🐯','🦊','🐒','🐞','🐰','🐨','🐸','🦄','🐧','🦋','🐙'] },
  faces:   { label: 'פרצופים',      list: ['😎','🤩','😍','🥳','😴','🤓','😈','🤠','👻','🤖','🧙','🦸','🧜','🧚'] },
};

export const W_LABELS: Record<string, string> = {
  hot:   'חם וצחיח',
  mild:  'נעים ומתון',
  cold:  'קר',
  rainy: 'גשום',
};

export const A_LABELS: Record<string, string> = {
  beach:    '🏖️ חוף',
  hiking:   '🏃 טיולים',
  city:     '🏙️ עיר',
  business: '💼 עסקים',
  ski:      '⛷️ סקי',
  culture:  '🎭 תרבות',
  food:     '🍽️ אוכל',
};

export const TYPE_LABELS: Record<string, string> = {
  adult: '👨 מבוגר',
  child: '🧒 ילד',
  baby:  '👶 תינוק',
};
