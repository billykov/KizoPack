'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { TYPE_LABELS } from '@/lib/constants';

export default function OnboardPage() {
  const router        = useRouter();
  const profiles      = useStore(s => s.profiles);
  const deleteProfile = useStore(s => s.deleteProfile);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleContinue() {
    if (profiles.length === 0) return;
    useStore.getState().setUI({ callerRoute: '/onboard' });
    router.push('/shared-bag');
  }

  function handleAddMember() {
    useStore.getState().resetFormForAdd();
    useStore.getState().setUI({ callerRoute: '/onboard' });
    router.push('/add-member');
  }

  const step1Done = profiles.length > 0;

  return (
    <div className="min-h-[100dvh] flex items-start justify-center p-5">
      <div className="bg-white rounded-3xl p-7 max-w-[480px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] my-auto">
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-5">
          <div className="h-1.5 flex-1 rounded-full bg-[#667eea]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#e0e0e0]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#e0e0e0]" />
        </div>

        <h1 className="text-[21px] font-extrabold text-[#1a1a2e] mb-1">👋 ברוך הבא לKizoPack!</h1>
        <p className="text-sm text-[#6b6b6b] mb-5">הוסף את בני המשפחה כדי להתחיל — רגע אחד ואתה מוכן</p>

        {/* Add member row */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleAddMember}
          onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
          className="flex items-center gap-3.5 p-3.5 px-4 border-2 border-dashed border-[#c4b5fd] rounded-[18px] mb-2.5 cursor-pointer hover:border-[#667eea] hover:bg-[#f9f7ff] transition-all"
        >
          <div className="text-[22px] w-[52px] h-[52px] bg-[#f3f0ff] rounded-full flex items-center justify-center shrink-0">➕</div>
          <div>
            <div className="text-[15px] font-bold text-[#667eea]">הוסף בן/בת משפחה</div>
            <div className="text-xs text-[#767676] mt-0.5">התחל עם עצמך</div>
          </div>
        </div>

        {/* Profile list */}
        {profiles.length === 0 ? (
          <div className="text-center py-7 px-4">
            <div className="text-[42px] mb-2.5">👨‍👩‍👧‍👦</div>
            <div className="text-sm font-semibold text-[#767676]">עדיין אין בני משפחה</div>
            <div className="text-xs text-[#767676] mt-1">הוסף לפחות אחד כדי להמשיך</div>
          </div>
        ) : (
          <div>
            {profiles.map(p => (
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
                  {deletingId === p.id ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); setDeletingId(null); }}
                        className="text-xs font-bold text-white bg-[#ff6b6b] px-2 py-1 rounded-lg border-none cursor-pointer"
                      >מחק</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                        className="text-xs font-bold text-[#6b6b6b] bg-[#f3f0ff] px-2 py-1 rounded-lg border-none cursor-pointer"
                      >ביטול</button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); useStore.getState().resetFormForEdit(p.id); useStore.getState().setUI({ callerRoute: '/onboard' }); router.push('/add-member'); }}
                        className="w-[44px] h-[44px] rounded-lg bg-[#f3f0ff] flex items-center justify-center text-sm cursor-pointer hover:bg-[#ede9fe] transition-colors border-none"
                      >✏️</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(p.id); }}
                        className="w-[44px] h-[44px] rounded-lg bg-[#f3f0ff] flex items-center justify-center text-sm cursor-pointer hover:bg-[#ffe4e4] transition-colors border-none"
                      >🗑️</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        <div className="flex flex-col gap-2 mb-5 mt-2">
          <div className={`flex items-center gap-3 p-3 px-3.5 border-2 rounded-[14px] ${step1Done ? 'border-[#bbf7d0] bg-[#f9fdf9]' : 'border-[#667eea] bg-[#f9f7ff]'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${step1Done ? 'bg-[#22c55e] text-white' : 'bg-[#667eea] text-white'}`}>
              {step1Done ? '✓' : '1'}
            </div>
            <div>
              <div className={`text-[13px] font-bold ${step1Done ? 'text-[#6b6b6b]' : 'text-[#1a1a2e]'}`}>👨‍👩‍👧‍👦 הוסף בני משפחה</div>
              <div className={`text-[11px] mt-0.5 ${step1Done ? 'text-[#767676]' : 'text-[#a78bfa]'}`}>
                {step1Done ? `${profiles.length} פרופילים נוספו` : 'אתה כאן עכשיו'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 px-3.5 border-2 border-[#f0f0f0] rounded-[14px]">
            <div className="w-7 h-7 rounded-full bg-[#e0e0e0] flex items-center justify-center text-xs font-extrabold text-[#767676] shrink-0">2</div>
            <div>
              <div className="text-[13px] font-bold text-[#1a1a2e]">🎒 הגדר תיק משותף</div>
              <div className="text-[11px] text-[#767676] mt-0.5">פריטים שכולם משתמשים בהם</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 px-3.5 border-2 border-[#f0f0f0] rounded-[14px]">
            <div className="w-7 h-7 rounded-full bg-[#e0e0e0] flex items-center justify-center text-xs font-extrabold text-[#767676] shrink-0">3</div>
            <div>
              <div className="text-[13px] font-bold text-[#1a1a2e]">✈️ תכנן את הטיול הראשון</div>
              <div className="text-[11px] text-[#767676] mt-0.5">ותקבל רשימה מותאמת אישית</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={profiles.length === 0}
          className="w-full py-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-[14px] text-base font-bold cursor-pointer transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
        >
          המשך ←
        </button>
        <div className="text-center text-xs text-[#767676] mt-2.5">לא תצטרך לעשות זאת שוב — הפרופילים נשמרים</div>
      </div>
    </div>
  );
}
