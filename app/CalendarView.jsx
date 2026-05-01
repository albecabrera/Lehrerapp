
const { useState } = React;

const HOUR_H   = 64;
const DAY_START = 7;
const DAY_END   = 19;

function timeToY(t)    { const [h,m]=t.split(':').map(Number); return (h-DAY_START)*HOUR_H+(m/60)*HOUR_H; }
function timeToPx(s,e) { const [sh,sm]=s.split(':').map(Number); const [eh,em]=e.split(':').map(Number); return ((eh*60+em)-(sh*60+sm))/60*HOUR_H; }
function toKey(d)      { return d.toISOString().slice(0,10); }
function addDays(d,n)  { const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function fmtDate(d)    { return d.toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); }

function getClass(id)  { return AppData.classes.find(c=>c.id===id); }
function getColor(cid) { if(!cid) return 'oklch(0.60 0.05 250)'; const c=getClass(cid); return c?AppData.classColors[c.colorIdx]:'oklch(0.60 0.05 250)'; }

// ── EventCard ─────────────────────────────────────────────────────────────
function EventCard({ ev, onClick }) {
  const color = getColor(ev.classId);
  const h = Math.max(timeToPx(ev.start, ev.end), 28);
  const isBreak = ev.type === 'break';
  const isDuty  = ev.type === 'duty';

  if (isBreak || isDuty) {
    return (
      <div style={{
        position:'absolute', left:'66px', right:'8px',
        top: timeToY(ev.start)+'px', height: Math.max(timeToPx(ev.start,ev.end),18)+'px',
        background: isBreak ? 'var(--bg-subtle)' : 'var(--amber-bg)',
        border: `1px solid ${isBreak?'var(--border-light)':'var(--amber-bg)'}`,
        borderRadius:'var(--r-sm)',
        display:'flex', alignItems:'center', padding:'0 10px', gap:'6px',
      }}>
        <span style={{fontSize:'11px'}}>{isBreak?'☕':'👁'}</span>
        <span style={{fontSize:'11.5px', color: isBreak?'var(--text-3)':'var(--amber)', fontWeight:'500'}}>{ev.title} · {ev.start}–{ev.end}</span>
      </div>
    );
  }

  return (
    <div onClick={()=>onClick&&onClick(ev)} style={{
      position:'absolute', left:'66px', right:'8px',
      top: timeToY(ev.start)+'px', height: h+'px',
      background: `oklch(from ${color} l c h / 0.10)`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 'var(--r-md)',
      padding: '6px 10px',
      cursor:'pointer',
      overflow:'hidden',
      transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s',
      boxShadow: 'var(--shadow-xs)',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='translateX(2px)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow='var(--shadow-xs)'; e.currentTarget.style.transform='none'; }}
    >
      <div style={{fontWeight:'700', fontSize:'13px', color, lineHeight:1.2}}>{ev.title}</div>
      {h>40&&ev.topic&&<div style={{fontSize:'11.5px', color:'var(--text-3)', marginTop:'2px'}}>{ev.topic}</div>}
      {h>58&&ev.room&&<div style={{fontSize:'11px', color:'var(--text-3)', marginTop:'3px'}}>📍 {ev.room} · {ev.start}–{ev.end}</div>}
      {h<=40&&<div style={{fontSize:'10.5px', color:'var(--text-3)'}}>{ev.start}–{ev.end}{ev.room?' · '+ev.room:''}</div>}
    </div>
  );
}

// ── TimeGrid ──────────────────────────────────────────────────────────────
function TimeGrid({ events=[], onEventClick }) {
  const hours = Array.from({length:DAY_END-DAY_START},(_,i)=>DAY_START+i);
  return (
    <div style={{position:'relative', height:(DAY_END-DAY_START)*HOUR_H+'px', minWidth:0}}>
      {hours.map(h=>(
        <div key={h} style={{
          position:'absolute', top:(h-DAY_START)*HOUR_H+'px', left:0, right:0,
          borderTop:`1px solid var(--border-light)`,
          display:'flex', alignItems:'flex-start',
        }}>
          <span style={{width:'54px',fontSize:'10.5px',color:'var(--text-3)',padding:'2px 8px 0 0',textAlign:'right',flexShrink:0,userSelect:'none',fontWeight:'500'}}>{h}:00</span>
        </div>
      ))}
      {events.map(ev=><EventCard key={ev.id} ev={ev} onClick={onEventClick}/>)}
    </div>
  );
}

// ── Day View ──────────────────────────────────────────────────────────────
function DayView({ date, onEventClick, onAddLesson }) {
  const key  = toKey(date);
  const evs  = AppData.events[key]||[];
  const lessons  = evs.filter(e=>e.type==='lesson');
  const subjects = [...new Set(lessons.map(e=>e.title))];
  const classIds = [...new Set(lessons.map(e=>e.classId).filter(Boolean))];

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', padding:'20px 24px 16px'}}>
        {[['Stunden',lessons.length],['Fächer',subjects.length],['Klassen',classIds.length]].map(([label,val])=>(
          <div key={label} style={{
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:'var(--r-lg)', padding:'18px 22px',
            boxShadow:'var(--shadow-sm)',
          }}>
            <div style={{fontSize:'30px', fontWeight:'800', color:'var(--text-1)', lineHeight:1}}>{val}</div>
            <div style={{fontSize:'12px', color:'var(--text-3)', marginTop:'4px', fontWeight:'500'}}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{flex:1, overflowY:'auto', padding:'0 0 24px'}}>
        <TimeGrid events={evs} onEventClick={onEventClick}/>
      </div>
      <div style={{padding:'12px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'center', background:'var(--bg-card)'}}>
        <button onClick={onAddLesson} style={{
          background:'var(--accent)', color:'var(--accent-fg)', border:'none',
          borderRadius:'var(--r-md)', padding:'9px 22px', fontSize:'13px', fontWeight:'600',
          cursor:'pointer', display:'flex', alignItems:'center', gap:'7px',
          boxShadow:'0 2px 8px oklch(from var(--accent) l c h / 0.35)',
          transition:'transform 0.12s, box-shadow 0.12s',
        }}
          onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 14px oklch(from var(--accent) l c h / 0.40)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 8px oklch(from var(--accent) l c h / 0.35)'; }}
        >+ Termin hinzufügen</button>
      </div>
    </div>
  );
}

// ── Week View ─────────────────────────────────────────────────────────────
function WeekView({ date, onEventClick }) {
  const mon = new Date(date);
  const dow = mon.getDay()===0?6:mon.getDay()-1;
  mon.setDate(mon.getDate()-dow);
  const days = Array.from({length:5},(_,i)=>addDays(mon,i));
  const todayKey = '2026-04-28';

  return (
    <div style={{flex:1, overflowY:'auto', padding:'16px 20px 24px'}}>
      <div style={{
        display:'grid', gridTemplateColumns:'54px repeat(5,1fr)',
        border:'1px solid var(--border)', borderRadius:'var(--r-lg)',
        overflow:'hidden', background:'var(--bg-card)', boxShadow:'var(--shadow-sm)',
      }}>
        <div style={{background:'var(--bg-subtle)', borderBottom:'1px solid var(--border)'}}/>
        {days.map(d=>{
          const isToday=toKey(d)===todayKey;
          return (
            <div key={toKey(d)} style={{
              padding:'10px 8px', textAlign:'center',
              background: isToday?'var(--accent-bg)':'var(--bg-subtle)',
              borderBottom:'1px solid var(--border)', borderLeft:'1px solid var(--border)',
            }}>
              <div style={{fontSize:'10.5px', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:'600'}}>
                {d.toLocaleDateString('de-DE',{weekday:'short'})}
              </div>
              <div style={{
                fontSize:'19px', fontWeight: isToday?'800':'400',
                color: isToday?'var(--accent)':'var(--text-1)', marginTop:'2px',
              }}>{d.getDate()}</div>
            </div>
          );
        })}
        {Array.from({length:DAY_END-DAY_START},(_,hi)=>{
          const h=DAY_START+hi;
          return [
            <div key={'t'+h} style={{height:HOUR_H+'px', fontSize:'10.5px', color:'var(--text-3)', textAlign:'right', padding:'3px 6px 0 0', borderBottom:'1px solid var(--border-light)', background:'var(--bg-subtle)', fontWeight:'500'}}>{h}:00</div>,
            ...days.map(d=>{
              const key=toKey(d);
              const evs=(AppData.events[key]||[]).filter(e=>{const[eh]=e.start.split(':').map(Number);return eh===h;});
              const isToday=key===todayKey;
              return (
                <div key={key+h} style={{
                  height:HOUR_H+'px', borderLeft:'1px solid var(--border)',
                  borderBottom:'1px solid var(--border-light)',
                  position:'relative', padding:'2px 4px',
                  background: isToday?'oklch(from var(--accent-bg) l c h / 0.5)':'transparent',
                }}>
                  {evs.map(ev=>{
                    const color=getColor(ev.classId);
                    const isSpecial=ev.type!=='lesson';
                    return (
                      <div key={ev.id} onClick={()=>onEventClick(ev)} style={{
                        background: isSpecial?'var(--bg-subtle)':`oklch(from ${color} l c h / 0.13)`,
                        borderLeft: isSpecial?'2px solid var(--border)':`2px solid ${color}`,
                        borderRadius:'var(--r-sm)', padding:'2px 6px', marginBottom:'2px',
                        fontSize:'11px', fontWeight:'600', color: isSpecial?'var(--text-3)':color,
                        cursor:'pointer', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis',
                      }}>{ev.title}</div>
                    );
                  })}
                </div>
              );
            }),
          ];
        })}
      </div>
    </div>
  );
}

// ── Month View ────────────────────────────────────────────────────────────
function MonthView({ date, onDayClick }) {
  const year=date.getFullYear(), month=date.getMonth();
  const firstDay=new Date(year,month,1);
  const startDow=firstDay.getDay()===0?6:firstDay.getDay()-1;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const todayKey='2026-04-28';
  const cells=[];
  for(let i=0;i<startDow;i++)cells.push(null);
  for(let d=1;d<=daysInMonth;d++)cells.push(new Date(year,month,d));
  while(cells.length%7!==0)cells.push(null);
  const weeks=[];
  for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));

  return (
    <div style={{padding:'16px 20px 24px', flex:1, overflowY:'auto'}}>
      <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-sm)'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid var(--border)'}}>
          {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=>(
            <div key={d} style={{padding:'10px 0', textAlign:'center', fontSize:'11px', fontWeight:'700', color:'var(--text-3)', letterSpacing:'0.05em'}}>{d}</div>
          ))}
        </div>
        {weeks.map((week,wi)=>(
          <div key={wi} style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:wi<weeks.length-1?'1px solid var(--border-light)':'none'}}>
            {week.map((d,di)=>{
              const key=d?toKey(d):null;
              const evs=key?(AppData.events[key]||[]).filter(e=>e.type==='lesson'):[];
              const isToday=key===todayKey;
              const isWknd=di>=5;
              return (
                <div key={di} onClick={()=>d&&onDayClick(d)} style={{
                  minHeight:'86px', padding:'8px 8px 6px',
                  borderLeft:di>0?'1px solid var(--border-light)':'none',
                  background: isToday?'var(--accent-bg)':isWknd?'var(--bg-subtle)':'var(--bg-card)',
                  cursor:d?'pointer':'default',
                  transition:'background 0.12s',
                }}
                  onMouseEnter={e=>{ if(d&&!isToday) e.currentTarget.style.background='var(--bg-hover)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=isToday?'var(--accent-bg)':isWknd?'var(--bg-subtle)':'var(--bg-card)'; }}
                >
                  {d&&<>
                    <div style={{
                      width:'26px',height:'26px',borderRadius:'50%',
                      background:isToday?'var(--accent)':'transparent',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:'13px',fontWeight:isToday?'700':'400',
                      color:isToday?'var(--accent-fg)':isWknd?'var(--text-3)':'var(--text-1)',
                      marginBottom:'4px',
                    }}>{d.getDate()}</div>
                    {evs.slice(0,3).map(ev=>(
                      <div key={ev.id} style={{
                        background:`oklch(from ${getColor(ev.classId)} l c h / 0.13)`,
                        borderLeft:`2px solid ${getColor(ev.classId)}`,
                        borderRadius:'var(--r-sm)',padding:'1px 5px',marginBottom:'2px',
                        fontSize:'10.5px',fontWeight:'600',color:getColor(ev.classId),
                        overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',
                      }}>{ev.title}</div>
                    ))}
                    {evs.length>3&&<div style={{fontSize:'10px',color:'var(--text-3)',fontWeight:'500'}}>+{evs.length-3} weitere</div>}
                  </>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Year View ─────────────────────────────────────────────────────────────
function YearView({ date, onMonthClick }) {
  const year=date.getFullYear();
  const monthNames=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const today=new Date('2026-04-28');

  return (
    <div style={{padding:'16px 20px 24px', flex:1, overflowY:'auto'}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px'}}>
        {monthNames.map((name,mi)=>{
          const firstDay=new Date(year,mi,1);
          const startDow=firstDay.getDay()===0?6:firstDay.getDay()-1;
          const daysInMonth=new Date(year,mi+1,0).getDate();
          const isCurrent=mi===today.getMonth()&&year===today.getFullYear();
          const cells=[];
          for(let i=0;i<startDow;i++)cells.push(null);
          for(let d=1;d<=daysInMonth;d++)cells.push(d);
          while(cells.length%7!==0)cells.push(null);
          return (
            <div key={mi} onClick={()=>onMonthClick(new Date(year,mi,1))} className="card-hover" style={{
              background:'var(--bg-card)', border:`1.5px solid ${isCurrent?'var(--accent)':'var(--border)'}`,
              borderRadius:'var(--r-lg)', padding:'14px', cursor:'pointer',
              boxShadow: isCurrent?'0 0 0 3px var(--accent-bg)':'var(--shadow-xs)',
            }}>
              <div style={{fontWeight:'700', fontSize:'12px', color:isCurrent?'var(--accent)':'var(--text-1)', marginBottom:'10px'}}>{name}</div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'1px'}}>
                {['M','D','M','D','F','S','S'].map((d,i)=>(
                  <div key={i} style={{fontSize:'8px',color:'var(--text-3)',textAlign:'center',paddingBottom:'3px',fontWeight:'600'}}>{d}</div>
                ))}
                {cells.map((d,i)=>{
                  const isToday=d&&mi===today.getMonth()&&d===today.getDate()&&year===today.getFullYear();
                  const key=d?toKey(new Date(year,mi,d)):null;
                  const hasEv=key&&AppData.events[key]&&AppData.events[key].some(e=>e.type==='lesson');
                  return (
                    <div key={i} style={{
                      fontSize:'9px',textAlign:'center',padding:'1px 0',
                      color:isToday?'var(--accent-fg)':d?'var(--text-2)':'transparent',
                      background:isToday?'var(--accent)':'transparent',
                      borderRadius:'50%',position:'relative',fontWeight:hasEv&&!isToday?'700':'400',
                    }}>
                      {d||''}
                      {hasEv&&!isToday&&<span style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:'3px',height:'3px',borderRadius:'50%',background:'var(--accent)',display:'block'}}/>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Event Modal ───────────────────────────────────────────────────────────
function EventModal({ ev, onClose }) {
  if(!ev)return null;
  const cls=ev.classId?getClass(ev.classId):null;
  const color=getColor(ev.classId);
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'var(--bg-modal)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(4px)'}}>
      <div onClick={e=>e.stopPropagation()} className="modal-enter" style={{
        background:'var(--bg-card)',borderRadius:'var(--r-xl)',padding:'28px',width:'390px',
        boxShadow:'var(--shadow-modal)', border:'1px solid var(--border)',
      }}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'18px'}}>
          <div>
            <div style={{fontSize:'21px',fontWeight:'800',color:'var(--text-1)',letterSpacing:'-0.3px'}}>{ev.title}</div>
            <div style={{fontSize:'13px',color:'var(--text-3)',marginTop:'3px',fontWeight:'500'}}>{ev.start} – {ev.end}</div>
          </div>
          <button onClick={onClose} style={{background:'var(--bg-subtle)',border:'none',cursor:'pointer',width:'28px',height:'28px',borderRadius:'var(--r-md)',color:'var(--text-3)',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
        {cls&&<div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'var(--r-md)',background:color,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 2px 8px ${color}44`}}>
            <span style={{color:'#fff',fontSize:'12px',fontWeight:'800'}}>{cls.name.slice(0,2).toUpperCase()}</span>
          </div>
          <div>
            <div style={{fontSize:'13.5px',fontWeight:'600',color:'var(--text-1)'}}>{cls.name} · {cls.subject}</div>
            <div style={{fontSize:'11.5px',color:'var(--text-3)'}}>{cls.students} Schüler:innen</div>
          </div>
        </div>}
        {ev.topic&&<div style={{background:'var(--accent-bg)',borderRadius:'var(--r-md)',padding:'11px 14px',marginBottom:'10px'}}>
          <div style={{fontSize:'10px',color:'var(--accent-text)',fontWeight:'700',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:'3px'}}>Thema</div>
          <div style={{fontSize:'13.5px',color:'var(--text-1)',fontWeight:'500'}}>{ev.topic}</div>
        </div>}
        {ev.room&&<div style={{fontSize:'13px',color:'var(--text-3)',fontWeight:'500'}}>📍 {ev.room}</div>}
      </div>
    </div>
  );
}

// ── Add Lesson Modal ──────────────────────────────────────────────────────
function AddLessonModal({ onClose }) {
  const [form,setForm]=useState({class:'',topic:'',room:'',start:'08:00',end:'09:30'});
  const iSt={width:'100%',padding:'9px 12px',borderRadius:'var(--r-md)',fontSize:'13px',border:'1px solid var(--border)',background:'var(--bg-input)',color:'var(--text-1)',boxSizing:'border-box'};
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'var(--bg-modal)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(4px)'}}>
      <div onClick={e=>e.stopPropagation()} className="modal-enter" style={{background:'var(--bg-card)',borderRadius:'var(--r-xl)',padding:'28px',width:'400px',boxShadow:'var(--shadow-modal)',border:'1px solid var(--border)'}}>
        <div style={{fontSize:'18px',fontWeight:'800',color:'var(--text-1)',letterSpacing:'-0.3px',marginBottom:'20px'}}>Stunde erstellen</div>
        {[{label:'Klasse',key:'class',type:'select'},{label:'Thema',key:'topic',type:'text'},{label:'Raum',key:'room',type:'text'},{label:'Von',key:'start',type:'time'},{label:'Bis',key:'end',type:'time'}].map(f=>(
          <div key={f.key} style={{marginBottom:'14px'}}>
            <label style={{fontSize:'11.5px',fontWeight:'700',color:'var(--text-3)',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{f.label}</label>
            {f.type==='select'
              ?<select value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={iSt}>
                <option value="">Klasse wählen…</option>
                {AppData.classes.map(c=><option key={c.id} value={c.name}>{c.name} – {c.subject}</option>)}
              </select>
              :<input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={iSt}/>
            }
          </div>
        ))}
        <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'22px'}}>
          <button onClick={onClose} style={{padding:'9px 18px',border:'1px solid var(--border)',background:'var(--bg-card)',borderRadius:'var(--r-md)',cursor:'pointer',fontSize:'13px',color:'var(--text-2)',fontWeight:'500'}}>Abbrechen</button>
          <button onClick={()=>{window.showToast('✓ Stunde erstellt');onClose();}} style={{padding:'9px 20px',background:'var(--accent)',color:'var(--accent-fg)',border:'none',borderRadius:'var(--r-md)',cursor:'pointer',fontSize:'13px',fontWeight:'700',boxShadow:'0 2px 8px oklch(from var(--accent) l c h / 0.35)'}}>Erstellen</button>
        </div>
      </div>
    </div>
  );
}

// ── CalendarView ──────────────────────────────────────────────────────────
function CalendarView({ calTab, onCalTabChange }) {
  const [date,setDate]=useState(new Date('2026-04-28'));
  const [selEvent,setSelEvent]=useState(null);
  const [addModal,setAddModal]=useState(false);
  const monthNames=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

  function headerTitle() {
    if(calTab==='today')return date.toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    if(calTab==='week'){
      const mon=new Date(date);const dow=mon.getDay()===0?6:mon.getDay()-1;mon.setDate(mon.getDate()-dow);
      const fri=addDays(mon,4);
      return `${mon.getDate()}. – ${fri.getDate()}. ${monthNames[fri.getMonth()]} ${fri.getFullYear()}`;
    }
    if(calTab==='month')return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    return date.getFullYear().toString();
  }

  function navigate(dir) {
    const d=new Date(date);
    if(calTab==='today')d.setDate(d.getDate()+dir);
    else if(calTab==='week')d.setDate(d.getDate()+dir*7);
    else if(calTab==='month')d.setMonth(d.getMonth()+dir);
    else d.setFullYear(d.getFullYear()+dir);
    setDate(d);
  }

  const NavBtn=({label,style={}})=>(
    <button style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',width:'30px',height:'30px',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)',transition:'background 0.12s, transform 0.1s',...style}}
      onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.transform='scale(1.1)';}}
      onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-card)';e.currentTarget.style.transform='none';}}
    >{label}</button>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{padding:'16px 24px 0',borderBottom:'1px solid var(--border)',background:'var(--bg-card)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <NavBtn label="‹" onClick={()=>navigate(-1)}/>
            <span style={{fontWeight:'700',fontSize:'16px',color:'var(--text-1)',letterSpacing:'-0.2px',minWidth:'260px'}}>{headerTitle()}</span>
            <NavBtn label="›" onClick={()=>navigate(1)}/>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <button onClick={()=>{setDate(new Date('2026-04-28'));onCalTabChange('today');}} style={{
              padding:'5px 14px',background:'var(--accent-bg)',border:'none',borderRadius:'var(--r-md)',
              fontSize:'12px',fontWeight:'700',color:'var(--accent-text)',cursor:'pointer',
            }}>Heute</button>
            <div style={{display:'flex',border:'1px solid var(--border)',borderRadius:'var(--r-md)',overflow:'hidden'}}>
              {[['today','Tag'],['week','Woche'],['month','Monat'],['year','Jahr']].map(([id,label])=>(
                <button key={id} onClick={()=>onCalTabChange(id)} style={{
                  padding:'6px 14px',fontSize:'12.5px',fontWeight:calTab===id?'700':'400',
                  background:calTab===id?'var(--accent)':'var(--bg-card)',
                  color:calTab===id?'var(--accent-fg)':'var(--text-2)',
                  border:'none',cursor:'pointer',
                  borderLeft:id!=='today'?'1px solid var(--border)':'none',
                  transition:'background 0.15s, color 0.15s',
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        {calTab==='today'&&<DayView date={date} onEventClick={setSelEvent} onAddLesson={()=>setAddModal(true)}/>}
        {calTab==='week' &&<WeekView date={date} onEventClick={setSelEvent}/>}
        {calTab==='month'&&<MonthView date={date} onDayClick={d=>{setDate(d);onCalTabChange('today');}}/>}
        {calTab==='year' &&<YearView date={date} onMonthClick={d=>{setDate(d);onCalTabChange('month');}}/>}
      </div>
      {selEvent&&<EventModal ev={selEvent} onClose={()=>setSelEvent(null)}/>}
      {addModal&&<AddLessonModal onClose={()=>setAddModal(false)}/>}
    </div>
  );
}

Object.assign(window,{CalendarView});
