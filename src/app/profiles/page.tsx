'use client';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { TYPE_LABELS } from '@/lib/constants';

export default function ProfilesPage() {
  const router        = useRouter();
  const profiles      = useStore(s => s.profiles);
  const shared        = useStore(s => s.shared);
  const deleteProfile = useStore(s => s.deleteProfile);

  const selShared = shared.filter(i => i.sel);
  const sharedPreview = selShared.length
    ? selShared.slice(0, 3).map(i => i.emoji + ' ' + i.name).join(', ')
    : 'לחץ להגדרה';

  return (
    <div className="min-h-[100dvh] flex items-start justify-center p-5">
      <div className="bg-white rounded-3xl p-7 max-w-[480px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] my-auto">
        <button onClick={() => router.push('/home')} className="inline-flex items-center gap-1.5 text-[#a78bfa] text-sm font-bold cursor-pointer bg-none border-none p-0 mb-4">← חזור</button>

        <h1 className="text-[21px] font-extrabold text-[#1a1a2e] mb-1">👨‍👩‍👧‍👦 בני המשפחה</h1>
        <p className="text-sm text-[#888] mb-5">ניהול פרופילים</p>

        {profiles.length === 0 ? (
          <div className="text-center py-7 px-4">
            <div className="text-[42px] mb-2.5">👨‍👩‍👧‍👦</div>
            <div className="text-sm font-semibold text-[#bbb]">אין פרופילים עדיין</div>
          </div>
        ) : (
          profiles.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 px-[15px] border-2 border-[#e8e4ff] rounded-2xl mb-2.5 hover:border-[#a78bfa] hover:bg-[#faf9ff] transition-all">
              <div className="text-[30px] w-[52px] h-[52px] bg-[#f3f0ff] rounded-full flex items-center justify-center shrink-0">{p.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-extrabold text-[#1a1a2e]">{p.name}</div>
                <div className="text-xs text-[#a78bfa] font-semibold mt-0.5">{TYPE_LABELS[p.type]}</div>
                <div className="inline-flex items-center gap-1 bg-[#f3f0ff] text-[#667eea] text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5">
                  👕 {p.multi} חליפות/יום
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { useStore.getState().resetFormForEdit(p.id); useStore.getState().setUI({ callerRoute: '/profiles' }); router.push('/add-member'); }}
                  className="w-[30px] h-[30px] rounded-lg bg-[#f3f0ff] flex items-center justify-center text-sm cursor-pointer hover:bg-[#ede9fe] transition-colors border-none"
                >✏️</button>
                <button
                  onClick={() => deleteProfile(p.id)}
                  className="w-[30px] h-[30px] rounded-lg bg-[#f3f0ff] flex items-center justify-center text-sm cursor-pointer hover:bg-[#ffe4e4] transition-colors border-none"
                >🗑️</button>
              </div>
            </div>
          ))
        )}

        {/* Add member row */}
        <div
          onClick={() => { useStore.getState().resetFormForAdd(); useStore.getState().setUI({ callerRoute: '/profiles' }); router.push('/add-member'); }}
          className="flex items-center gap-3.5 p-3.5 px-4 border-2 border-dashed border-[#c4b5fd] rounded-[18px] mb-2.5 cursor-pointer hover:border-[#667eea] hover:bg-[#f9f7ff] transition-all"
        >
          <div className="text-[22px] w-[52px] h-[52px] bg-[#f3f0ff] rounded-full flex items-center justify-center shrink-0">➕</div>
          <div>
            <div className="text-[15px] font-bold text-[#667eea]">הוסף בן/בת משפחה</div>
            <div className="text-xs text-[#aaa] mt-0.5">הוספת פרופיל חדש</div>
          </div>
        </div>

        <div className="h-px bg-[#f0f0f0] my-4" />

        {/* Shared bag card */}
        <div
          onClick={() => { useStore.getState().setUI({ callerRoute: '/profiles' }); router.push('/shared-bag'); }}
          className="flex items-center gap-3 p-3 px-[15px] border-2 border-[#ffd6b0] rounded-2xl cursor-pointer bg-[#fff9f5] hover:border-[#ffb347] transition-all"
        >
          <div className="text-[30px] w-[52px] h-[52px] bg-[#fff0e0] rounded-full flex items-center justify-center shrink-0">🎒</div>
          <div className="flex-1">
            <div className="text-base font-extrabold text-[#1a1a2e]">התיק המשותף</div>
            <div className="text-xs text-[#f0a050] font-semibold mt-0.5">🌍 פריטים לכולם</div>
            <div className="text-xs text-[#aaa] mt-0.5 overflow-hidden whitespace-nowrap text-ellipsis">{sharedPreview}</div>
          </div>
          <div className="w-[30px] h-[30px] rounded-lg bg-[#f3f0ff] flex items-center justify-center text-sm">✏️</div>
        </div>
      </div>
    </div>
  );
}
