import { query } from "@anthropic-ai/claude-agent-sdk";

const PORT = process.argv[2] ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;
const REPORT_FILE = `ux-review-${new Date().toISOString().slice(0, 10)}.md`;

// ---------------------------------------------------------------------------
// Mock state payloads — match the kizopack_v1 zustand persist format
// { state: PersistedSlice, version: 0 }
// ---------------------------------------------------------------------------

const MOCK_PROFILES = [
  {
    id: "p1",
    emoji: "👨",
    name: "אבא",
    type: "adult",
    multi: 1.5,
    items: ["toothbrush", "passport", "charger"],
    customItems: [],
  },
  {
    id: "p2",
    emoji: "👩",
    name: "אמא",
    type: "adult",
    multi: 1.5,
    items: ["toothbrush", "passport", "makeup"],
    customItems: [],
  },
  {
    id: "p3",
    emoji: "🧒",
    name: "ילד",
    type: "child",
    multi: 2,
    items: ["toothbrush", "sunscreen", "headphones", "tablet"],
    customItems: [],
  },
];

const MOCK_SHARED = [
  { id: "speaker", emoji: "🔊", name: "רמקול", aud: "all", sel: true },
  { id: "beach_towel", emoji: "🏖️", name: "מגבת חוף", aud: "all", sel: true },
  {
    id: "sunscreen_s",
    emoji: "🧴",
    name: "קרם הגנה (גדול)",
    aud: "all",
    sel: false,
  },
  {
    id: "first_aid",
    emoji: "🩺",
    name: "ערכת עזרה ראשונה",
    aud: "all",
    sel: false,
  },
  { id: "cards", emoji: "🎲", name: "משחק קלפים", aud: "all", sel: false },
  { id: "umbrella", emoji: "☂️", name: "מטריה", aud: "all", sel: false },
  {
    id: "snorkeling",
    emoji: "🤿",
    name: "ציוד שנורקל",
    aud: "adult",
    sel: false,
  },
  { id: "beach_ball", emoji: "⚽", name: "כדור חוף", aud: "child", sel: true },
  {
    id: "floatie",
    emoji: "🏊",
    name: "מצוף לילדים",
    aud: "child",
    sel: false,
  },
  {
    id: "games",
    emoji: "🎮",
    name: "משחקי נסיעה",
    aud: "child",
    sel: false,
  },
  { id: "carrier", emoji: "👶", name: "מנשא תינוק", aud: "baby", sel: false },
  { id: "stroller", emoji: "🛒", name: "עגלת תינוק", aud: "baby", sel: false },
];

const MOCK_TRIP = {
  dest: "ברצלונה",
  dur: 7,
  weather: "hot",
  acts: ["beach", "city"],
  travelers: ["p1", "p2", "p3"],
  packing: {
    p1: {
      cats: [
        {
          id: "toiletries",
          name: "🧴 טואלטיקה",
          em: "🧴",
          items: [
            {
              name: "מברשת שיניים",
              emoji: "🪥",
              qty: 1,
              done: true,
              custom: false,
            },
            {
              name: "קרם הגנה",
              emoji: "🧴",
              qty: 1,
              done: false,
              custom: false,
            },
          ],
        },
        {
          id: "documents",
          name: "📄 מסמכים",
          em: "📄",
          items: [
            {
              name: "דרכון",
              emoji: "📄",
              qty: 1,
              done: false,
              custom: false,
            },
            {
              name: "כרטיסי טיסה",
              emoji: "✈️",
              qty: 1,
              done: false,
              custom: false,
            },
          ],
        },
        {
          id: "electronics",
          name: "📱 אלקטרוניקה",
          em: "📱",
          items: [
            {
              name: "מטען",
              emoji: "🔌",
              qty: 1,
              done: false,
              custom: false,
            },
          ],
        },
      ],
    },
    p2: {
      cats: [
        {
          id: "toiletries",
          name: "🧴 טואלטיקה",
          em: "🧴",
          items: [
            {
              name: "מברשת שיניים",
              emoji: "🪥",
              qty: 1,
              done: false,
              custom: false,
            },
            {
              name: "איפור",
              emoji: "💄",
              qty: null,
              done: false,
              custom: false,
            },
            {
              name: "קרם לחות",
              emoji: "💧",
              qty: 1,
              done: true,
              custom: false,
            },
          ],
        },
        {
          id: "documents",
          name: "📄 מסמכים",
          em: "📄",
          items: [
            {
              name: "דרכון",
              emoji: "📄",
              qty: 1,
              done: false,
              custom: false,
            },
          ],
        },
      ],
    },
    p3: {
      cats: [
        {
          id: "electronics",
          name: "📱 אלקטרוניקה",
          em: "📱",
          items: [
            {
              name: "אוזניות",
              emoji: "🎧",
              qty: 1,
              done: false,
              custom: false,
            },
            {
              name: "טאבלט",
              emoji: "📱",
              qty: 1,
              done: true,
              custom: false,
            },
          ],
        },
        {
          id: "misc",
          name: "🎒 שונות",
          em: "🎒",
          items: [
            {
              name: "קרם הגנה",
              emoji: "🧴",
              qty: 1,
              done: false,
              custom: false,
            },
            {
              name: "כובע",
              emoji: "🧢",
              qty: 1,
              done: false,
              custom: false,
            },
          ],
        },
      ],
    },
  },
};

const MOCK_COMPLETED = {
  id: "1700000000000",
  dest: "פריז",
  dur: 5,
  weather: "mild",
  acts: ["city", "culture", "food"],
  travelers: ["p1", "p2"],
  totalItems: 24,
  completedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
};

// Build the four state payloads
const EMPTY_STATE = JSON.stringify({
  state: {
    profiles: [],
    shared: MOCK_SHARED,
    activeTrip: null,
    tripFinished: false,
    completedTrips: [],
  },
  version: 0,
});

const STATE_WITH_PROFILES = JSON.stringify({
  state: {
    profiles: MOCK_PROFILES,
    shared: MOCK_SHARED,
    activeTrip: null,
    tripFinished: false,
    completedTrips: [],
  },
  version: 0,
});

const STATE_WITH_TRIP = JSON.stringify({
  state: {
    profiles: MOCK_PROFILES,
    shared: MOCK_SHARED,
    activeTrip: MOCK_TRIP,
    tripFinished: false,
    completedTrips: [],
  },
  version: 0,
});

const STATE_DONE = JSON.stringify({
  state: {
    profiles: MOCK_PROFILES,
    shared: MOCK_SHARED,
    activeTrip: null,
    tripFinished: true,
    completedTrips: [MOCK_COMPLETED],
  },
  version: 0,
});

// ---------------------------------------------------------------------------
// Agent prompts
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a senior UX designer specializing in mobile-first PWAs and Hebrew/Arabic RTL interfaces. You evaluate UX across: visual hierarchy, Hebrew typography legibility, RTL layout correctness, color contrast (WCAG AA), touch target sizes (≥44px), navigation clarity, information density, consistency, empty states, and overall usability.

When analyzing screenshots, pay special attention to:
- Text direction and alignment (RTL)
- Hebrew font rendering and readability
- Element positioning that may feel reversed for LTR designers but should feel natural to Hebrew readers
- Touch target accessibility on mobile
- Color contrast ratios
- Consistent spacing and visual rhythm`;

const PROMPT = `Conduct a UX review of the KizoPack app at ${BASE_URL}.
App context: Hebrew RTL PWA for family trip packing management. The app helps Israeli families organize packing lists for trips, with profiles per traveler, a shared bag, and a trip planner.

For each screen below, perform these steps in order:
1. Set viewport to mobile: 390×844 (iPhone 14 size)
2. Navigate to the URL
3. Inject the required localStorage state by running this JS in the browser:
   localStorage.setItem('kizopack_v1', '<STATE_JSON>');
4. Reload the page so the app reads the injected state
5. Take a full-page screenshot
6. Analyze the screenshot for UX issues (RTL layout, Hebrew typography, touch targets, contrast, hierarchy, usability)

Screens to review:

1. **Onboarding** — URL: ${BASE_URL}/onboard
   State: ${EMPTY_STATE}

2. **Home** — URL: ${BASE_URL}/home
   State: ${STATE_WITH_PROFILES}

3. **Profiles** — URL: ${BASE_URL}/profiles
   State: ${STATE_WITH_PROFILES}

4. **Add Member** — URL: ${BASE_URL}/add-member
   State: ${EMPTY_STATE}

5. **Planner** — URL: ${BASE_URL}/planner
   State: ${STATE_WITH_PROFILES}

6. **Packing** — URL: ${BASE_URL}/packing
   State: ${STATE_WITH_TRIP}

7. **Shared Bag** — URL: ${BASE_URL}/shared-bag
   State: ${STATE_WITH_PROFILES}

8. **Done** — URL: ${BASE_URL}/done
   State: ${STATE_DONE}

After reviewing all 8 screens, write a comprehensive UX report to the file: ${REPORT_FILE}

The report must follow this structure exactly:

# KizoPack UX Review — ${new Date().toLocaleDateString("he-IL")}

## Executive Summary
(2-3 paragraph overview of overall UX quality, key strengths, and most critical issues)

## Screen-by-Screen Analysis

### 1. Onboarding (/onboard)
**Overall Rating:** X/10
**Observations:**
- ...
**Issues Found:**
- ...
**Suggestions:**
- ...

(repeat for each of the 8 screens)

## Cross-Cutting Issues
(Issues that appear across multiple screens — typography, color system, spacing, navigation, etc.)

## Prioritized Recommendations

### P0 — Critical (fix before launch)
- ...

### P1 — High (fix soon)
- ...

### P2 — Nice to Have (future improvements)
- ...`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nKizoPack UX Review Agent`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Report: ${REPORT_FILE}`);
  console.log(`\nStarting review (this may take several minutes)...\n`);

  let turnCount = 0;

  for await (const message of query({
    prompt: PROMPT,
    options: {
      model: "claude-opus-4-6",
      systemPrompt: SYSTEM_PROMPT,
      mcpServers: {
        playwright: { command: "npx", args: ["@playwright/mcp@latest"] },
      },
      allowedTools: ["Write"],
      maxTurns: 80,
    },
  })) {
    if (message.type === "assistant") {
      turnCount++;
      process.stdout.write(`\r[Turn ${turnCount}] Agent working...`);
    }
    if ("result" in message) {
      console.log(`\n\n✅ Review complete → ${REPORT_FILE}`);
    }
  }
}

main().catch((err) => {
  console.error("\n❌ Review failed:", err);
  process.exit(1);
});
