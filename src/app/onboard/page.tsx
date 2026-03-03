'use client';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { TYPE_LABELS } from '@/lib/constants';

export default function OnboardPage() {
  const router   = useRouter();
  const profiles = useStore(s => s.profiles);
  const deleteProfile = useStore(s => s.deleteProfile);

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

        <h1 className="text-[21px] font-extrabold text-[#1a1a2e] mb-1">👋 ברוך הבא לPackSmart!</h1>
        <p className="text-sm text-[#888] mb-5">הוסף את בני המשפחה כדי להתחיל — רגע אחד ואתה מוכן</p>

        {/* Add member row */}
        <div
          onClick={handleAddMember}
          className="flex items-center gap-3.5 p-3.5 px-4 border-2 border-dashed border-[#c4b5fd] rounded-[18px] mb-2.5 cursor-pointer hover:border-[#667eea] hover:bg-[#f9f7ff] transition-all"
        >
          <div className="text-[22px] w-13 h-13 bg-[#f3f0ff] rounded-full flex items-center justify-center shrink-0 w-[52px] h-[52px]">➕</div>
          <div>
            <div className="text-[15px] font-bold text-[#667eea]">הוסף בן/בת משפחה</div>
            <div className="text-xs text-[#aaa] mt-0.5">התחל עם עצמך</div>
          </div>
        </div>

        {/* Profile list */}
        {profiles.length === 0 ? (
          <div className="text-center py-7 px-4">
            <div className="text-[42px] mb-2.5">👨‍👩‍👧‍👦</div>
            <div className="text-sm font-semibold text-[#bbb]">עדיין אין בני משפחה</div>
            <div className="text-xs text-[#ccc] mt-1">הוסף לפחות אחד כדי להמשיך</div>
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
                  <button
                    onClick={(e) => { e.stopPropagation(); useStore.getState().resetFormForEdit(p.id); useStore.getState().setUI({ callerRoute: '/onboard' }); router.push('/add-member'); }}
                    className="w-[30px] h-[30px] rounded-lg bg-[#f3f0ff] flex items-center justify-center text-sm cursor-pointer hover:bg-[#ede9fe] transition-colors"
                  >✏️</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }}
                    className="w-[30px] h-[30px] rounded-lg bg-[#f3f0ff] flex items-center justify-center text-sm cursor-pointer hover:bg-[#ffe4e4] transition-colors"
                  >🗑️</button>
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
              <div className={`text-[13px] font-bold ${step1Done ? 'text-[#888]' : 'text-[#1a1a2e]'}`}>👨‍👩‍👧‍👦 הוסף בני משפחה</div>
              <div className={`text-[11px] mt-0.5 ${step1Done ? 'text-[#aaa]' : 'text-[#a78bfa]'}`}>
                {step1Done ? `${profiles.length} פרופילים נוספו` : 'אתה כאן עכשיו'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 px-3.5 border-2 border-[#f0f0f0] rounded-[14px]">
            <div className="w-7 h-7 rounded-full bg-[#e0e0e0] flex items-center justify-center text-xs font-extrabold text-[#aaa] shrink-0">2</div>
            <div>
              <div className="text-[13px] font-bold text-[#1a1a2e]">🎒 הגדר תיק משותף</div>
              <div className="text-[11px] text-[#aaa] mt-0.5">פריטים שכולם משתמשים בהם</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 px-3.5 border-2 border-[#f0f0f0] rounded-[14px]">
            <div className="w-7 h-7 rounded-full bg-[#e0e0e0] flex items-center justify-center text-xs font-extrabold text-[#aaa] shrink-0">3</div>
            <div>
              <div className="text-[13px] font-bold text-[#1a1a2e]">✈️ תכנן את הטיול הראשון</div>
              <div className="text-[11px] text-[#aaa] mt-0.5">ותקבל רשימה מותאמת אישית</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={profiles.length === 0}
          className="w-full py-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-[14px] text-base font-bold cursor-pointer transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
        >
          המשך →
        </button>
        <div className="text-center text-xs text-[#aaa] mt-2.5">לא תצטרך לעשות זאת שוב — הפרופילים נשמרים</div>
      </div>
    </div>
  );
}
