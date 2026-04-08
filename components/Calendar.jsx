// components/Calendar.jsx — updated with advanced sidebar UI
import { useState, useCallback } from 'react';
import DayCell from './DayCell';
import NotesModal from './NotesModal';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const HERO_IMAGES = {0:'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',1:'https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=800&q=80',2:'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&q=80',3:'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80',4:'https://images.unsplash.com/photo-1459956788016-10d38c1f5b9b?w=800&q=80',5:'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',6:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',7:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',8:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',9:'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800&q=80',10:'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80',11:'https://images.unsplash.com/photo-1544510808-91bc1c84b566?w=800&q=80'};

function formatDate(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function parseDate(s){if(!s)return null;const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function dateStr(d){if(!d)return null;return formatDate(d.getFullYear(),d.getMonth(),d.getDate())}
function displayDate(s){if(!s)return '—';const d=parseDate(s);return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
function diffDays(a,b){return Math.abs(Math.round((parseDate(b)-parseDate(a))/864e5))}

export default function Calendar({notes,onAddNote,onDeleteNote}){
  const today=new Date();
  const[viewYear,setViewYear]=useState(today.getFullYear());
  const[viewMonth,setViewMonth]=useState(today.getMonth());
  const[rangeStart,setRangeStart]=useState(null);
  const[rangeEnd,setRangeEnd]=useState(null);
  const[selecting,setSelecting]=useState(false);
  const[modalDate,setModalDate]=useState(null);
  const[sideNote,setSideNote]=useState('');
  const[animKey,setAnimKey]=useState(0);

  const goMonth=useCallback((dir)=>{setAnimKey(k=>k+1);setViewMonth(m=>{const n=m+dir;if(n<0){setViewYear(y=>y-1);return 11}if(n>11){setViewYear(y=>y+1);return 0}return n})},[]);
  const goToday=useCallback(()=>{setAnimKey(k=>k+1);setViewMonth(today.getMonth());setViewYear(today.getFullYear())},[]);
  const handleDayClick=useCallback((key)=>{if(!selecting||!rangeStart){setRangeStart(key);setRangeEnd(null);setSelecting(true)}else{const s=parseDate(rangeStart),e=parseDate(key);if(e<s){setRangeStart(key);setRangeEnd(rangeStart)}else{setRangeEnd(key)}setSelecting(false)}},[selecting,rangeStart]);
  const isInRange=useCallback((key)=>{if(!rangeStart)return false;const d=parseDate(key),s=parseDate(rangeStart),e=rangeEnd?parseDate(rangeEnd):null;if(!e)return dateStr(d)===rangeStart;return d>=s&&d<=e},[rangeStart,rangeEnd]);
  const addSideNote=()=>{if(!sideNote.trim())return;onAddNote(rangeStart||dateStr(today),sideNote.trim());setSideNote('')};

  const firstDay=new Date(viewYear,viewMonth,1).getDay();
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const prevDays=new Date(viewYear,viewMonth,0).getDate();
  const cells=[];
  for(let i=firstDay-1;i>=0;i--){const m=viewMonth-1<0?11:viewMonth-1,y=viewMonth-1<0?viewYear-1:viewYear;cells.push({day:prevDays-i,month:m,year:y,other:true})}
  for(let d=1;d<=daysInMonth;d++)cells.push({day:d,month:viewMonth,year:viewYear,other:false});
  const rem=42-cells.length;
  for(let d=1;d<=rem;d++){const m=viewMonth+1>11?0:viewMonth+1,y=viewMonth+1>11?viewYear+1:viewYear;cells.push({day:d,month:m,year:y,other:true})}

  const monthNotes=Object.entries(notes).filter(([k])=>k.startsWith(`${viewYear}-${String(viewMonth+1).padStart(2,'0')}`)).sort(([a],[b])=>a.localeCompare(b));
  const rangeDays=rangeStart&&rangeEnd?diffDays(rangeStart,rangeEnd)+1:null;
  const totalNotes=Object.values(notes).reduce((s,a)=>s+a.length,0);
  const daysWithNotes=Object.keys(notes).length;
  const totalNotesThisMonth=monthNotes.reduce((s,[,a])=>s+a.length,0);
  const todayKey=dateStr(today);

  return(<>
    <main className="app-main">
      <aside className="sidebar">
        <div className="hero-image">
          <img src={HERO_IMAGES[viewMonth]} alt={MONTHS[viewMonth]}/>
          <div className="hero-overlay"/>
          <div className="hero-text">
            <div className="hero-badge"><div className="hero-badge-dot"/>Wall Calendar</div>
            <div className="hero-month">{MONTHS[viewMonth]}</div>
            <div className="hero-year">{viewYear}</div>
            <div className="hero-stats">
              <div className="hero-stat">📅 <span className="hero-stat-val">{daysInMonth}</span> days</div>
              <div className="hero-stat">📝 <span className="hero-stat-val">{totalNotesThisMonth}</span> notes</div>
            </div>
          </div>
        </div>
        <div className="sidebar-content">
          <div>
            <div className="sb-section-label" style={{marginBottom:'6px'}}>Selected Range</div>
            <div className={`range-card${rangeStart?' has-range':''}`}>
              <div className="range-row">
                <div className={`range-box${rangeStart?' active':''}`}>
                  <div className="range-box-label">From</div>
                  <div className={`range-box-val${!rangeStart?' empty':''}`}>{rangeStart?displayDate(rangeStart):'—'}</div>
                </div>
                <div className="range-arrow-box"><div className="range-arrow-icon">→</div></div>
                <div className={`range-box${rangeEnd?' active':''}`}>
                  <div className="range-box-label">To</div>
                  <div className={`range-box-val${!rangeEnd?' empty':''}`}>{rangeEnd?displayDate(rangeEnd):'—'}</div>
                </div>
              </div>
              {rangeDays&&<div className="range-duration"><strong>{rangeDays}</strong>{rangeDays===1?' day':' days'} selected · {Math.ceil(rangeDays/7)}{Math.ceil(rangeDays/7)===1?' week':' weeks'}</div>}
              {selecting&&<div className="select-hint"><div className="hint-dot"/>Now click your end date</div>}
            </div>
          </div>
          <div className="stats-bar">
            <div className="stat-chip"><div className="stat-icon">🗒</div><div className="stat-info"><div className="stat-val">{totalNotes}</div><div className="stat-label">Total Notes</div></div></div>
            <div className="stat-chip"><div className="stat-icon">📌</div><div className="stat-info"><div className="stat-val">{daysWithNotes}</div><div className="stat-label">Days Tagged</div></div></div>
          </div>
          <div className="notes-section">
            <div className="sb-section-label">Notes</div>
            <div className="add-note-form">
              <div className="note-input-header">
                <div className="note-date-chip"><div className="chip-dot"/>{rangeStart?displayDate(rangeStart):'Today'}</div>
                <span className="note-char-count">{sideNote.length>0?`${sideNote.length} chars`:''}</span>
              </div>
              <textarea className="note-textarea" placeholder="Add a note for selected date..." value={sideNote} onChange={e=>setSideNote(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&e.metaKey)addSideNote()}}/>
              <div className="note-form-actions">
                <span className="note-form-hint">⌘↵ to save</span>
                <div className="note-btns">
                  <button className="btn-ghost" onClick={()=>setSideNote('')}>Clear</button>
                  <button className="btn-accent" onClick={addSideNote}>＋ Add Note</button>
                </div>
              </div>
            </div>
            <div className="notes-list">
              {monthNotes.length===0?(
                <div className="empty-notes">
                  <div className="empty-notes-icon">🗒</div>
                  <div className="empty-notes-title">No notes this month</div>
                  <div className="empty-notes-sub">Click a date to get started</div>
                </div>
              ):monthNotes.map(([date,noteArr])=>noteArr.map((n,i)=>(
                <div className="note-card" key={`${date}-${i}`}>
                  <div className="note-card-header">
                    <div className="note-card-date">{displayDate(date)}</div>
                    <button className="note-delete" onClick={()=>onDeleteNote(date,i)}>✕</button>
                  </div>
                  <div className="note-card-text">{n}</div>
                </div>
              )))}
            </div>
          </div>
        </div>
      </aside>
      <section className="calendar-area">
        <div className="cal-nav">
          <div className="cal-nav-title">
            {MONTHS[viewMonth]} {viewYear}
          </div>
          <div className="cal-nav-controls">
            <button className="nav-btn" onClick={()=>goMonth(-1)}>‹</button>
            <button className="nav-btn today-btn" onClick={goToday}>Today</button>
            <button className="nav-btn" onClick={()=>goMonth(1)}>›</button>
          </div>
        </div>
        <div className="weekdays">{DAYS.map((d,i)=><div key={d} className={`weekday-label${i===0||i===6?' weekend':''}`}>{d}</div>)}</div>
        <div className="cal-grid cal-animate" key={animKey}>
          {cells.map((c,idx)=>{const key=formatDate(c.year,c.month,c.day);return<DayCell key={idx} year={c.year} month={c.month} day={c.day} isOtherMonth={c.other} isToday={key===todayKey} isStart={key===rangeStart} isEnd={key===rangeEnd} inRange={isInRange(key)} notes={notes[key]||[]} onClick={()=>handleDayClick(key)} onDoubleClick={()=>setModalDate(key)}/>})}
        </div>
        <div className="cal-legend">
          <div className="legend-item"><div className="legend-dot" style={{background:'var(--accent)',borderRadius:'50%'}}/>Today</div>
          <div className="legend-item"><div className="legend-dot" style={{background:'var(--accent)'}}/>Range start/end</div>
          <div className="legend-item"><div className="legend-dot" style={{background:'var(--range-bg)',border:'1px solid var(--range-border)'}}/>In range</div>
          <div className="legend-item"><div className="legend-dot" style={{background:'var(--accent)',borderRadius:'50%',width:'6px',height:'6px'}}/>Has note</div>
        </div>
      </section>
    </main>
    {modalDate&&<NotesModal date={modalDate} notes={notes[modalDate]||[]} onClose={()=>setModalDate(null)} onAdd={onAddNote} onDelete={onDeleteNote}/>}
  </>);
}
