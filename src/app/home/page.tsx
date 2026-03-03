'use client';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { W_LABELS, A_LABELS } from '@/lib/constants';

export default function HomePage() {
  const router         = useRouter();
  const profiles       = useStore(s => s.profiles);
  const shared         = useStore(s => s.shared);
  const completedTrips = useStore(s => s.completedTrips);
  const duplicateTrip  = useStore(s => s.duplicateTrip);

  const selSharedCount = shared.filter(i => i.sel).length;

  function handleDuplicate(id: string) {
    duplicateTrip(id);
    router.push('/planner');
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Header */}
      <div className="pt-[52px] px-5 pb-0 flex items-center justify-between">
        <div className="text-white text-[18px] font-extrabold">🧳 PackSmart</div>
        <div className="flex gap-2 items-center">
          <div
            onClick={() => router.push('/profiles')}
            className="flex items-center cursor-pointer"
            title="ערוך פרופילים"
          >
            {profiles.slice(0, 4).map(p => (
              <div key={p.id} className="w-[34px] h-[34px] bg-white/25 rounded-full flex items-center justify-center text-[15px] border-2 border-white/50 -mr-2 first:mr-0 shrink-0 hover:-translate-y-0.5 transition-transform">{p.emoji}</div>
            ))}
            <div className="w-[34px] h-[34px] bg-white/15 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white -mr-2 border-2 border-white/50 shrink-0">✏️</div>
          </div>
          <button
            onClick={() => { if (confirm('לאפס הכל ולהתחיל מחדש?')) useStore.getState().resetState(); }}
            className="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center text-base cursor-pointer border-none text-white shrink-0"
          >🔄</button>
        </div>
      </div>

      {/* Hero */}
      <div className="px-5 pt-6 pb-7">
        <div className="text-white/80 text-sm mb-1">שלום, משפחה 👋</div>
        <div className="text-white text-[30px] font-extrabold leading-[1.15]">לאן נוסעים<br />הפעם?</div>
      </div>

      {/* White card */}
      <div className="bg-white rounded-[28px_28px_0_0] px-5 pt-6 pb-10 min-h-[58vh]">
        {/* Plan CTA */}
        <div
          onClick={() => router.push('/planner')}
          className="flex items-center gap-3.5 p-5 px-[22px] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-[18px] cursor-pointer mb-3.5 shadow-[0_8px_24px_rgba(102,126,234,0.35)] hover:-translate-y-0.5 transition-transform"
        >
          <span className="text-[34px]">✈️</span>
          <div className="flex-1">
            <div className="text-[18px] font-extrabold text-white">תכנן טיול חדש</div>
            <div className="text-[13px] text-white/75 mt-0.5">רשימת אריזה מותאמת בשניות</div>
          </div>
          <span className="text-[18px] text-white/60">←</span>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div onClick={() => router.push('/profiles')} className="flex items-center gap-2.5 p-3 px-3.5 bg-[#f9f7ff] rounded-[14px] cursor-pointer hover:bg-[#f0ecff] transition-colors">
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            <div>
              <div className="text-[13px] font-bold text-[#333]">פרופילים</div>
              <div className="text-[11px] text-[#aaa] mt-0.5">{profiles.length} בני משפחה</div>
            </div>
          </div>
          <div onClick={() => { useStore.getState().setUI({ callerRoute: '/home' }); router.push('/shared-bag'); }} className="flex items-center gap-2.5 p-3 px-3.5 bg-[#f9f7ff] rounded-[14px] cursor-pointer hover:bg-[#f0ecff] transition-colors">
            <span className="text-xl">🎒</span>
            <div>
              <div className="text-[13px] font-bold text-[#333]">תיק משותף</div>
              <div className="text-[11px] text-[#aaa] mt-0.5">{selSharedCount} פריטים</div>
            </div>
          </div>
        </div>

        {/* Past trips */}
        {completedTrips.length > 0 && (
          <div>
            <div className="text-[11px] font-extrabold text-[#aaa] mb-2.5 tracking-[0.5px] uppercase">טיולים קודמים</div>
            {[...completedTrips].reverse().map(t => {
              const name    = t.dest || (t.dur + ' ימים');
              const wLabel  = W_LABELS[t.weather || ''] || '';
              const acts    = t.acts.slice(0, 2).map(a => A_LABELS[a]).join(' ');
              const members = t.travelers.map(id => profiles.find(p => p.id === id)?.emoji || '').join('');
              return (
                <div key={t.id} onClick={() => handleDuplicate(t.id)} className="flex items-center gap-3 p-3 px-3.5 border-2 border-[#f0f0f0] rounded-[15px] cursor-pointer mb-2 hover:border-[#e0d8ff] transition-colors">
                  <div className="text-2xl w-11 h-11 bg-[#f3f0ff] rounded-xl flex items-center justify-center shrink-0">✈️</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#1a1a2e]">{name}</div>
                    <div className="text-xs text-[#888] mt-0.5">{t.dur} ימים{wLabel ? ' • ' + wLabel : ''}{acts ? ' • ' + acts : ''}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-base tracking-[-3px] mb-1">{members}</div>
                    <span className="inline-block text-[11px] text-[#a78bfa] font-bold bg-[#f3f0ff] px-2 py-0.5 rounded-full">שכפל</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
