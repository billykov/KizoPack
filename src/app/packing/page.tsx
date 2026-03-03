'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { calcProgress, isAllDone } from '@/lib/logic';
import { W_LABELS, A_LABELS } from '@/lib/constants';

export default function PackingPage() {
  const router = useRouter();
  const activeTrip     = useStore(s => s.activeTrip);
  const profiles       = useStore(s => s.profiles);
  const ui             = useStore(s => s.ui);
  const toggleDone     = useStore(s => s.toggleDone);
  const deletePackItem = useStore(s => s.deletePackItem);
  const addCustomPackItem = useStore(s => s.addCustomPackItem);
  const undoDelete     = useStore(s => s.undoDelete);
  const finishTrip     = useStore(s => s.finishTrip);
  const abandonTrip    = useStore(s => s.abandonTrip);
  const confirmSS      = useStore(s => s.confirmSS);
  const setUI          = useStore(s => s.setUI);

  const [addingIn, setAddingIn] = useState<{ key: string; ci: number } | null>(null);
  const [addText, setAddText]   = useState('');

  const packing = activeTrip?.packing ?? {};
  const { done, total, pct } = calcProgress(packing);

  const tabKeys = activeTrip
    ? [...activeTrip.travelers, ...(packing['shared'] ? ['shared'] : [])]
    : [];

  // Auto-navigate to done when all items checked
  useEffect(() => {
    if (activeTrip && isAllDone(packing)) {
      setTimeout(() => {
        finishTrip();
        router.replace('/done');
      }, 600);
    }
  }, [packing]);

  if (!activeTrip) return null;

  const { dest, dur, weather, acts } = activeTrip;
  const wLabel = W_LABELS[weather || ''] || '';
  const aStr   = acts.slice(0, 3).map(a => A_LABELS[a]).join(' • ');
  const subTxt = `${dest ? dest + ' • ' : ''}${dur} ימים${wLabel ? ' • ' + wLabel : ''}${aStr ? ' • ' + aStr : ''}`;

  const activeKey = ui.activeTab || tabKeys[0] || '';
  const activeList = packing[activeKey];

  function handleAbandon() {
    if (confirm('לעזוב את הטיול הנוכחי? ההתקדמות תאבד.')) {
      abandonTrip();
      router.replace('/home');
    }
  }

  function startAddItem(key: string, ci: number) {
    setAddingIn({ key, ci });
    setAddText('');
  }

  function submitAddItem() {
    if (!addingIn || !addText.trim()) { setAddingIn(null); return; }
    addCustomPackItem(addingIn.key, addingIn.ci, addText.trim());
    setAddingIn(null);
    setAddText('');
  }

  function handleFinish() {
    finishTrip();
    router.replace('/done');
  }

  const showSSModal   = Boolean(ui.ssItem);
  const showUndoToast = Boolean(ui.undoData);

  return (
    <div className="min-h-[100dvh] bg-brand-gradient">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-brand-gradient">
        <div className="px-4 pt-5 pb-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[21px] font-extrabold text-white">🧳 רשימת האריזה</div>
            <button
              onClick={handleAbandon}
              className="text-white/85 text-xs font-bold cursor-pointer bg-none border-none"
            >✕ עזוב טיול</button>
          </div>
          <div className="text-xs text-white/75 mb-2.5">{subTxt}</div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="flex-1 h-2 bg-white/25 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-[3px] transition-[width_0.4s]" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-base text-white font-extrabold whitespace-nowrap">{done}/{total} פריטים</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto py-2 px-4 pb-2.5 no-scrollbar">
          {tabKeys.map(key => {
            const p = profiles.find(x => x.id === key);
            const emoji = p ? p.emoji : '🎒';
            const name  = p ? p.name  : 'משותף';
            const list  = packing[key];
            const t = list ? list.cats.reduce((s, c) => s + c.items.length, 0) : 0;
            const d = list ? list.cats.reduce((s, c) => s + c.items.filter(i => i.done).length, 0) : 0;
            const isActive = key === activeKey;
            return (
              <div
                key={key}
                onClick={() => setUI({ activeTab: key })}
                className={`flex items-center gap-1 py-2 px-3.5 rounded-full text-[13px] font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-all ${
                  isActive ? 'bg-white text-[#667eea]' : 'bg-white/20 text-white'
                }`}
              >
                {emoji} {name} <span className={`text-xs font-bold ${isActive ? 'text-[#a78bfa]' : 'opacity-85'}`}>{d}/{t}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-1 pb-28">
        {activeList?.cats.map((cat, ci) => {
          const allDone = cat.items.length > 0 && cat.items.every(i => i.done);
          return (
            <div key={cat.id} className="bg-white rounded-[18px] p-4 px-5 mb-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[19px]">{cat.em}</span>
                <span className="text-[15px] font-bold text-[#1a1a2e] flex-1">{cat.name}</span>
                {allDone
                  ? <span className="text-xs text-[#22c55e] font-bold bg-[#f0fdf4] px-2 py-0.5 rounded-full">✓ הושלם</span>
                  : <span className="text-xs text-[#a78bfa] font-semibold">{cat.items.length} פריטים</span>}
              </div>

              {allDone && (
                <div className="flex items-center gap-2 bg-[#f0fdf4] rounded-[9px] py-2 px-3 mb-1">
                  <span>✅</span>
                  <span className="text-[13px] font-bold text-[#15803d]">כל הפריטים אוּרזו</span>
                </div>
              )}

              {cat.items.map((item, ii) => (
                <div key={ii} className="flex items-center gap-2 py-2 border-b border-[#f5f5f5] last:border-0">
                  <div
                    onClick={() => toggleDone(activeKey, ci, ii)}
                    className={`w-[21px] h-[21px] border-2 rounded-[6px] shrink-0 flex items-center justify-center cursor-pointer transition-all text-xs ${
                      item.done ? 'bg-[#667eea] border-[#667eea] text-white' : 'border-[#d0c8ff]'
                    }`}
                  >{item.done ? '✓' : ''}</div>
                  <span className="text-[17px]">{item.emoji}</span>
                  <span className={`flex-1 text-sm ${item.done ? 'line-through text-[#bbb]' : 'text-[#333]'}`}>
                    {item.qty ? item.qty + ' ' : ''}{item.name}
                  </span>
                  <span
                    onClick={() => deletePackItem(activeKey, ci, ii)}
                    className="text-[#ddd] text-[15px] cursor-pointer p-0.5 hover:text-[#ff6b6b] transition-colors shrink-0"
                  >🗑️</span>
                </div>
              ))}

              {/* Add item inline */}
              {addingIn?.key === activeKey && addingIn.ci === ci ? (
                <div className="flex gap-1.5 pt-2 items-center">
                  <input
                    type="text"
                    value={addText}
                    onChange={e => setAddText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') submitAddItem(); if (e.key === 'Escape') setAddingIn(null); }}
                    placeholder="שם הפריט..."
                    autoFocus
                    className="flex-1 py-2 px-3 border-2 border-[#667eea] rounded-[9px] text-sm outline-none font-[inherit]"
                  />
                  <button onClick={submitAddItem} className="py-2 px-3.5 bg-[#667eea] text-white border-none rounded-[9px] font-bold cursor-pointer text-xs">הוסף</button>
                </div>
              ) : (
                <div
                  onClick={() => startAddItem(activeKey, ci)}
                  className="flex items-center gap-2 py-2 text-[#a78bfa] text-[13px] font-semibold cursor-pointer"
                >➕ הוסף פריט</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Float bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] py-2.5 px-4 flex gap-2.5 shadow-[0_-4px_18px_rgba(0,0,0,0.08)] z-10">
        <button className="py-3 px-[17px] bg-[#f3f0ff] text-[#667eea] border-none rounded-[13px] text-[15px] cursor-pointer" onClick={() => window.print()}>🖨️</button>
        <button onClick={handleFinish} className="flex-1 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-[13px] text-[15px] font-bold cursor-pointer">סיים טיול ✅</button>
      </div>

      {/* Undo toast */}
      {showUndoToast && (
        <div className="fixed bottom-[85px] left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-white py-2.5 px-4 rounded-[11px] flex items-center gap-3.5 text-[13px] font-semibold z-[150] whitespace-nowrap shadow-[0_5px_18px_rgba(0,0,0,0.3)]">
          <span>נמחק: {ui.undoData?.item.name}</span>
          <button
            onClick={undoDelete}
            className="bg-[#667eea] border-none text-white py-1 px-3 rounded-[7px] font-bold cursor-pointer text-xs"
          >↩ בטל</button>
        </div>
      )}

      {/* Smart Save modal */}
      {showSSModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-end justify-center pb-5 px-4">
          <div className="bg-white rounded-[22px] p-6 max-w-[480px] w-full">
            <div className="w-[38px] h-1 bg-[#e0e0e0] rounded-sm mx-auto mb-4" />
            <div className="text-[34px] text-center mb-2">💾</div>
            <div className="text-[18px] font-extrabold text-[#1a1a2e] text-center mb-1">רוצה לשמור את הפריט?</div>
            <div className="text-[13px] text-[#888] text-center mb-4 leading-relaxed">הוספת פריט חדש לרשימה.<br />רוצה לשמור אותו לטיולים הבאים?</div>
            <div className="bg-[#f3f0ff] rounded-[11px] py-2 px-3.5 text-center mb-4 text-sm font-bold text-[#667eea]">📌 {ui.ssItem}</div>

            <div className="flex flex-col gap-2 mb-3">
              {/* Save to profile option */}
              {ui.ssTabKey && profiles.find(p => p.id === ui.ssTabKey) && (() => {
                const p = profiles.find(x => x.id === ui.ssTabKey)!;
                return (
                  <div
                    onClick={() => setUI({ ssTarget: ui.ssTabKey })}
                    className={`flex items-center gap-3 p-3 px-4 border-2 rounded-[14px] cursor-pointer transition-all hover:border-[#667eea] hover:bg-[#f9f7ff] ${ui.ssTarget === ui.ssTabKey ? 'border-[#667eea] bg-[#f3f0ff]' : 'border-[#e8e4ff]'}`}
                  >
                    <span className="text-[25px]">{p.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#1a1a2e]">שמור בפרופיל של {p.name}</div>
                      <div className="text-xs text-[#888] mt-0.5">יופיע בטיולים הבאים</div>
                    </div>
                    {ui.ssTarget === ui.ssTabKey && <span className="text-[#667eea] text-[15px]">✓</span>}
                  </div>
                );
              })()}

              {/* Save to shared */}
              <div
                onClick={() => setUI({ ssTarget: 'shared' })}
                className={`flex items-center gap-3 p-3 px-4 border-2 rounded-[14px] cursor-pointer transition-all hover:border-[#667eea] hover:bg-[#f9f7ff] ${ui.ssTarget === 'shared' ? 'border-[#667eea] bg-[#f3f0ff]' : 'border-[#e8e4ff]'}`}
              >
                <span className="text-[25px]">🎒</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#1a1a2e]">שמור בתיק המשותף</div>
                  <div className="text-xs text-[#888] mt-0.5">לכל בני המשפחה</div>
                </div>
                {ui.ssTarget === 'shared' && <span className="text-[#667eea] text-[15px]">✓</span>}
              </div>
            </div>

            <button onClick={() => { confirmSS(); }} className="w-full py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-[13px] text-[15px] font-bold cursor-pointer mb-2">שמור 💾</button>
            <button onClick={() => setUI({ ssItem: null, ssTabKey: null, ssTarget: null })} className="w-full py-2.5 bg-transparent border-2 border-[#e8e4ff] text-[#888] rounded-[13px] text-[13px] font-semibold cursor-pointer">לא תודה, רק לטיול הזה</button>
          </div>
        </div>
      )}
    </div>
  );
}
