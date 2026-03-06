'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { calcProgress } from '@/lib/logic';
import { W_LABELS, A_LABELS } from '@/lib/constants';

export default function DonePage() {
  const router       = useRouter();
  const activeTrip   = useStore(s => s.activeTrip);
  const tripFinished = useStore(s => s.tripFinished);
  const profiles     = useStore(s => s.profiles);
  const startNewTrip = useStore(s => s.startNewTrip);

  useEffect(() => { if (!tripFinished) router.push('/home'); }, [tripFinished]);

  if (!tripFinished || !activeTrip) return null;

  const { dest, dur, weather, acts, travelers, packing } = activeTrip;
  const { done, total } = calcProgress(packing);

  const wLabel = W_LABELS[weather || ''] || '';
  const aStr   = acts.slice(0, 2).map(a => A_LABELS[a]).join(' • ');

  function handleNewTrip() {
    startNewTrip();
    router.replace('/planner');
  }

  function handleBackToPacking() {
    useStore.setState({ tripFinished: false });
    router.replace('/packing');
  }

  return (
    <div className="min-h-[100dvh] flex items-start justify-center p-5">
      <div className="bg-white rounded-3xl p-7 max-w-[480px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] my-auto">
        {/* Done hero */}
        <div className="text-center pt-1.5 pb-5">
          <span className="text-[62px] mb-3 block">🎉</span>
          <div className="text-[23px] font-extrabold text-[#1a1a2e] mb-1.5">הכל ארוז — טיסה טובה!</div>
          <div className="text-sm text-[#6b6b6b] leading-relaxed">ארזת {done} מתוך {total} פריטים.</div>
        </div>

        {/* Summary box */}
        <div className="bg-[#f9f7ff] rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[28px]">✈️</span>
            <div className="flex-1">
              <div className="text-[15px] font-extrabold text-[#1a1a2e]">{dest || (dur + ' ימים')}</div>
              <div className="text-xs text-[#6b6b6b] mt-0.5">{dur} ימים{wLabel ? ' • ' + wLabel : ''}{aStr ? ' • ' + aStr : ''}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="text-center bg-white rounded-[11px] py-2.5 px-1">
              <div className="text-xl font-extrabold text-[#667eea]">{done}</div>
              <div className="text-[11px] text-[#767676] mt-0.5 font-semibold">פריטים ארוזים</div>
            </div>
            <div className="text-center bg-white rounded-[11px] py-2.5 px-1">
              <div className="text-xl font-extrabold text-[#667eea]">{travelers.length}</div>
              <div className="text-[11px] text-[#767676] mt-0.5 font-semibold">נוסעים</div>
            </div>
            <div className="text-center bg-white rounded-[11px] py-2.5 px-1">
              <div className="text-xl font-extrabold text-[#667eea]">{dur}</div>
              <div className="text-[11px] text-[#767676] mt-0.5 font-semibold">ימים</div>
            </div>
          </div>
        </div>

        {/* Travelers */}
        <div className="flex gap-2 justify-center mb-5">
          {travelers.map(id => {
            const p = profiles.find(x => x.id === id);
            if (!p) return null;
            return (
              <div key={id} className="flex flex-col items-center gap-0">
                <div className="w-11 h-11 bg-[#f3f0ff] rounded-full flex items-center justify-center text-[21px] border-2 border-[#e8e4ff]">{p.emoji}</div>
                <div className="text-[11px] text-[#6b6b6b] font-semibold mt-0.5">{p.name}</div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button onClick={() => window.print()} className="w-full py-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-[14px] text-base font-bold cursor-pointer">
            🖨️ הדפס רשימה סופית
          </button>
          <button onClick={handleNewTrip} className="w-full py-3 bg-[#f3f0ff] text-[#667eea] border-none rounded-[14px] text-[15px] font-bold cursor-pointer">
            תכנן טיול חדש ✈️
          </button>
          <button onClick={handleBackToPacking} className="w-full py-3 bg-transparent text-[#767676] border-2 border-[#f0f0f0] rounded-[14px] text-sm font-semibold cursor-pointer">
            חזור לרשימה
          </button>
        </div>
      </div>
    </div>
  );
}
