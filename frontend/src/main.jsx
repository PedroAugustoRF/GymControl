import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, Dumbbell, LayoutDashboard, CalendarDays, ClipboardList, Settings2, Users,
  LogOut, Sun, Moon, Palette, ChevronDown, Plus, Search, Bell, Menu, X, ArrowUpRight,
  TrendingUp, Clock3, Target, HeartPulse, MoreHorizontal, Pencil, Trash2, Check,
  AlertCircle, CheckCircle2, LoaderCircle, ChevronRight, UserRound, ShieldCheck,
  Weight, Zap, SlidersHorizontal, Save, Eye, EyeOff, Mail, Lock, Hash, Phone,
  Calendar, Layers3, Filter, RefreshCw, CircleHelp, Dumbbell as DumbbellIcon
} from 'lucide-react'

const API = window.GYMCONTROL_API || ''
const TOKEN_KEY = 'gymcontrol_token'
const COLORS = [
  { id: 'red', name: 'Vermelho', value: '#e32636' },
  { id: 'orange', name: 'Laranja', value: '#f07818' },
  { id: 'amber', name: 'Âmbar', value: '#d6a000' },
  { id: 'lime', name: 'Lima', value: '#79b900' },
  { id: 'green', name: 'Verde', value: '#159447' },
  { id: 'teal', name: 'Turquesa', value: '#009b87' },
  { id: 'cyan', name: 'Ciano', value: '#008fbd' },
  { id: 'blue', name: 'Azul', value: '#245bdb' },
  { id: 'indigo', name: 'Índigo', value: '#5141c9' },
  { id: 'purple', name: 'Roxo', value: '#873fbd' },
  { id: 'magenta', name: 'Magenta', value: '#c32691' },
  { id: 'graphite', name: 'Grafite', value: '#697386' }
]
const DAYS = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO']
const DAY_LABEL = { SEGUNDA:'Segunda-feira', TERCA:'Terça-feira', QUARTA:'Quarta-feira', QUINTA:'Quinta-feira', SEXTA:'Sexta-feira', SABADO:'Sábado', DOMINGO:'Domingo' }
const MUSCLE = ['PEITO','COSTAS','OMBRO','BICEPS','TRICEPS','ANTEBRACO','ABDOMEN','QUADRICEPS','POSTERIOR_COXA','GLUTEO','PANTURRILHA']
const muscleLabel = v => ({PEITO:'Peito',COSTAS:'Costas',OMBRO:'Ombros',BICEPS:'Bíceps',TRICEPS:'Tríceps',ANTEBRACO:'Antebraço',ABDOMEN:'Abdômen',QUADRICEPS:'Quadríceps',POSTERIOR_COXA:'Posterior de coxa',GLUTEO:'Glúteos',PANTURRILHA:'Panturrilha'}[v] || v)

function readToken() { try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' } }
function tokenExpiry(token) { try { return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).exp * 1000 } catch { return 0 } }
function saveToken(token) { localStorage.setItem(TOKEN_KEY, token) }
function clearToken() { localStorage.removeItem(TOKEN_KEY) }

async function api(path, options = {}) {
  const token = readToken()
  const headers = { ...(options.body ? { 'Content-Type':'application/json' } : {}), ...(token ? { Authorization:`Bearer ${token}` } : {}), ...options.headers }
  let response
  try { response = await fetch(`${API}${path}`, { ...options, headers }) }
  catch { throw new Error('Não foi possível conectar à API. Verifique se o servidor está disponível.') }
  if (response.status === 401 && !path.startsWith('/auth/')) {
    clearToken(); window.dispatchEvent(new Event('gym-session-expired'))
    throw new Error('Sua sessão expirou. Entre novamente.')
  }
  if (!response.ok) {
    let message = `Erro ${response.status}. Não foi possível concluir a operação.`
    try { const data = await response.json(); message = data.detail || data.message || data.error || data.mensagem || message } catch {}
    throw new Error(message)
  }
  if (response.status === 204) return null
  const raw = await response.text()
  return raw ? JSON.parse(raw) : null
}
const send = (path, method, data) => api(path, { method, body: JSON.stringify(data) })

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('overview')
  const [theme, setTheme] = useState(() => localStorage.getItem('gc_theme') || 'dark')
  const [accent, setAccent] = useState(() => localStorage.getItem('gc_accent') || 'red')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState(null)
  const [data, setData] = useState({ treinos:[], exercicios:[], maquinas:[], users:[] })
  const [refreshing, setRefreshing] = useState(false)
  const isAdmin = user?.role === 'ADM'
  const isProfessor = user?.role === 'PROF'
  const isStudent = user?.role === 'USER'
  const canManageWorkouts = isAdmin || isProfessor
  const canManageMachines = isAdmin || isProfessor

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    const hex = COLORS.find(c => c.id === accent)?.value || COLORS[0].value
    const rgb = hex.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16)).join(',')
    root.style.setProperty('--accent', hex)
    root.style.setProperty('--accent-rgb', rgb)
    const stone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420"><g fill="none" stroke="${hex}" stroke-opacity=".28" stroke-width="1.35"><path d="M-25 35 22 17 61 31 105 8 149 29 195 11 238 34 281 13 326 37 370 16 445 39M-30 91 15 73 54 90 99 65 143 87 187 69 232 92 276 70 321 93 365 74 450 98M-22 151 19 128 65 149 108 122 151 147 199 126 242 153 286 130 331 153 378 131 445 158M-30 211 13 187 58 207 102 181 148 205 194 183 239 210 284 187 329 212 373 190 450 218M-24 270 20 244 63 266 109 239 153 264 198 242 245 269 289 245 335 270 378 249 450 276M-28 329 17 303 62 325 106 298 153 325 197 300 242 329 287 303 332 330 377 306 450 337M-20 388 25 362 69 384 114 357 158 384 204 360 249 388 293 364 338 389 383 366 450 395"/><path d="m22 17 5 56 34-42 38 34 6-57 44 58 46-54 43 57 43-55 45 57 45-54 44 58M15 73l4 55 46 21 43-27 43 25 48-21 43 27 44-23 45 23 47-22 44 27M19 128l-6 59 45 20 44-26 46 24 46-22 45 27 45-23 45 25 47-22 46 28M13 187l7 57 43 22 46-27 44 25 45-22 47 27 44-24 46 25 45-21 70 27M20 244l-3 59 45 22 47-27 44 27 44-25 48 29 44-26 46 27 43-24 75 30"/></g></svg>`
    root.style.setProperty('--texture', `url("data:image/svg+xml,${encodeURIComponent(stone)}")`)
    localStorage.setItem('gc_theme', theme); localStorage.setItem('gc_accent', accent)
  }, [theme, accent])

  const notify = useCallback((message, type='success') => {
    setToast({ message, type }); window.clearTimeout(notify.timer)
    notify.timer = window.setTimeout(() => setToast(null), 3800)
  }, [])
  const logout = useCallback(() => { clearToken(); setUser(null); setData({treinos:[],exercicios:[],maquinas:[],users:[]}); setPage('overview') }, [])

  const loadData = useCallback(async (currentUser = user) => {
    if (!currentUser) return
    setRefreshing(true)
    try {
      if (currentUser.role === 'USER') {
        const treinos = await api('/treinos')
        setData({ treinos: treinos || [], exercicios: [], maquinas: [], users: [] })
      } else {
        const [treinos, exercicios, maquinas] = await Promise.all([
          api('/treinos'), api('/exercicios'), api('/maquinas')
        ])
        const users = currentUser.role === 'ADM' ? await api('/users') : (await api('/users/alunos')).map(u => ({ ...u, role:'USER' }))
        setData({ treinos: treinos || [], exercicios: exercicios || [], maquinas: maquinas || [], users: users || [] })
      }
    } catch (error) { notify(error.message, 'error') }
    finally { setRefreshing(false) }
  }, [user, notify])

  useEffect(() => {
    const onExpired = () => { setUser(null); notify('Sua sessão expirou. Entre novamente.', 'error') }
    window.addEventListener('gym-session-expired', onExpired)
    const token = readToken()
    if (!token || tokenExpiry(token) < Date.now()) { clearToken(); setLoading(false) }
    else api('/users/me').then(u => { setUser(u); setPage(u.role==='USER'?'treinos':'overview'); return loadData(u) }).catch(() => clearToken()).finally(() => setLoading(false))
    return () => window.removeEventListener('gym-session-expired', onExpired)
  }, [])

  useEffect(() => {
    if (!user) return
    const exp = tokenExpiry(readToken())
    const timer = window.setTimeout(() => { logout(); notify('Sua sessão expirou. Entre novamente.', 'error') }, Math.max(0, exp - Date.now()))
    return () => window.clearTimeout(timer)
  }, [user, logout, notify])

  const onLogin = async token => {
    saveToken(token)
    const current = await api('/users/me')
    setUser(current); setPage(current.role==='USER'?'treinos':'overview'); await loadData(current)
  }
  const changePage = p => { setPage(p); setMobileNav(false) }

  if (loading) return <div className="screen-loader"><div className="brand-mark"><Activity /></div><LoaderCircle className="spin" size={22}/><span>Preparando seu espaço</span></div>
  if (!user) return <AuthScreen onLogin={onLogin} theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} notify={notify} />

  const nav = isStudent ? [
    { id:'treinos', label:'Treino do dia', icon:CalendarDays, group:'workspace' }
  ] : [
    { id:'overview', label:'Visão geral', icon:LayoutDashboard, group:'workspace' },
    { id:'treinos', label:'Treinos', icon:CalendarDays, group:'workspace' },
    { id:'exercicios', label:'Exercícios', icon:ClipboardList, group:'management' },
    { id:'maquinas', label:'Máquinas', icon:Dumbbell, group:'management' },
    ...(isAdmin ? [{id:'usuarios',label:'Usuários',icon:Users,group:'admin'}] : []),
    { id:'perfil', label:'Meu perfil', icon:UserRound, group:'account' }
  ]
  useEffect(() => { if (isStudent && page !== 'treinos') setPage('treinos') }, [isStudent, page])
  return <div className="app-shell">
    {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Fechar menu"/>}
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="sidebar-brand"><div className="brand-mark"><Activity size={22}/></div><div><strong>GYM<span>CONTROL</span></strong><small>TRAINING MANAGEMENT</small></div><button className="mobile-close icon-button" onClick={() => setMobileNav(false)}><X/></button></div>
      <div className="sidebar-user"><div className="avatar">{(user.nome || user.email || 'U').slice(0,1).toUpperCase()}</div><div className="sidebar-user-info"><strong>{user.nome || 'Usuário'}</strong><span>{isAdmin?'Administrador':isProfessor?'Professor':'Aluno'}</span></div><span className="online-dot"/></div>
      <nav className="nav-list">
        <NavGroup title="PAINEL" items={nav.filter(n=>n.group==='workspace')} page={page} changePage={changePage}/>
        {!isStudent && <NavGroup title="GESTÃO" items={nav.filter(n=>n.group==='management')} page={page} changePage={changePage}/>}
        {isAdmin && <NavGroup title="ADMINISTRAÇÃO" items={nav.filter(n=>n.group==='admin')} page={page} changePage={changePage}/>}
        {!isStudent && <NavGroup title="CONTA" items={nav.filter(n=>n.group==='account')} page={page} changePage={changePage}/>}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><Zap size={17}/><div><strong>Consistência gera resultado.</strong><span>Um treino de cada vez.</span></div></div><button className="logout-button" onClick={logout}><LogOut size={17}/> Sair da conta</button><span className="sidebar-version">GYMCONTROL · 1.0</span></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={()=>setMobileNav(true)}><Menu/></button><div className="breadcrumb"><span>GymControl</span><ChevronRight size={14}/><strong>{nav.find(n=>n.id===page)?.label || 'Visão geral'}</strong></div></div><div className="topbar-actions"><span className="today-label">{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}</span><button className="icon-button" title="Atualizar dados" onClick={()=>loadData()}><RefreshCw size={17} className={refreshing?'spin':''}/></button><div className="settings-wrap"><button className="icon-button" title="Aparência" onClick={()=>setSettingsOpen(v=>!v)}><SlidersHorizontal size={18}/></button>{settingsOpen&&<AppearancePanel theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} close={()=>setSettingsOpen(false)}/>}</div><div className="topbar-avatar" title={user.nome}>{(user.nome||user.email).slice(0,1).toUpperCase()}</div></div></header>
      <div className="page-content">
        {page==='overview'&&<Overview user={user} data={data} changePage={changePage}/>}
        {page==='treinos'&&<Workouts data={data} reload={loadData} notify={notify} user={user}/>}
        {page==='exercicios'&&<Exercises data={data} reload={loadData} notify={notify} isAdmin={isAdmin}/>}
        {page==='maquinas'&&<Machines data={data} reload={loadData} notify={notify} canManage={canManageMachines}/>}
        {page==='usuarios'&&isAdmin&&<UsersPage data={data} reload={loadData} notify={notify} me={user}/>}
        {page==='perfil'&&!isStudent&&<Profile user={user} isAdmin={isAdmin} onUpdate={async updated=>{setUser(updated);notify('Perfil atualizado.')}} notify={notify}/>}
      </div>
      <footer className="footer"><span>GYMCONTROL <i>·</i> Seu treino, sob controle.</span><span>FEITO PARA EVOLUIR <Activity size={13}/></span></footer>
    </main>
    {toast&&<div className={`toast ${toast.type}`}><span className="toast-icon">{toast.type==='error'?<AlertCircle size={18}/>:<CheckCircle2 size={18}/>}</span>{toast.message}<button onClick={()=>setToast(null)}><X size={15}/></button></div>}
  </div>
}

function NavGroup({title,items,page,changePage}) { return <div className="nav-group"><span className="nav-group-title">{title}</span>{items.map(item=><button key={item.id} onClick={()=>changePage(item.id)} className={`nav-item ${page===item.id?'active':''}`}><item.icon size={18}/><span>{item.label}</span>{page===item.id&&<span className="nav-active-mark"/>}</button>)}</div> }

function AppearancePanel({theme,setTheme,accent,setAccent,close}) { return <div className="appearance-panel"><div className="panel-heading"><strong>Aparência</strong><button className="icon-button" onClick={close}><X size={16}/></button></div><span className="setting-label">TEMA</span><div className="theme-choices"><button className={theme==='dark'?'selected':''} onClick={()=>setTheme('dark')}><Moon size={17}/>Escuro</button><button className={theme==='light'?'selected':''} onClick={()=>setTheme('light')}><Sun size={17}/>Claro</button></div><span className="setting-label">COR DE DESTAQUE</span><div className="color-grid">{COLORS.map(c=><button key={c.id} title={c.name} aria-label={c.name} className={accent===c.id?'chosen':''} style={{'--swatch':c.value}} onClick={()=>setAccent(c.id)}>{accent===c.id&&<Check size={15}/>}</button>)}</div><p className="panel-note">A textura do painel acompanha a cor selecionada.</p></div> }

function AuthScreen({onLogin,theme,setTheme,accent,setAccent,notify}) {
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[showPassword,setShowPassword]=useState(false)
  const submit=async e=>{e.preventDefault();setBusy(true);try{const result=await send('/auth/login','POST',{email:email.trim(),password});await onLogin(result.token)}catch(err){notify(err.message,'error')}finally{setBusy(false)}}
  return <div className="auth-screen"><div className="auth-texture"/><div className="auth-top"><div className="sidebar-brand"><div className="brand-mark"><Activity/></div><div><strong>GYM<span>CONTROL</span></strong><small>TRAINING MANAGEMENT</small></div></div><div className="auth-tools"><button className="auth-theme" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}<span>{theme==='dark'?'Modo claro':'Modo escuro'}</span></button><button className="auth-theme" onClick={()=>document.getElementById('auth-colors')?.classList.toggle('show')}><Palette size={17}/><span>Cor</span></button><div id="auth-colors" className="auth-color-pop">{COLORS.map(c=><button key={c.id} style={{background:c.value}} onClick={()=>setAccent(c.id)} aria-label={c.name}/>)}</div></div></div>
    <div className="auth-layout"><section className="auth-hero"><span className="eyebrow"><span/> PERFORMANCE, ORGANIZAÇÃO E EVOLUÇÃO</span><h1>SEU PRÓXIMO<br/>NÍVEL COMEÇA<br/><em>NO TREINO.</em></h1><p>Organize sua rotina, acompanhe seus exercícios e mantenha o foco no que realmente importa: sua evolução.</p><div className="auth-stats"><div><strong>01</strong><span>PLANEJE</span></div><div><strong>02</strong><span>EXECUTE</span></div><div><strong>03</strong><span>EVOLUA</span></div></div><div className="hero-watermark">GC<span>.</span></div></section>
    <section className="auth-card-wrap"><div className="auth-card"><div className="auth-card-kicker">ÁREA DE ACESSO</div><h2>Bem-vindo ao GymControl.</h2><p className="auth-description">Entre com os dados da conta fornecida pela administração.</p><form onSubmit={submit} className="auth-form"><FormField label="E-mail" icon={Mail}><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="voce@email.com"/></FormField><FormField label="Senha" icon={Lock}><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Sua senha"/><button type="button" className="password-toggle" onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></FormField><button className="primary-button auth-submit" disabled={busy}>{busy?<LoaderCircle className="spin" size={18}/>:null}ENTRAR NO PAINEL<ArrowUpRight size={18}/></button></form><div className="auth-security"><ShieldCheck size={15}/> ACESSO PROTEGIDO POR AUTENTICAÇÃO</div></div></section></div><div className="auth-bottom"><span>GYMCONTROL © {new Date().getFullYear()}</span><span>DISCIPLINA CONSTRÓI RESULTADOS.</span></div></div>
}

function FormField({label,icon:Icon,children}) { return <label className="form-field"><span>{label}</span><div className="form-input-wrap"><Icon size={17}/>{children}</div></label> }

function PageHeading({eyebrow,title,description,action}) { return <div className="page-heading"><div><span className="eyebrow"><span/>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div> }
function StatCard({label,value,detail,icon:Icon,trend}) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={19}/></div></div><div className="stat-value">{value}</div><div className="stat-detail">{trend&&<span className="stat-trend"><TrendingUp size={13}/>{trend}</span>}{detail}</div></div> }

function Overview({user,data,changePage}) {
  const totalExercises=data.exercicios.length, totalWorkouts=data.treinos.length, totalMachines=data.maquinas.length
  const recent=[...data.treinos].sort((a,b)=>(b.id||0)-(a.id||0)).slice(0,4)
  const counts=data.treinos.reduce((acc,t)=>{acc[t.diaSemana]=(acc[t.diaSemana]||0)+1;return acc},{})
  const maxCount=Math.max(1,...Object.values(counts))
  return <><PageHeading eyebrow="SEU CENTRO DE COMANDO" title={<>Olá, {user.nome?.split(' ')[0]||'atleta'}<span className="title-period">.</span></>} description="Acompanhe sua rotina e mantenha o ritmo da evolução." action={<button className="primary-button" onClick={()=>changePage('treinos')}><Plus size={17}/> NOVO TREINO</button>}/><div className="welcome-strip"><div className="welcome-copy"><span>FOCO NO PROCESSO</span><h2>Resultado é consequência.<br/><em>Consistência é escolha.</em></h2><p>Seu espaço para planejar, registrar e evoluir a cada sessão.</p></div><div className="welcome-art"><div className="art-ring ring-one"/><div className="art-ring ring-two"/><Dumbbell size={112} strokeWidth={1.1}/><span>TRAIN<br/>HARD</span></div><div className="welcome-index">GC / 001</div></div><div className="stats-grid"><StatCard label="TREINOS CADASTRADOS" value={totalWorkouts.toString().padStart(2,'0')} detail="na sua rotina" icon={CalendarDays}/><StatCard label="EXERCÍCIOS DISPONÍVEIS" value={totalExercises.toString().padStart(2,'0')} detail="no catálogo" icon={Target}/><StatCard label="MÁQUINAS" value={totalMachines.toString().padStart(2,'0')} detail="cadastradas" icon={Dumbbell}/><StatCard label="EXERCÍCIOS PLANEJADOS" value={data.treinos.reduce((s,t)=>s+(t.itens?.length||0),0).toString().padStart(2,'0')} detail="em todos os treinos" icon={Activity}/></div><div className="overview-grid"><section className="panel week-panel"><div className="panel-header"><div><span className="section-kicker">DISTRIBUIÇÃO</span><h3>Treinos na semana</h3></div><span className="panel-tag">VISÃO GERAL</span></div><div className="week-bars">{DAYS.map(day=>{const value=counts[day]||0;return <div className="week-bar-col" key={day}><span className="bar-number">{value||''}</span><div className="bar-track"><div className="bar-fill" style={{height:`${value?Math.max(10,value/maxCount*100):3}%`}}/></div><span className="bar-day">{day.slice(0,3)}</span></div>})}</div><div className="week-foot"><span><i/> Treinos cadastrados</span><strong>{totalWorkouts} NO TOTAL</strong></div></section><section className="panel recent-panel"><div className="panel-header"><div><span className="section-kicker">ATIVIDADE</span><h3>Treinos recentes</h3></div><button className="text-action" onClick={()=>changePage('treinos')}>Ver todos <ArrowUpRight size={15}/></button></div>{recent.length===0?<EmptyState icon={CalendarDays} title="Sua rotina começa aqui" text="Cadastre seu primeiro treino para visualizar sua semana."/>:<div className="recent-list">{recent.map(t=><div className="recent-item" key={t.id}><div className="recent-day-icon"><CalendarDays size={18}/></div><div className="recent-item-main"><strong>{DAY_LABEL[t.diaSemana]||t.diaSemana}</strong><span>{t.itens?.length||0} exercícios · Treino #{t.id}</span></div><span className="recent-status">CADASTRADO</span><ChevronRight size={16}/></div>)}</div>}</section></div><div className="quick-actions"><div><span className="section-kicker">ACESSO RÁPIDO</span><h3>O que vamos organizar hoje?</h3></div><button onClick={()=>changePage('exercicios')}><ClipboardList/><span><strong>Exercícios</strong><small>Consultar catálogo</small></span><ArrowUpRight/></button><button onClick={()=>changePage('maquinas')}><Dumbbell/><span><strong>Máquinas</strong><small>Ver equipamentos</small></span><ArrowUpRight/></button></div></>
}

function EmptyState({icon:Icon,title,text,action}) { return <div className="empty-state"><div><Icon size={23}/></div><strong>{title}</strong><p>{text}</p>{action}</div> }
function Modal({title,subtitle,onClose,children,wide=false}) { return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={`modal ${wide?'modal-wide':''}`}><div className="modal-header"><div><span className="section-kicker">GYMCONTROL / FORMULÁRIO</span><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose}><X/></button></div>{children}</div></div> }
function Field({label,children,hint}) { return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label> }
function FormActions({onCancel,busy,label='Salvar'}) { return <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancelar</button><button className="primary-button" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<Save size={16}/>} {label}</button></div> }
function ConfirmDelete({item,onClose,onConfirm,busy}) { return <Modal title="Excluir registro" subtitle="Essa ação não pode ser desfeita." onClose={onClose}><p className="confirm-copy">Tem certeza de que deseja excluir <strong>{item}</strong>?</p><div className="form-actions"><button className="secondary-button" onClick={onClose}>Cancelar</button><button className="danger-button" onClick={onConfirm} disabled={busy}>{busy?<LoaderCircle className="spin" size={16}/>:<Trash2 size={16}/>} Excluir</button></div></Modal> }

function Workouts({data,reload,notify,user}) {
  const isAdmin=user.role==='ADM', isProfessor=user.role==='PROF', isStudent=user.role==='USER'
  const canManage=isAdmin||isProfessor
  const [modal,setModal]=useState(false),[editing,setEditing]=useState(null),[deleting,setDeleting]=useState(null),[busy,setBusy]=useState(false),[search,setSearch]=useState('')
  const blankItem=()=>({exercicioId:'',series:3,repeticoes:12,carga:0,ordem:1})
  const [day,setDay]=useState('SEGUNDA'),[items,setItems]=useState([blankItem()]),[alunoId,setAlunoId]=useState('')
  const today=['DOMINGO','SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO'][new Date().getDay()]
  const open=(t=null)=>{setEditing(t);setDay(t?.diaSemana||'SEGUNDA');setAlunoId(t?.alunoId&&t.alunoId!==user.id?String(t.alunoId):'');setItems(t?.itens?.length?t.itens.map((i,index)=>({exercicioId:String(data.exercicios.find(e=>e.nome===i.exercicio)?.id||''),series:i.series,repeticoes:i.repeticoes,carga:i.carga,ordem:i.ordem??index+1})): [blankItem()]);setModal(true)}
  const updateItem=(index,key,value)=>setItems(old=>old.map((it,i)=>i===index?{...it,[key]:value}:it))
  const submit=async e=>{e.preventDefault();if(items.some(i=>!i.exercicioId)){notify('Selecione um exercício para cada item.','error');return}setBusy(true);try{const payload={diaSemana:day,alunoId:alunoId?Number(alunoId):null,itens:items.map((i,index)=>({exercicioId:Number(i.exercicioId),series:Number(i.series),repeticoes:Number(i.repeticoes),carga:Number(i.carga),ordem:index+1}))};if(editing)await send(`/treinos/${editing.id}`,'PUT',payload);else await send('/treinos','POST',payload);notify(editing?'Treino atualizado.':'Treino cadastrado.');setModal(false);await reload()}catch(err){notify(err.message,'error')}finally{setBusy(false)}}
  const remove=async()=>{setBusy(true);try{await api(`/treinos/${deleting.id}`,{method:'DELETE'});notify('Treino excluído.');setDeleting(null);await reload()}catch(e){notify(e.message,'error')}finally{setBusy(false)}}
  const visible=data.treinos.filter(t=>!isStudent||t.diaSemana===today)
  const filtered=visible.filter(t=>(DAY_LABEL[t.diaSemana]||t.diaSemana).toLowerCase().includes(search.toLowerCase())||String(t.id).includes(search)||(t.alunoNome||'').toLowerCase().includes(search.toLowerCase()))
  return <><PageHeading eyebrow={isStudent?'ROTINA DE HOJE':'PLANEJAMENTO'} title={isStudent?'Meu treino de hoje':'Treinos'} description={isStudent?'Confira os exercícios programados para hoje.':isProfessor?'Consulte os treinos dos alunos e monte novas rotinas.':'Gerencie os treinos cadastrados na academia.'} action={canManage&&<button className="primary-button" onClick={()=>open()}><Plus size={17}/> CRIAR TREINO</button>}/>{!isStudent&&<div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por dia, aluno ou código..."/></div><span className="result-count">{filtered.length} {filtered.length===1?'treino':'treinos'}</span></div>}{filtered.length===0?<div className="panel empty-panel"><EmptyState icon={CalendarDays} title={isStudent?'Nenhum treino para hoje':'Nenhum treino encontrado'} text={isStudent?'Não há exercícios programados para hoje.':'Crie um treino para começar a organizar a rotina.'} action={canManage&&<button className="primary-button" onClick={()=>open()}><Plus size={16}/> Criar treino</button>}/></div>:<div className="workout-grid">{filtered.map(t=><article className="workout-card" key={t.id}><div className="workout-card-top"><span className="workout-id">TREINO / {String(t.id).padStart(3,'0')}</span>{canManage&&<div className="card-actions"><button className="icon-button" onClick={()=>open(t)} title="Editar"><Pencil size={16}/></button><button className="icon-button danger-hover" onClick={()=>setDeleting(t)} title="Excluir"><Trash2 size={16}/></button></div>}</div><div className="workout-day"><div className="workout-day-icon"><CalendarDays size={21}/></div><div><span>{t.alunoNome&&t.alunoId!==user.id?'RESPONSÁVEL':'DIA DE TREINO'}</span><h3>{DAY_LABEL[t.diaSemana]||t.diaSemana}</h3>{t.alunoNome&&t.alunoId!==user.id&&<small>{t.alunoNome}</small>}</div></div><div className="workout-divider"/><div className="workout-card-meta"><span><ClipboardList size={15}/>{t.itens?.length||0} exercícios</span><span><Clock3 size={15}/>Rotina semanal</span></div><div className="workout-exercises">{(t.itens||[]).slice(0,3).map((i,index)=><div key={i.id||index}><span>{String(index+1).padStart(2,'0')}</span>{i.exercicio}<small>{i.series} × {i.repeticoes}</small></div>)}{(t.itens||[]).length>3&&<span className="more-exercises">+ {(t.itens||[]).length-3} exercícios</span>}</div></article>)}</div>}{modal&&<Modal title={editing?'Editar treino':'Novo treino'} subtitle="Defina o aluno, o dia e os exercícios da sessão." onClose={()=>setModal(false)} wide><form onSubmit={submit}><div className="form-grid">{canManage&&<Field label="Aluno (opcional)"><select value={alunoId} onChange={e=>setAlunoId(e.target.value)}><option value="">Treino para mim</option>{data.users.filter(u=>isAdmin || u.role==='USER').map(u=><option key={u.id} value={u.id}>{u.nome} · {u.role==='PROF'?'Professor':u.role==='ADM'?'Administrador':'Aluno'}</option>)}</select></Field>}<Field label="Dia da semana"><select value={day} onChange={e=>setDay(e.target.value)}>{DAYS.map(d=><option key={d} value={d}>{DAY_LABEL[d]}</option>)}</select></Field></div><div className="items-heading"><div><span className="section-kicker">COMPOSIÇÃO DO TREINO</span><h3>Exercícios <b>{items.length}</b></h3></div><button type="button" className="secondary-button compact" onClick={()=>setItems(old=>[...old,blankItem()])}><Plus size={15}/> Adicionar exercício</button></div>{items.map((item,index)=><div className="exercise-form-row" key={index}><div className="exercise-row-number">{String(index+1).padStart(2,'0')}</div><div className="exercise-row-fields"><Field label="Exercício"><select value={item.exercicioId} onChange={e=>updateItem(index,'exercicioId',e.target.value)} required><option value="">Selecione...</option>{data.exercicios.map(ex=><option key={ex.id} value={ex.id}>{ex.nome} · {muscleLabel(ex.agrupamento)}</option>)}</select></Field><Field label="Séries"><input type="number" min="1" value={item.series} onChange={e=>updateItem(index,'series',e.target.value)} required/></Field><Field label="Repetições"><input type="number" min="1" value={item.repeticoes} onChange={e=>updateItem(index,'repeticoes',e.target.value)} required/></Field><Field label="Carga (kg)"><input type="number" min="0" step="0.5" value={item.carga} onChange={e=>updateItem(index,'carga',e.target.value)} required/></Field></div>{items.length>1&&<button type="button" className="remove-item" onClick={()=>setItems(old=>old.filter((_,i)=>i!==index))}><X size={16}/></button>}</div>)}{data.exercicios.length===0&&<p className="inline-warning">Ainda não existem exercícios cadastrados no catálogo.</p>}<FormActions onCancel={()=>setModal(false)} busy={busy} label={editing?'Salvar alterações':'Criar treino'}/></form></Modal>}{deleting&&<ConfirmDelete item={`Treino de ${DAY_LABEL[deleting.diaSemana]||deleting.diaSemana}`} onClose={()=>setDeleting(null)} onConfirm={remove} busy={busy}/>}</>
}

function Exercises({data,reload,notify,isAdmin}) {
  const [modal,setModal]=useState(false),[editing,setEditing]=useState(null),[deleting,setDeleting]=useState(null),[busy,setBusy]=useState(false),[search,setSearch]=useState(''),[group,setGroup]=useState('TODOS')
  const [form,setForm]=useState({nome:'',agrupamento:'PEITO',maquinaId:''})
  const open=(item=null)=>{setEditing(item);setForm(item?{nome:item.nome,agrupamento:item.agrupamento,maquinaId:String(data.maquinas.find(m=>m.nome===item.maquina)?.id||'')}:{nome:'',agrupamento:'PEITO',maquinaId:''});setModal(true)}
  const submit=async e=>{e.preventDefault();setBusy(true);try{const payload={nome:form.nome.trim(),agrupamento:form.agrupamento,maquinaId:form.maquinaId?Number(form.maquinaId):null};if(editing)await send(`/exercicios/${editing.id}`,'PUT',payload);else await send('/exercicios','POST',payload);notify(editing?'Exercício atualizado.':'Exercício cadastrado.');setModal(false);await reload()}catch(err){notify(err.message,'error')}finally{setBusy(false)}}
  const remove=async()=>{setBusy(true);try{await api(`/exercicios/${deleting.id}`,{method:'DELETE'});notify('Exercício excluído.');setDeleting(null);await reload()}catch(e){notify(e.message,'error')}finally{setBusy(false)}}
  const filtered=data.exercicios.filter(i=>(group==='TODOS'||i.agrupamento===group)&&`${i.nome} ${i.maquina||''}`.toLowerCase().includes(search.toLowerCase()))
  return <><PageHeading eyebrow="BIBLIOTECA DE MOVIMENTOS" title="Exercícios" description="Consulte os movimentos disponíveis e seus agrupamentos musculares." action={isAdmin&&<button className="primary-button" onClick={()=>open()}><Plus size={17}/> NOVO EXERCÍCIO</button>}/><div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar exercício..."/></div><div className="filter-wrap"><Filter size={16}/><select value={group} onChange={e=>setGroup(e.target.value)}><option value="TODOS">Todos os grupos</option>{MUSCLE.map(m=><option key={m} value={m}>{muscleLabel(m)}</option>)}</select></div><span className="result-count">{filtered.length} resultados</span></div>{filtered.length===0?<div className="panel empty-panel"><EmptyState icon={ClipboardList} title="Nenhum exercício encontrado" text="Ajuste os filtros ou cadastre um novo movimento." action={isAdmin&&<button className="primary-button" onClick={()=>open()}><Plus size={16}/> Novo exercício</button>}/></div>:<div className="catalog-grid">{filtered.map((ex,index)=><article className="catalog-card" key={ex.id}><div className="catalog-card-top"><span className="catalog-number">EX / {String(ex.id).padStart(3,'0')}</span><div className="catalog-symbol"><Activity size={20}/></div></div><h3>{ex.nome}</h3><span className="muscle-chip">{muscleLabel(ex.agrupamento)}</span><div className="catalog-card-bottom"><span><Dumbbell size={14}/>{ex.maquina||'Peso livre / sem máquina'}</span>{isAdmin&&<div className="card-actions"><button className="icon-button" onClick={()=>open(ex)}><Pencil size={15}/></button><button className="icon-button danger-hover" onClick={()=>setDeleting(ex)}><Trash2 size={15}/></button></div>}</div></article>)}</div>}{modal&&<Modal title={editing?'Editar exercício':'Cadastrar exercício'} subtitle="Adicione um movimento ao catálogo da academia." onClose={()=>setModal(false)}><form onSubmit={submit} className="modal-form"><Field label="Nome do exercício"><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} required placeholder="Ex.: Supino reto"/></Field><Field label="Agrupamento muscular"><select value={form.agrupamento} onChange={e=>setForm({...form,agrupamento:e.target.value})}>{MUSCLE.map(m=><option key={m} value={m}>{muscleLabel(m)}</option>)}</select></Field><Field label="Máquina / equipamento"><select value={form.maquinaId} onChange={e=>setForm({...form,maquinaId:e.target.value})}><option value="">Sem máquina vinculada</option>{data.maquinas.map(m=><option key={m.id} value={m.id}>{m.nome}</option>)}</select></Field><FormActions onCancel={()=>setModal(false)} busy={busy} label={editing?'Salvar alterações':'Cadastrar exercício'}/></form></Modal>}{deleting&&<ConfirmDelete item={deleting.nome} onClose={()=>setDeleting(null)} onConfirm={remove} busy={busy}/>}</>
}

function Machines({data,reload,notify,canManage}) {
  const [modal,setModal]=useState(false),[editing,setEditing]=useState(null),[deleting,setDeleting]=useState(null),[busy,setBusy]=useState(false),[search,setSearch]=useState(''),[form,setForm]=useState({nome:'',fabricante:''})
  const open=m=>{setEditing(m||null);setForm(m?{nome:m.nome,fabricante:m.fabricante||''}:{nome:'',fabricante:''});setModal(true)}
  const submit=async e=>{e.preventDefault();setBusy(true);try{const payload={nome:form.nome.trim(),fabricante:form.fabricante.trim()||null};if(editing)await send(`/maquinas/${editing.id}`,'PUT',payload);else await send('/maquinas','POST',payload);notify(editing?'Máquina atualizada.':'Máquina cadastrada.');setModal(false);await reload()}catch(err){notify(err.message,'error')}finally{setBusy(false)}}
  const remove=async()=>{setBusy(true);try{await api(`/maquinas/${deleting.id}`,{method:'DELETE'});notify('Máquina excluída.');setDeleting(null);await reload()}catch(e){notify(e.message,'error')}finally{setBusy(false)}}
  const filtered=data.maquinas.filter(m=>`${m.nome} ${m.fabricante||''}`.toLowerCase().includes(search.toLowerCase()))
  return <><PageHeading eyebrow="ESTRUTURA DA ACADEMIA" title="Máquinas" description="Gerencie os equipamentos e fabricantes disponíveis." action={canManage&&<button className="primary-button" onClick={()=>open()}><Plus size={17}/> NOVA MÁQUINA</button>}/><div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar equipamento..."/></div><span className="result-count">{filtered.length} equipamentos</span></div>{filtered.length===0?<div className="panel empty-panel"><EmptyState icon={Dumbbell} title="Nenhuma máquina encontrada" text="Os equipamentos cadastrados aparecerão aqui." action={canManage&&<button className="primary-button" onClick={()=>open()}><Plus size={16}/> Nova máquina</button>}/></div>:<div className="machine-grid">{filtered.map(m=><article className="machine-card" key={m.id}><div className="machine-visual"><Dumbbell size={34}/><span>EQ / {String(m.id).padStart(3,'0')}</span></div><div className="machine-info"><h3>{m.nome}</h3><p>{m.fabricante||'Fabricante não informado'}</p></div>{canManage&&<div className="card-actions"><button className="icon-button" onClick={()=>open(m)}><Pencil size={15}/></button><button className="icon-button danger-hover" onClick={()=>setDeleting(m)}><Trash2 size={15}/></button></div>}</article>)}</div>}{modal&&<Modal title={editing?'Editar máquina':'Cadastrar máquina'} subtitle="Registre um equipamento no catálogo." onClose={()=>setModal(false)}><form onSubmit={submit} className="modal-form"><Field label="Nome da máquina"><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} required placeholder="Ex.: Leg press 45°"/></Field><Field label="Fabricante"><input value={form.fabricante} onChange={e=>setForm({...form,fabricante:e.target.value})} placeholder="Ex.: Technogym"/></Field><FormActions onCancel={()=>setModal(false)} busy={busy} label={editing?'Salvar alterações':'Cadastrar máquina'}/></form></Modal>}{deleting&&<ConfirmDelete item={deleting.nome} onClose={()=>setDeleting(null)} onConfirm={remove} busy={busy}/>}</>
}

function UsersPage({data,reload,notify,me}) {
  const [search,setSearch]=useState(''),[deleting,setDeleting]=useState(null),[busy,setBusy]=useState(false),[modal,setModal]=useState(false)
  const [form,setForm]=useState({nome:'',email:'',cpf:'',contato:'',password:'',role:'USER'})
  const create=async e=>{e.preventDefault();setBusy(true);try{await send('/users','POST',form);notify(form.role==='PROF'?'Professor cadastrado.':'Aluno cadastrado.');setModal(false);setForm({nome:'',email:'',cpf:'',contato:'',password:'',role:'USER'});await reload()}catch(err){notify(err.message,'error')}finally{setBusy(false)}}
  const changeRole=async u=>{const role=u.role==='PROF'?'USER':'PROF';if(!confirm(`Alterar ${u.nome} para ${role==='PROF'?'Professor':'Aluno'}?`))return;try{await send(`/users/${u.id}/role`,'PATCH',{role});notify('Perfil atualizado.');await reload()}catch(e){notify(e.message,'error')}}
  const remove=async()=>{setBusy(true);try{await api(`/users/${deleting.id}`,{method:'DELETE'});notify('Usuário excluído.');setDeleting(null);await reload()}catch(e){notify(e.message,'error')}finally{setBusy(false)}}
  const filtered=data.users.filter(u=>`${u.nome} ${u.email} ${u.cpf}`.toLowerCase().includes(search.toLowerCase()))
  const roleLabel=role=>({ADM:'ADMINISTRADOR',PROF:'PROFESSOR',USER:'ALUNO'}[role]||role)
  return <><PageHeading eyebrow="CONTROLE DE ACESSO" title="Usuários" description="Cadastre alunos e professores e gerencie os acessos." action={<button className="primary-button" onClick={()=>setModal(true)}><Plus size={17}/> NOVO CADASTRO</button>}/><div className="user-summary"><div><Users size={20}/><span><strong>{data.users.length}</strong> usuários cadastrados</span></div><div><ShieldCheck size={20}/><span><strong>{data.users.filter(u=>u.role==='PROF').length}</strong> professores</span></div><div><UserRound size={20}/><span><strong>{data.users.filter(u=>u.role==='USER').length}</strong> alunos</span></div></div><div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF..."/></div><span className="result-count">{filtered.length} usuários</span></div><div className="panel users-table-panel"><div className="users-table-head"><span>MEMBRO</span><span>CPF</span><span>CONTATO</span><span>PERFIL</span><span>AÇÕES</span></div>{filtered.map(u=><div className="user-row" key={u.id}><div className="user-cell"><div className="avatar small">{(u.nome||u.email).slice(0,1).toUpperCase()}</div><div><strong>{u.nome}</strong><span>{u.email}</span></div></div><span className="table-text">{u.cpf||'—'}</span><span className="table-text">{u.contato||'—'}</span><span><span className={`role-pill ${u.role==='ADM'?'admin':''}`}>{roleLabel(u.role)}</span></span><div className="row-actions">{u.role!=='ADM'&&<><button className="secondary-button compact" onClick={()=>changeRole(u)}>{u.role==='PROF'?'Tornar aluno':'Tornar professor'}</button><button className="icon-button danger-hover" onClick={()=>setDeleting(u)}><Trash2 size={16}/></button></>}</div></div>)}{filtered.length===0&&<EmptyState icon={Users} title="Nenhum usuário encontrado" text="Tente buscar por outro termo."/>}</div>{modal&&<Modal title="Cadastrar usuário" subtitle="Crie uma conta de aluno ou professor." onClose={()=>setModal(false)}><form onSubmit={create} className="modal-form"><Field label="Tipo de conta"><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="USER">Aluno (USER)</option><option value="PROF">Professor (PROF)</option></select></Field><Field label="Nome completo"><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} required/></Field><Field label="E-mail"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></Field><Field label="CPF"><input value={form.cpf} onChange={e=>setForm({...form,cpf:e.target.value})} required/></Field><Field label="Contato"><input value={form.contato} onChange={e=>setForm({...form,contato:e.target.value})}/></Field><Field label="Senha inicial"><input type="password" minLength="6" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></Field><FormActions onCancel={()=>setModal(false)} busy={busy} label="Cadastrar"/></form></Modal>}{deleting&&<ConfirmDelete item={deleting.nome} onClose={()=>setDeleting(null)} onConfirm={remove} busy={busy}/>}</>
}

function Profile({user,isAdmin,onUpdate,notify}) {
  const [form,setForm]=useState({nome:user.nome||'',email:user.email||'',cpf:user.cpf||'',contato:user.contato||''}),[busy,setBusy]=useState(false)
  useEffect(()=>setForm({nome:user.nome||'',email:user.email||'',cpf:user.cpf||'',contato:user.contato||''}),[user])
  const submit=async e=>{e.preventDefault();setBusy(true);try{const updated=await send(`/users/${user.id}`,'PUT',form);onUpdate(updated)}catch(err){notify(err.message,'error')}finally{setBusy(false)}}
  return <><PageHeading eyebrow="DADOS DA CONTA" title="Meu perfil" description={isAdmin?"Mantenha os dados cadastrais atualizados.":"Consulte os dados da sua conta."}/><div className="profile-layout"><section className="profile-identity panel"><div className="profile-avatar">{(user.nome||user.email).slice(0,1).toUpperCase()}</div><h2>{user.nome}</h2><span>{user.email}</span><div className={`role-pill ${user.role==='ADM'?'admin':''}`}>{{ADM:'ADMINISTRADOR',PROF:'PROFESSOR',USER:'ALUNO'}[user.role]}</div><div className="profile-divider"/><div className="profile-detail"><ShieldCheck size={16}/><span>Conta protegida</span></div><div className="profile-detail"><Calendar size={16}/><span>Membro GymControl</span></div></section><section className="panel profile-form-panel"><div className="panel-header"><div><span className="section-kicker">INFORMAÇÕES PESSOAIS</span><h3>{isAdmin?'Editar cadastro':'Dados cadastrais'}</h3></div></div>{isAdmin?<form onSubmit={submit} className="profile-form"><div className="form-grid"><Field label="Nome completo"><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} required/></Field><Field label="E-mail"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></Field><Field label="CPF"><input value={form.cpf} onChange={e=>setForm({...form,cpf:e.target.value})} required/></Field><Field label="Contato"><input value={form.contato} onChange={e=>setForm({...form,contato:e.target.value})}/></Field></div><div className="profile-form-foot"><span>As alterações são salvas diretamente na conta.</span><button className="primary-button" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<Save size={16}/>} Salvar alterações</button></div></form>:<div className="profile-readonly"><p>Nome: <strong>{user.nome}</strong></p><p>E-mail: <strong>{user.email}</strong></p><p>CPF: <strong>{user.cpf}</strong></p><p>Contato: <strong>{user.contato||'Não informado'}</strong></p><small>Seu perfil está disponível para consulta. A API atual permite alterações cadastrais apenas para administradores.</small></div>}</section></div></>
}

createRoot(document.getElementById('root')).render(<App/>)
