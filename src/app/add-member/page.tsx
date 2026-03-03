'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { ITEM_LIB, CAT_LABELS, AUTO_ITEMS, DEFAULT_MULTI, EMOJIS } from '@/lib/constants';
import { getItem } from '@/lib/logic';
import type { Profile } from '@/lib/types';

export default function AddMemberPage() {
  const router = useRouter();
  const ui = useStore(s => s.ui);
  const setUI = useStore(s => s.setUI);
  const addProfile = useStore(s => s.addProfile);
  const updateProfile = useStore(s => s.updateProfile);

  const [name, setName] = useState(() => {
    if (ui.editId) {
      const profiles = useStore.getState().profiles;
      return profiles.find(p => p.id === ui.editId)?.name || '';
    }
    return '';
  });
  const [nameErr, setNameErr] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showEmojiModal, setShowEmojiModal] = useState(false);

  function selectType(type: 'adult' | 'child' | 'baby') {
    const multi = DEFAULT_MULTI[type];
    const auto  = AUTO_ITEMS[type] || [];
    const existing = ui.formSelItems.filter(id => !ui.formAutoItems.includes(id));
    const newSel   = [...new Set([...existing, ...auto])];
    setUI({ formType: type, formMulti: multi, formAutoItems: [...auto], formSelItems: newSel,
      formActiveCat: type === 'baby' ? 'baby' : 'toiletries' });
  }

  function changeMulti(d: number) {
    const v = Math.round((ui.formMulti + d) * 10) / 10;
    if (v < 0.5 || v > 5) return;
    setUI({ formMulti: v });
  }

  function toggleItem(id: string) {
    const selItems   = ui.formSelItems;
    const autoItems  = ui.formAutoItems;
    if (selItems.includes(id)) {
      setUI({
        formSelItems:  selItems.filter(x => x !== id),
        formAutoItems: autoItems.filter(x => x !== id),
      });
    } else {
      setUI({ formSelItems: [...selItems, id] });
    }
  }

  function addCustomItem() {
    const txt = customText.trim();
    if (!txt) return;
    const id = 'custom_' + Date.now();
    setUI({
      formCustomItems: [...ui.formCustomItems, { id, emoji: '📌', name: txt }],
      formSelItems:    [...ui.formSelItems, id],
    });
    setCustomText('');
    setShowCustomInput(false);
  }

  function handleSave() {
    const n = name.trim();
    if (!n) { setNameErr(true); return; }
    setNameErr(false);

    const profile: Profile = {
      id:          ui.editId || Date.now().toString(),
      emoji:       ui.formEmoji,
      name:        n,
      type:        ui.formType,
      multi:       ui.formMulti,
      items:       [...ui.formSelItems],
      customItems: [...ui.formCustomItems],
    };

    if (ui.editId) updateProfile(profile);
    else           addProfile(profile);

    router.push(ui.callerRoute);
  }

  const showAutofillBanner = ui.formType === 'baby' || ui.formType === 'child';
  const isAutoMulti = DEFAULT_MULTI[ui.formType] === ui.formMulti;

  return (
    <div className="min-h-[100dvh] flex items-start justify-center p-5">
      <div className="bg-white rounded-3xl p-7 max-w-[480px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] my-auto">
        {/* Progress */}
        <div className="flex gap-1.5 mb-5">
          <div className="h-1.5 flex-1 rounded-full bg-[#667eea]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#667eea]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#e0e0e0]" />
        </div>

        <button
          onClick={() => router.push(ui.callerRoute)}
          className="inline-flex items-center gap-1.5 text-[#a78bfa] text-sm font-bold cursor-pointer bg-none border-none p-0 mb-4"
        >← חזור</button>

        <h1 className="text-[21px] font-extrabold text-[#1a1a2e] mb-1">
          {ui.editId ? '✏️ עריכת פרופיל' : '➕ הוספת בן משפחה'}
        </h1>
        <p className="text-sm text-[#888] mb-5">פרופיל אישי לרשימת אריזה מותאמת</p>

        {/* Emoji picker */}
        <div className="text-center mb-5">
          <div
            onClick={() => setShowEmojiModal(true)}
            className="text-[50px] w-[86px] h-[86px] bg-[#f3f0ff] rounded-full flex items-center justify-center mx-auto mb-2 cursor-pointer border-[3px] border-dashed border-[#c4b5fd] hover:border-[#667eea] hover:scale-[1.04] transition-all"
          >{ui.formEmoji}</div>
          <div onClick={() => setShowEmojiModal(true)} className="text-[13px] text-[#a78bfa] font-semibold cursor-pointer">✏️ בחר אימוג&apos;י</div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-[13px] font-bold text-[#555] mb-1.5">שם</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); if (e.target.value) setNameErr(false); }}
            placeholder="למשל: אבא, מיכל, יובל..."
            className={`w-full py-3 px-[15px] border-2 rounded-xl text-base text-[#1a1a2e] outline-none transition-colors font-[inherit] ${nameErr ? 'border-[#ff6b6b]' : 'border-[#e8e4ff] focus:border-[#667eea]'}`}
          />
        </div>

        {/* Type */}
        <div className="mb-4">
          <label className="block text-[13px] font-bold text-[#555] mb-1.5">סוג</label>
          <div className="grid grid-cols-3 gap-2.5">
            {(['adult', 'child', 'baby'] as const).map(t => (
              <div
                key={t}
                onClick={() => selectType(t)}
                className={`py-3 px-2 border-2 rounded-[14px] text-center cursor-pointer transition-all hover:border-[#a78bfa] ${ui.formType === t ? 'border-[#667eea] bg-[#f3f0ff]' : 'border-[#e8e4ff]'}`}
              >
                <span className="text-2xl block mb-1">{t === 'adult' ? '👨' : t === 'child' ? '🧒' : '👶'}</span>
                <span className="text-[13px] font-semibold text-[#444]">{t === 'adult' ? 'מבוגר' : t === 'child' ? 'ילד' : 'תינוק'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Multi */}
        <div className="flex items-center gap-3.5 bg-[#f9f7ff] rounded-[14px] p-3 px-4 mb-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#333]">חליפות ביגוד ליום</div>
            <div className={`text-[11px] mt-0.5 ${isAutoMulti && ui.formType !== 'adult' ? 'text-[#f59e0b]' : 'text-[#aaa]'}`}>
              {isAutoMulti && ui.formType !== 'adult' ? 'עודכן אוטומטית ✨' : 'ברירת מחדל: 1.5 | תינוק: 3'}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => changeMulti(-0.5)} className="w-[30px] h-[30px] rounded-full bg-[#667eea] text-white border-none text-lg cursor-pointer flex items-center justify-center leading-none">−</button>
            <span className={`text-xl font-extrabold min-w-[38px] text-center ${isAutoMulti && ui.formType !== 'adult' ? 'text-[#f59e0b]' : 'text-[#1a1a2e]'}`}>{ui.formMulti}</span>
            <button onClick={() => changeMulti(0.5)}  className="w-[30px] h-[30px] rounded-full bg-[#667eea] text-white border-none text-lg cursor-pointer flex items-center justify-center leading-none">+</button>
          </div>
        </div>

        {/* Autofill banner */}
        {showAutofillBanner && (
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#fef3c7] to-[#fde68a] border-2 border-[#f59e0b] rounded-[14px] p-2.5 px-3.5 mb-3">
            <span className="text-xl">✨</span>
            <div>
              <div className="text-[13px] font-bold text-[#92400e]">
                {ui.formType === 'baby' ? 'נוספו פריטי תינוק אוטומטית' : 'נוספו פריטי ילד אוטומטית'}
              </div>
              <div className="text-[11px] text-[#b45309] mt-0.5">ניתן לשנות למטה</div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-[#f0f0f0] my-4" />
        <div className="text-[15px] font-extrabold text-[#1a1a2e] mb-1">📦 פריטים אישיים</div>
        <div className="text-[13px] text-[#888] mb-3.5">בחר מה תמיד לוקחים</div>

        {/* Category tabs */}
        <div className="flex gap-1.5 flex-wrap mb-2.5">
          {Object.entries(CAT_LABELS).map(([id, label]) => (
            <div
              key={id}
              onClick={() => setUI({ formActiveCat: id })}
              className={`py-1 px-2.5 rounded-full border-2 text-[11px] font-bold cursor-pointer whitespace-nowrap transition-all ${
                ui.formActiveCat === id ? 'bg-[#667eea] border-[#667eea] text-white' : 'border-[#e8e4ff] text-[#888]'
              }`}
            >{label}</div>
          ))}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {(ITEM_LIB[ui.formActiveCat] || []).map(item => {
            const isSel  = ui.formSelItems.includes(item.id);
            const isAuto = ui.formAutoItems.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-center gap-1.5 py-2 px-2.5 border-2 rounded-[11px] cursor-pointer transition-all hover:border-[#a78bfa] ${
                  isSel ? (isAuto ? 'border-[#f59e0b] bg-[#fef9ec]' : 'border-[#667eea] bg-[#f3f0ff]') : 'border-[#e8e4ff]'
                }`}
              >
                <span className="text-[17px] shrink-0">{item.emoji}</span>
                <span className="text-xs font-semibold text-[#333] flex-1">{item.name}</span>
                {isSel && <span className={`text-xs ${isAuto ? 'text-[#f59e0b]' : 'text-[#667eea]'}`}>{isAuto ? '✨' : '✓'}</span>}
              </div>
            );
          })}
        </div>

        {/* Custom items in current view */}
        {ui.formActiveCat === 'misc' && ui.formCustomItems.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {ui.formCustomItems.map(item => {
              const isSel = ui.formSelItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-1.5 py-2 px-2.5 border-2 rounded-[11px] cursor-pointer transition-all ${isSel ? 'border-[#667eea] bg-[#f3f0ff]' : 'border-[#e8e4ff]'}`}
                >
                  <span className="text-[17px] shrink-0">📌</span>
                  <span className="text-xs font-semibold text-[#333] flex-1">{item.name}</span>
                  {isSel && <span className="text-xs text-[#667eea]">✓</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Add custom */}
        {!showCustomInput ? (
          <div onClick={() => setShowCustomInput(true)} className="flex items-center gap-2 py-2 px-3 border-2 border-dashed border-[#c4b5fd] rounded-[11px] cursor-pointer text-[#a78bfa] font-semibold text-xs mb-1">
            ➕ הוסף פריט אישי
          </div>
        ) : (
          <div className="flex gap-1.5 py-1.5 items-center">
            <input
              type="text"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCustomItem(); }}
              placeholder="שם הפריט..."
              autoFocus
              className="flex-1 py-2 px-3 border-2 border-[#667eea] rounded-[9px] text-sm outline-none font-[inherit]"
            />
            <button onClick={addCustomItem} className="py-2 px-3.5 bg-[#667eea] text-white border-none rounded-[9px] font-bold cursor-pointer whitespace-nowrap text-[13px]">הוסף</button>
          </div>
        )}

        {/* Preview chips */}
        {ui.formSelItems.length > 0 && (
          <div className="bg-[#f9f7ff] rounded-[11px] p-2.5 px-3 mt-2">
            <div className="text-[11px] text-[#aaa] font-bold mb-1.5">נבחרו:</div>
            <div className="flex flex-wrap gap-1">
              {ui.formSelItems.map(id => {
                const item = getItem(id) || ui.formCustomItems.find(ci => ci.id === id);
                if (!item) return null;
                const isA = ui.formAutoItems.includes(id);
                return (
                  <span key={id} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isA ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#ede9fe] text-[#667eea]'}`}>
                    {item.emoji} {item.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="h-px bg-[#f0f0f0] my-4" />

        <button onClick={handleSave} className="w-full py-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-[14px] text-base font-bold cursor-pointer">
          {ui.editId ? 'שמור שינויים ✓' : 'שמור פרופיל →'}
        </button>
      </div>

      {/* Emoji Modal */}
      {showEmojiModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-5">
          <div className="bg-white rounded-[22px] p-5 w-full max-w-[360px] max-h-[80vh] overflow-y-auto">
            <div className="text-[15px] font-extrabold text-[#1a1a2e] mb-3 text-center">בחר אימוג&apos;י</div>
            {/* Category tabs */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {Object.entries(EMOJIS).map(([key, val]) => (
                <div
                  key={key}
                  onClick={() => setUI({ emojiCat: key })}
                  className={`py-1 px-2.5 rounded-full border-2 text-xs font-bold cursor-pointer transition-all ${ui.emojiCat === key ? 'bg-[#667eea] border-[#667eea] text-white' : 'border-[#e8e4ff] text-[#888]'}`}
                >
                  {key === 'people' ? '👨 אנשים' : key === 'animals' ? '🐶 חיות' : '😎 פרצופים'}
                </div>
              ))}
            </div>
            <div className="text-[10px] font-bold text-[#aaa] mb-1.5 tracking-widest">{EMOJIS[ui.emojiCat]?.label}</div>
            <div className="grid grid-cols-7 gap-0.5 mb-3">
              {(EMOJIS[ui.emojiCat]?.list || []).map(em => (
                <span
                  key={em}
                  onClick={() => { setUI({ formEmoji: em }); setShowEmojiModal(false); }}
                  className={`text-[25px] cursor-pointer p-1 rounded-lg text-center hover:bg-[#ede9fe] transition-colors ${ui.formEmoji === em ? 'bg-[#ddd6fe]' : ''}`}
                >{em}</span>
              ))}
            </div>
            <button onClick={() => setShowEmojiModal(false)} className="w-full py-2.5 bg-gradient-to-br from-[#667eea] to-[#764ba2] border-none rounded-[11px] text-white font-bold text-sm cursor-pointer">✓ בחר</button>
          </div>
        </div>
      )}
    </div>
  );
}
