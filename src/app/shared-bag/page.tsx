'use client';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

type AudFilter = 'all' | 'adult' | 'child' | 'baby';

const AUD_LABEL: Record<string, string> = {
  all:   '🌍 כולם',
  adult: '👨 מבוגרים',
  child: '🧒 ילדים',
  baby:  '👶 תינוקות',
};

export default function SharedBagPage() {
  const router       = useRouter();
  const shared       = useStore(s => s.shared);
  const toggleShared = useStore(s => s.toggleShared);
  const ui           = useStore(s => s.ui);
  const setUI        = useStore(s => s.setUI);

  const filter = ui.sharedFilter;
  const filtered = filter === 'all'
    ? shared
    : shared.filter(i => i.aud === filter || i.aud === 'all');

  function handleSave() {
    router.push(ui.callerRoute === '/onboard' ? '/planner' : (ui.callerRoute || '/home'));
  }

  function handleBack() {
    router.push(ui.callerRoute || '/home');
  }

  return (
    <div className="min-h-[100dvh] flex items-start justify-center p-5">
      <div className="bg-white rounded-3xl p-7 max-w-[480px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] my-auto">
        {/* Progress dots (only during onboarding) */}
        {ui.callerRoute === '/onboard' && (
          <div className="flex gap-1.5 mb-5">
            <div className="h-1.5 flex-1 rounded-full bg-[#667eea]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#667eea]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#e0e0e0]" />
          </div>
        )}

        <button onClick={handleBack} className="inline-flex items-center gap-1.5 text-[#a78bfa] text-sm font-bold cursor-pointer bg-none border-none p-0 mb-4">← חזור</button>

        <h1 className="text-[21px] font-extrabold text-[#1a1a2e] mb-1">🎒 התיק המשותף</h1>
        <p className="text-sm text-[#888] mb-5">פריטים שכולם משתמשים בהם</p>

        {/* Audience tabs */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {(['all', 'adult', 'child', 'baby'] as AudFilter[]).map(aud => (
            <div
              key={aud}
              onClick={() => setUI({ sharedFilter: aud })}
              className={`py-1 px-3 rounded-full border-2 text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
                filter === aud
                  ? 'bg-[#f0a050] border-[#f0a050] text-white'
                  : 'border-[#ffd6b0] text-[#f0a050]'
              }`}
            >{AUD_LABEL[aud]}</div>
          ))}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => toggleShared(item.id)}
              className={`flex items-start gap-1.5 py-2 px-2.5 border-2 rounded-[11px] cursor-pointer transition-all hover:border-[#ffb347] ${
                item.sel ? 'border-[#f0a050] bg-[#fff9f5]' : 'border-[#ffd6b0]'
              }`}
            >
              <span className="text-[17px] shrink-0">{item.emoji}</span>
              <div className="flex-1">
                <div className="text-xs font-semibold text-[#333]">{item.name}</div>
                <span className="text-[10px] text-[#f0a050] bg-[#fff0e0] px-1 py-0.5 rounded-full font-bold mt-0.5 inline-block">{AUD_LABEL[item.aud]}</span>
              </div>
              {item.sel && <span className="text-[#f0a050] text-[13px]">✓</span>}
            </div>
          ))}
        </div>

        <div className="h-px bg-[#f0f0f0] my-4" />

        <button onClick={handleSave} className="w-full py-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-[14px] text-base font-bold cursor-pointer mb-2.5">
          שמור →
        </button>
      </div>
    </div>
  );
}
