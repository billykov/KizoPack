'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

const WEATHER_OPTS = [
  { key: 'hot',   em: '☀️', label: 'חם וצחיח' },
  { key: 'mild',  em: '🌤️', label: 'נעים ומתון' },
  { key: 'cold',  em: '❄️', label: 'קר' },
  { key: 'rainy', em: '🌧️', label: 'גשום' },
];

const ACT_OPTS = [
  { key: 'beach',    label: '🏖️ חוף' },
  { key: 'hiking',   label: '🏃 טיולים' },
  { key: 'city',     label: '🏙️ עיר' },
  { key: 'business', label: '💼 עסקים' },
  { key: 'ski',      label: '⛷️ סקי' },
  { key: 'culture',  label: '🎭 תרבות' },
  { key: 'food',     label: '🍽️ אוכל' },
];

export default function PlannerPage() {
  const router       = useRouter();
  const profiles     = useStore(s => s.profiles);
  const generateTrip = useStore(s => s.generateTrip);
  const ui           = useStore(s => s.ui);
  const setUI        = useStore(s => s.setUI);

  const [dest, setDest] = useState('');

  // Default all travelers selected
  useEffect(() => {
    if (ui.planTravelers.length === 0) {
      setUI({ planTravelers: profiles.map(p => p.id) });
    }
  }, []);

  function changeDur(d: number) {
    const v = ui.planDur + d;
    if (v < 1 || v > 30) return;
    setUI({ planDur: v });
  }

  function toggleWeather(w: string) {
    setUI({ planWeather: ui.planWeather === w ? null : w });
  }

  function toggleAct(a: string) {
    const acts = ui.planActs;
    setUI({ planActs: acts.includes(a) ? acts.filter(x => x !== a) : [...acts, a] });
  }

  function toggleTraveler(id: string) {
    const t = ui.planTravelers;
    setUI({ planTravelers: t.includes(id) ? t.filter(x => x !== id) : [...t, id] });
  }

  function handleGenerate() {
    if (!ui.planTravelers.length) return;
    generateTrip(dest.trim());
    router.push('/packing');
  }

  return (
    <div className="min-h-[100dvh] flex items-start justify-center p-5">
      <div className="bg-white rounded-3xl p-7 max-w-[480px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] my-auto">
        {/* Progress */}
        <div className="flex gap-1.5 mb-5">
          <div className="h-1.5 flex-1 rounded-full bg-[#667eea]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#667eea]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#667eea]" />
        </div>

        <button onClick={() => router.push('/home')} className="inline-flex items-center gap-1.5 text-[#a78bfa] text-sm font-bold cursor-pointer bg-none border-none p-0 mb-4">→ חזור</button>

        <h1 className="text-[21px] font-extrabold text-[#1a1a2e] mb-1">✈️ תכנן טיול</h1>
        <p className="text-sm text-[#6b6b6b] mb-5">ספר לי קצת ואני אבנה רשימה מותאמת</p>

        {/* Destination */}
        <div className="mb-4">
          <label className="block text-[13px] font-bold text-[#555] mb-1.5">🌍 יעד (אופציונלי)</label>
          <input
            type="text"
            value={dest}
            onChange={e => setDest(e.target.value)}
            placeholder="למשל: פריז, ניו יורק, אילת..."
            className="w-full py-3 px-[15px] border-2 border-[#e8e4ff] rounded-xl text-base text-[#1a1a2e] outline-none focus:border-[#667eea] transition-colors font-[inherit]"
          />
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="block text-[13px] font-bold text-[#555] mb-1.5">📅 משך הטיול (ימים)</label>
          <div className="flex items-center gap-3.5 bg-[#f9f7ff] rounded-[14px] p-3 px-4">
            <span className="flex-1 text-[15px] text-[#333] font-semibold">מספר ימים</span>
            <div className="flex items-center gap-3">
              <button onClick={() => changeDur(-1)} className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none text-[19px] cursor-pointer flex items-center justify-center font-[inherit]">−</button>
              <span className="text-[22px] font-extrabold text-[#1a1a2e] min-w-[28px] text-center">{ui.planDur}</span>
              <button onClick={() => changeDur(1)} className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none text-[19px] cursor-pointer flex items-center justify-center font-[inherit]">+</button>
            </div>
          </div>
        </div>

        {/* Weather */}
        <div className="mb-4">
          <label className="block text-[13px] font-bold text-[#555] mb-1.5">🌡️ מזג אוויר</label>
          <div className="grid grid-cols-2 gap-2.5">
            {WEATHER_OPTS.map(w => (
              <div
                key={w.key}
                onClick={() => toggleWeather(w.key)}
                className={`border-2 rounded-[14px] p-3 text-center cursor-pointer transition-all hover:border-[#a78bfa] ${
                  ui.planWeather === w.key ? 'border-[#667eea] bg-[#f3f0ff]' : 'border-[#e8e4ff]'
                }`}
              >
                <span className="text-[26px] block mb-1">{w.em}</span>
                <span className="text-[13px] font-semibold text-[#333]">{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="mb-4">
          <label className="block text-[13px] font-bold text-[#555] mb-1.5">🎯 פעילויות (ניתן לבחור כמה)</label>
          <div className="flex flex-wrap gap-1.5">
            {ACT_OPTS.map(a => (
              <div
                key={a.key}
                role="button"
                tabIndex={0}
                onClick={() => toggleAct(a.key)}
                onKeyDown={(e) => e.key === 'Enter' && toggleAct(a.key)}
                className={`flex items-center gap-1 py-[10px] px-3 border-2 rounded-full cursor-pointer text-[13px] font-semibold transition-all ${
                  ui.planActs.includes(a.key) ? 'border-[#667eea] bg-[#f3f0ff] text-[#667eea]' : 'border-[#e8e4ff] text-[#555]'
                }`}
              >{a.label}</div>
            ))}
          </div>
        </div>

        {/* Travelers */}
        <div className="mb-5">
          <label className="block text-[13px] font-bold text-[#555] mb-1.5">👨‍👩‍👧‍👦 מי נוסע?</label>
          <div className="flex flex-wrap gap-2.5">
            {profiles.map(p => (
              <div
                key={p.id}
                onClick={() => toggleTraveler(p.id)}
                className={`flex flex-col items-center gap-1 cursor-pointer ${ui.planTravelers.includes(p.id) ? 'opacity-100' : 'opacity-50'}`}
              >
                <div className={`w-[54px] h-[54px] rounded-full bg-[#f3f0ff] border-3 flex items-center justify-center text-[25px] transition-all ${
                  ui.planTravelers.includes(p.id) ? 'border-[#667eea] bg-[#ede9fe]' : 'border-[#e8e4ff]'
                }`}
                  style={{ borderWidth: 3 }}
                >{p.emoji}</div>
                <span className={`text-xs font-semibold ${ui.planTravelers.includes(p.id) ? 'text-[#667eea]' : 'text-[#555]'}`}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={ui.planTravelers.length === 0}
          className="w-full py-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-[14px] text-base font-bold cursor-pointer transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
        >
          צור רשימת אריזה! 🧳
        </button>
      </div>
    </div>
  );
}
