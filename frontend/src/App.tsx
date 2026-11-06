import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Dumbbell, Eye, EyeOff, Flame, Gauge, LogOut,
  Menu, Moon, MoreHorizontal, Pencil, Plus, Search, Settings2, ShieldCheck, Sun, Trash2,
  Users, Weight, X, Zap, HeartPulse, LayoutDashboard, ClipboardList, Cog, UserRound,
  Filter, RefreshCw, AlertCircle, CheckCircle2, LoaderCircle
} from 'lucide-react'
import {
  api, authApi, clearToken, deleteExercise, deleteMachine, deleteUser, deleteWorkout,
  getExercises, getMachines, getMe, getUsers, getWorkouts, hasToken, saveExercise, updateUser,
  saveMachine, saveToken, saveWorkout, updateRole
} from './api'
import type { Exercise, Machine, Muscle, Role, User, Weekday, Workout, WorkoutRequest } from './types'

const MUSCLES:Muscle[] = ['PEITO','COSTAS','OMBRO','BICEPS','TRICEPS','ANTEBRACO','ABDOMEN','QUADRICEPS','POSTERIOR_COXA','GLUTEO','PANTURRILHA']
const DAYS:Weekday[] = ['SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO','DOMINGO']
const dayLabel:Record<Weekday,string> = {SEGUNDA:'Segunda-feira',TERCA:'Terça-feira',QUARTA:'Quarta-feira',QUINTA:'Quinta-feira',SEXTA:'Sexta-feira',SABADO:'Sábado',DOMINGO:'Domingo'}
const muscleLabel:Record<Muscle,string> = {PEITO:'Peito',COSTAS:'Costas',OMBRO:'Ombros',BICEPS:'Bíceps',TRICEPS:'Tríceps',ANTEBRACO:'Antebraço',ABDOMEN:'Abdômen',QUADRICEPS:'Quadríceps',POSTERIOR_COXA:'Posterior de coxa',GLUTEO:'Glúteos',PANTURRILHA:'Panturrilha'}
type Page = 'overview'|'workouts'|'exercises'|'machines'|'users'
type Toast = {message:string;kind:'success'|'error'}
const palettes = [
  {id:'orange',label:'Laranja',value:'#ed6a2c'},{id:'blue',label:'Azul',value:'#3979e8'},
  {id:'green',label:'Verde',value:'#28a36a'},{id:'red',label:'Vermelho',value:'#d94b4b'},
  {id:'purple',label:'Roxo',value:'#8b65d8'},{id:'yellow',label:'Amarelo',value:'#c79a28'},
  {id:'cyan',label:'Ciano',value:'#219eae'},{id:'steel',label:'Aço',value:'#78899d'}
]
function initials(name:string) { return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join('') || 'G' }
function App() {
  const [user,setUser] = useState<User|null>(null)
  const [boot,setBoot] = useState(true)
  const [page,setPage] = useState<Page>('overview')
  const [workouts,setWorkouts] = useState<Workout[]>([])
  const [exercises,setExercises] = useState<Exercise[]>([])
  const [machines,setMachines] = useState<Machine[]>([])
  const [users,setUsers] = useState<User[]>([])
  const [toast,setToast] = useState<Toast|null>(null)
  const [theme,setTheme] = useState<'dark'|'light'>(() => (localStorage.getItem('gc_theme') as 'dark'|'light') || 'dark')
  const [accent,setAccent] = useState(localStorage.getItem('gc_accent') || '#ed6a2c')
  const [settingsOpen,setSettingsOpen] = useState(false)
  const [sidebarOpen,setSidebarOpen] = useState(false)
  const [query,setQuery] = useState('')
  const [busy,setBusy] = useState(false)
  const [modal,setModal] = useState<{kind:'workout'|'exercise'|'machine'|'user';item?:Workout|Exercise|Machine|User}|null>(null)

  useEffect(()=> {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.setProperty('--accent',accent)
    const rgb = accent.match(/[a-f0-9]{2}/gi)?.map(v=>parseInt(v,16)).join(',') || '237,106,44'
    document.documentElement.style.setProperty('--accent-rgb',rgb)
    localStorage.setItem('gc_theme',theme); localStorage.setItem('gc_accent',accent)
  },[theme,accent])
  const notify = useCallback((message:string,kind:'success'|'error'='success')=> {
    setToast({message,kind}); window.setTimeout(()=>setToast(null),3800)
  },[])
  const logout = useCallback(()=>{ clearToken(); setUser(null); setWorkouts([]); setExercises([]); setMachines([]); setUsers([]) },[])
  useEffect(()=>{ const fn=()=>logout(); window.addEventListener('gymcontrol:unauthorized',fn); return ()=>window.removeEventListener('gymcontrol:unauthorized',fn) },[logout])
  const refresh = useCallback(async()=>{
    if (!user) return
    setBusy(true)
    try {
      const [w,e,m] = await Promise.all([getWorkouts(),getExercises(),getMachines()])
      setWorkouts(w); setExercises(e); setMachines(m)
      if(user.role==='ADM') setUsers(await getUsers())
    } catch(e) { notify(e instanceof Error?e.message:'Falha ao carregar os dados.', 'error') }
    finally { setBusy(false) }
  },[user,notify])
  useEffect(()=> {
    let alive=true
    if(!hasToken()){setBoot(false);return}
    getMe().then(u=>{if(alive)setUser(u)}).catch(()=>clearToken()).finally(()=>{if(alive)setBoot(false)})
    return ()=>{alive=false}
  },[])
  useEffect(()=>{if(user)refresh()},[user,refresh])
  const isAdm=user?.role==='ADM'
  const filteredExercises=useMemo(()=>exercises.filter(e=>`${e.nome} ${e.agrupamento} ${e.maquina||''}`.toLowerCase().includes(query.toLowerCase())),[exercises,query])
  const filteredMachines=useMemo(()=>machines.filter(m=>`${m.nome} ${m.fabricante||''}`.toLowerCase().includes(query.toLowerCase())),[machines,query])
  const filteredUsers=useMemo(()=>users.filter(u=>`${u.nome} ${u.email} ${u.cpf}`.toLowerCase().includes(query.toLowerCase())),[users,query])

  const login = async(email:string,password:string)=> {
    const result=await authApi.login(email,password); saveToken(result.token)
    const me=await getMe(); setUser(me); setPage('overview')
  }
  const register = async(data:{nome:string;email:string;cpf:string;contato:string;password:string})=> {
    await authApi.register(data); notify('Conta criada. Agora entre com seu e-mail e senha.')
  }
  const remove = async(label:string,action:()=>Promise<unknown>,after:()=>void)=> {
    if(!window.confirm(`Deseja realmente excluir ${label}?`)) return
    try { await action(); after(); notify('Registro excluído com sucesso.') }
    catch(e){notify(e instanceof Error?e.message:'Não foi possível excluir.','error')}
  }
  const saveWorkoutForm=async(data:WorkoutRequest,id?:number)=> {
    try { await saveWorkout(data,id); await refresh(); setModal(null); notify(id?'Treino atualizado.':'Treino criado.') }
    catch(e){notify(e instanceof Error?e.message:'Não foi possível salvar o treino.','error')}
  }
  const saveExerciseForm=async(data:{nome:string;agrupamento:string;maquinaId:number|null},id?:number)=> {
    try { await saveExercise(data,id); await refresh(); setModal(null); notify(id?'Exercício atualizado.':'Exercício cadastrado.') }
    catch(e){notify(e instanceof Error?e.message:'Não foi possível salvar.','error')}
  }
  const saveUserForm=async(data:{nome:string;email:string;cpf:string;contato:string},id:number)=> {
    try { await updateUser(id,data); await refresh(); setModal(null); notify('Dados do usuário atualizados.') }
    catch(e){notify(e instanceof Error?e.message:'Não foi possível atualizar.','error')}
  }
  const saveMachineForm=async(data:{nome:string;fabricante:string},id?:number)=> {
    try { await saveMachine(data,id); await refresh(); setModal(null); notify(id?'Máquina atualizada.':'Máquina cadastrada.') }
    catch(e){notify(e instanceof Error?e.message:'Não foi possível salvar.','error')}
  }

  if(boot) return <div className="loading-screen"><LoaderCircle className="spin" size={28}/><span>Preparando seu espaço...</span></div>
  if(!user) return <AuthScreen onLogin={login} onRegister={register} notify={notify} toast={toast} />

  const nav:[Page,string,typeof LayoutDashboard][] = [
    ['overview','Visão geral',LayoutDashboard],['workouts','Treinos',CalendarDays],
    ['exercises','Exercícios',Dumbbell],['machines','Máquinas',Cog],
    ...(isAdm?[['users','Usuários',Users] as [Page,string,typeof LayoutDashboard]]:[])
  ]
  const titles:Record<Page,string>={overview:'Visão geral',workouts:'Treinos',exercises:'Exercícios',machines:'Máquinas',users:'Usuários'}
  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><Dumbbell size={21}/></div><div><b>GYM<span>CONTROL</span></b><small>GESTÃO DE TREINOS</small></div><button className="mobile-close" onClick={()=>setSidebarOpen(false)}><X/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">{nav.map(([key,label,Icon])=><button key={key} className={`nav-item ${page===key?'active':''}`} onClick={()=>{setPage(key);setQuery('');setSidebarOpen(false)}}><Icon size={18}/><span>{label}</span>{page===key&&<i/>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-status"><span className="status-dot"/><div><b>API conectada</b><small>Spring Boot · localhost:3000</small></div></div>
        <div className="user-mini"><div className="avatar">{initials(user.nome)}</div><div className="user-mini-info"><b>{user.nome}</b><small>{isAdm?'Administrador':'Aluno'}</small></div><button className="icon-btn" title="Sair" onClick={logout}><LogOut size={17}/></button></div>
      </div>
    </aside>
    {sidebarOpen&&<button className="scrim" onClick={()=>setSidebarOpen(false)} aria-label="Fechar menu"/>}
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu icon-btn" onClick={()=>setSidebarOpen(true)}><Menu/></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><b>{titles[page]}</b></div></div>
        <div className="topbar-actions">
          <div className="api-pill"><span className="status-dot"/>Sistema operacional</div>
          <button className="icon-btn" title="Atualizar dados" onClick={refresh}><RefreshCw size={17} className={busy?'spin':''}/></button>
          <div className="settings-wrap"><button className="icon-btn" title="Aparência" onClick={()=>setSettingsOpen(!settingsOpen)}><Settings2 size={18}/></button>
            {settingsOpen&&<div className="settings-pop"><b>Aparência</b><div className="setting-row"><span>Tema</span><button className="theme-toggle" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Moon size={15}/>:<Sun size={15}/>} {theme==='dark'?'Escuro':'Claro'}</button></div><span className="setting-caption">COR DE DESTAQUE</span><div className="swatches">{palettes.map(p=><button key={p.id} title={p.label} className={`swatch ${accent===p.value?'selected':''}`} style={{'--swatch':p.value} as CSSProperties} onClick={()=>setAccent(p.value)}>{accent===p.value&&<Check size={13}/>}</button>)}</div><small>Preferências salvas neste dispositivo.</small></div>}
          </div>
          <div className="top-user"><div className="avatar small">{initials(user.nome)}</div><div><b>{user.nome}</b><small>{isAdm?'ADM':'USER'}</small></div><ChevronDown size={14}/></div>
        </div>
      </header>
      <div className="content-wrap">
        <div className="page-heading"><div><div className="eyebrow">PAINEL DE CONTROLE</div><h1>{titles[page]}<span className="heading-period">.</span></h1><p>{page==='overview'?'Acompanhe a estrutura e a organização dos seus treinos.':page==='workouts'?'Organize sua rotina e acompanhe cada sessão.':page==='exercises'?'Gerencie os exercícios disponíveis para montar treinos.':page==='machines'?'Mantenha o catálogo de equipamentos atualizado.':'Gerencie os acessos e os perfis da plataforma.'}</p></div>
          <div className="heading-actions">{page!=='overview'&&<div className="search-box"><Search size={16}/><input placeholder="Buscar..." value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')}><X size={14}/></button>}</div>}
            {page==='workouts'&&<button className="btn-primary" onClick={()=>setModal({kind:'workout'})}><Plus size={17}/> Novo treino</button>}
            {page==='exercises'&&isAdm&&<button className="btn-primary" onClick={()=>setModal({kind:'exercise'})}><Plus size={17}/> Novo exercício</button>}
            {page==='machines'&&isAdm&&<button className="btn-primary" onClick={()=>setModal({kind:'machine'})}><Plus size={17}/> Nova máquina</button>}
          </div>
        </div>
        {page==='overview'&&<Overview user={user} workouts={workouts} exercises={exercises} machines={machines} setPage={setPage}/>}
        {page==='workouts'&&<WorkoutsPage workouts={workouts} query={query} onEdit={w=>setModal({kind:'workout',item:w})} onDelete={w=>remove(`o treino de ${dayLabel[w.diaSemana]}`,()=>deleteWorkout(w.id),refresh)} onCreate={()=>setModal({kind:'workout'})}/>}
        {page==='exercises'&&<ExercisesPage exercises={filteredExercises} isAdm={!!isAdm} onEdit={e=>setModal({kind:'exercise',item:e})} onDelete={e=>remove(`o exercício "${e.nome}"`,()=>deleteExercise(e.id),refresh)}/>}
        {page==='machines'&&<MachinesPage machines={filteredMachines} isAdm={!!isAdm} onEdit={m=>setModal({kind:'machine',item:m})} onDelete={m=>remove(`a máquina "${m.nome}"`,()=>deleteMachine(m.id),refresh)}/>}
        {page==='users'&&isAdm&&<UsersPage users={filteredUsers} onEdit={u=>setModal({kind:'user',item:u})} onRole={async(u,role)=>{try{await updateRole(u.id,role);await refresh();notify('Perfil atualizado.')}catch(e){notify(e instanceof Error?e.message:'Falha ao atualizar.','error')}}} onDelete={u=>remove(`o usuário "${u.nome}"`,()=>deleteUser(u.id),refresh)}/>}
        <footer className="footer"><span>GYMCONTROL <i>·</i> Gestão inteligente de treinos</span><span>Conectado à API REST <span className="status-dot"/></span></footer>
      </div>
    </main>
    {modal&&<Modal onClose={()=>setModal(null)}><div className="modal-heading"><div><div className="eyebrow">{modal.item?'ATUALIZAÇÃO':'NOVO REGISTRO'}</div><h2>{modal.kind==='workout'?(modal.item?'Editar treino':'Montar treino'):modal.kind==='exercise'?(modal.item?'Editar exercício':'Cadastrar exercício'):modal.kind==='machine'?(modal.item?'Editar máquina':'Cadastrar máquina'):'Editar usuário'}</h2></div><button className="icon-btn" onClick={()=>setModal(null)}><X/></button></div>
      {modal.kind==='workout'?<WorkoutForm initial={modal.item as Workout|undefined} exercises={exercises} onSave={saveWorkoutForm} onCancel={()=>setModal(null)}/>
      :modal.kind==='exercise'?<ExerciseForm initial={modal.item as Exercise|undefined} machines={machines} onSave={saveExerciseForm} onCancel={()=>setModal(null)}/>
      :modal.kind==='machine'?<MachineForm initial={modal.item as Machine|undefined} onSave={saveMachineForm} onCancel={()=>setModal(null)}/>:<UserEditForm initial={modal.item as User} onSave={saveUserForm} onCancel={()=>setModal(null)}/>}
    </Modal>}
    {toast&&<div className={`toast ${toast.kind}`}><span>{toast.kind==='success'?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}</span>{toast.message}<button onClick={()=>setToast(null)}><X size={15}/></button></div>}
  </div>
}

function AuthScreen({onLogin,onRegister,notify,toast}:{onLogin:(e:string,p:string)=>Promise<void>;onRegister:(d:{nome:string;email:string;cpf:string;contato:string;password:string})=>Promise<void>;notify:(m:string,k?:'success'|'error')=>void;toast:Toast|null}) {
  const [mode,setMode]=useState<'login'|'register'>('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[nome,setNome]=useState(''),[cpf,setCpf]=useState(''),[contato,setContato]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false)
  const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);try{if(mode==='login')await onLogin(email,password);else{await onRegister({nome,email,cpf,contato,password});setMode('login');setPassword('')}}catch(err){notify(err instanceof Error?err.message:'Não foi possível continuar.','error')}finally{setBusy(false)}}
  return <div className="auth-screen"><div className="auth-art"><div className="auth-brand"><div className="brand-mark"><Dumbbell size={21}/></div><b>GYM<span>CONTROL</span></b></div><div className="art-copy"><div className="eyebrow">DISCIPLINA. EVOLUÇÃO. RESULTADO.</div><h1>Seu treino.<br/><em>Sua evolução.</em></h1><p>Uma forma mais inteligente de organizar sua rotina, acompanhar seus treinos e manter o foco no que importa.</p><div className="art-stats"><div><b>01</b><span>Planeje</span></div><div><b>02</b><span>Execute</span></div><div><b>03</b><span>Evolua</span></div></div></div><div className="art-bottom"><span>GYMCONTROL / PERFORMANCE MANAGEMENT</span><span>EST. 2026</span></div></div><div className="auth-panel"><div className="auth-top"><span>ÁREA DO ALUNO</span><span className="secure"><ShieldCheck size={14}/> AMBIENTE SEGURO</span></div><div className="auth-form-wrap"><div className="auth-symbol"><Dumbbell size={22}/></div><div className="eyebrow">{mode==='login'?'BEM-VINDO DE VOLTA':'COMECE AGORA'}</div><h2>{mode==='login'?'Acesse sua conta':'Crie sua conta'}</h2><p>{mode==='login'?'Entre para acessar seu painel de treinos.':'Preencha seus dados para criar seu acesso.'}</p><form onSubmit={submit} className="form-stack">
    {mode==='register'&&<><Field label="Nome completo"><input value={nome} onChange={e=>setNome(e.target.value)} required placeholder="Como podemos te chamar?"/></Field><Field label="CPF"><input value={cpf} onChange={e=>setCpf(e.target.value)} required placeholder="000.000.000-00"/></Field><Field label="Contato (opcional)"><input value={contato} onChange={e=>setContato(e.target.value)} placeholder="(00) 00000-0000"/></Field></>}
    <Field label="E-mail"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="voce@email.com"/></Field>
    <Field label="Senha"><div className="password-wrap"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="Mínimo de 6 caracteres"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></Field>
    <button className="btn-primary auth-submit" disabled={busy}>{busy?<LoaderCircle className="spin" size={18}/>:null}{mode==='login'?'Entrar na plataforma':'Criar conta'}<ChevronRight size={17}/></button>
  </form><div className="auth-switch">{mode==='login'?'Ainda não tem uma conta?':'Já possui cadastro?'} <button onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Criar conta':'Fazer login'}</button></div></div><div className="auth-foot">© 2026 GYMCONTROL <span>·</span> TODOS OS DIREITOS RESERVADOS</div></div>{toast&&<div className={`toast ${toast.kind}`}><span>{toast.kind==='success'?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}</span>{toast.message}</div>}</div>
}

function Field({label,children}:{label:string;children:ReactNode}) {return <label className="field"><span>{label}</span>{children}</label>}
function Overview({user,workouts,exercises,machines,setPage}:{user:User;workouts:Workout[];exercises:Exercise[];machines:Machine[];setPage:(p:Page)=>void}) {
  const today=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})
  const counts=[{label:'Treinos cadastrados',value:workouts.length,icon:CalendarDays,desc:'Rotinas disponíveis',to:'workouts' as Page},{label:'Exercícios',value:exercises.length,icon:Dumbbell,desc:'Movimentos no catálogo',to:'exercises' as Page},{label:'Equipamentos',value:machines.length,icon:Cog,desc:'Máquinas cadastradas',to:'machines' as Page}]
  const muscleCount=Object.entries(exercises.reduce((a,e)=>{a[e.agrupamento]=(a[e.agrupamento]||0)+1;return a},{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]).slice(0,5)
  return <><section className="welcome-banner"><div className="welcome-content"><div className="eyebrow">SEU ESPAÇO DE PERFORMANCE</div><h2>Vamos evoluir, <span>{user.nome.split(' ')[0]}.</span></h2><p>Consistência é o que transforma esforço em resultado. Continue construindo sua melhor versão.</p><button className="btn-light" onClick={()=>setPage('workouts')}>Ver treinos <ArrowUpRight size={16}/></button></div><div className="banner-graphic"><div className="ring ring-one"/><div className="ring ring-two"/><div className="banner-icon"><Activity size={62}/></div><span className="graphic-tag">FOCO / FORÇA / CONSTÂNCIA</span></div><div className="banner-date"><CalendarDays size={15}/>{today}</div></section>
  <div className="section-title"><div><div className="eyebrow">RESUMO DA PLATAFORMA</div><h3>Seu panorama</h3></div><span className="live-label"><i/> DADOS ATUALIZADOS</span></div>
  <div className="stats-grid">{counts.map(({label,value,icon:Icon,desc,to},i)=><button className="stat-card" key={label} onClick={()=>setPage(to)}><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={18}/></div></div><div className="stat-value">{value.toString().padStart(2,'0')}</div><div className="stat-foot"><span>{desc}</span><ArrowUpRight size={15}/></div><div className={`stat-accent accent-${i}`}/></button>)}</div>
  <div className="overview-grid"><section className="panel"><div className="panel-head"><div><div className="eyebrow">ROTINA</div><h3>Treinos por dia</h3></div><button className="text-action" onClick={()=>setPage('workouts')}>Ver todos <ArrowUpRight size={14}/></button></div><div className="week-grid">{DAYS.map(d=>{const count=workouts.filter(w=>w.diaSemana===d).length;return <div className={`week-day ${count?'has-workout':''}`} key={d}><span>{d.slice(0,3)}</span><b>{count||'—'}</b><i/></div>})}</div><div className="panel-note"><span className="legend-dot"/>{workouts.length} treino(s) distribuído(s) na semana</div></section>
  <section className="panel"><div className="panel-head"><div><div className="eyebrow">DISTRIBUIÇÃO</div><h3>Grupos musculares</h3></div><Dumbbell size={18} className="panel-head-icon"/></div>{muscleCount.length? <div className="muscle-bars">{muscleCount.map(([muscle,count])=><div className="muscle-row" key={muscle}><div><span>{muscleLabel[muscle as Muscle]||muscle}</span><b>{count}</b></div><div className="bar-track"><i style={{width:`${count/Math.max(...muscleCount.map(x=>x[1]))*100}%`}}/></div></div>)}</div>:<Empty icon={Dumbbell} title="Sem exercícios ainda" text="Cadastre exercícios para visualizar a distribuição."/>}</section></div>
  <div className="quick-actions"><div><div className="eyebrow">ATALHOS</div><h3>Acesso rápido</h3></div><button onClick={()=>setPage('workouts')}><span><CalendarDays/></span><div><b>Organizar treinos</b><small>Monte sua rotina semanal</small></div><ChevronRight/></button><button onClick={()=>setPage('exercises')}><span><Dumbbell/></span><div><b>Biblioteca de exercícios</b><small>Explore os movimentos</small></div><ChevronRight/></button><button onClick={()=>setPage('machines')}><span><Cog/></span><div><b>Equipamentos</b><small>Consulte as máquinas</small></div><ChevronRight/></button></div></>
}
function WorkoutsPage({workouts,query,onEdit,onDelete,onCreate}:{workouts:Workout[];query:string;onEdit:(w:Workout)=>void;onDelete:(w:Workout)=>void;onCreate:()=>void}) {
 const list=workouts.filter(w=>dayLabel[w.diaSemana].toLowerCase().includes(query.toLowerCase())).sort((a,b)=>DAYS.indexOf(a.diaSemana)-DAYS.indexOf(b.diaSemana))
 return <><div className="list-summary"><div><b>{list.length}</b><span>rotina(s) cadastrada(s)</span></div><div className="summary-chip"><CalendarDays size={15}/> Organização semanal</div></div>{list.length?<div className="workout-grid">{list.map(w=><article className="workout-card" key={w.id}><div className="workout-card-top"><span className="day-chip">{dayLabel[w.diaSemana]}</span><div className="card-actions"><button className="icon-btn" title="Editar" onClick={()=>onEdit(w)}><Pencil size={15}/></button><button className="icon-btn danger-hover" title="Excluir" onClick={()=>onDelete(w)}><Trash2 size={15}/></button></div></div><div className="workout-card-title"><div className="workout-number">0{w.id}</div><div><h3>Treino de {dayLabel[w.diaSemana].split('-')[0]}</h3><p>{w.itens.length} exercício(s) nesta sessão</p></div></div><div className="workout-exercises">{w.itens.slice().sort((a,b)=>a.ordem-b.ordem).map((it,i)=><div className="workout-exercise" key={it.id||i}><span className="exercise-index">{String(i+1).padStart(2,'0')}</span><div><b>{it.exercicio}</b><small>{it.maquina||'Peso livre'}</small></div><span className="exercise-load">{it.series} × {it.repeticoes}<small>{it.carga} kg</small></span></div>)}</div><div className="workout-card-bottom"><span><Flame size={14}/> {w.itens.reduce((a,i)=>a+i.series,0)} séries totais</span><button onClick={()=>onEdit(w)}>Editar treino <ArrowUpRight size={14}/></button></div></article>)}</div>:<Empty icon={CalendarDays} title={query?'Nenhum treino encontrado':'Sua rotina começa aqui'} text={query?'Tente buscar por outro dia da semana.':'Crie seu primeiro treino e organize os exercícios por dia.'} action={!query?onCreate:undefined} actionLabel="Criar primeiro treino"/>}</>
}
function ExercisesPage({exercises,isAdm,onEdit,onDelete}:{exercises:Exercise[];isAdm:boolean;onEdit:(e:Exercise)=>void;onDelete:(e:Exercise)=>void}) {
 return <><div className="list-summary"><div><b>{exercises.length}</b><span>exercício(s) no catálogo</span></div><div className="summary-chip"><Dumbbell size={15}/> {MUSCLES.length} grupos musculares</div></div>{exercises.length?<div className="data-grid">{exercises.map(e=><article className="data-card" key={e.id}><div className="data-icon"><Dumbbell size={19}/></div><div className="data-info"><h3>{e.nome}</h3><p>{muscleLabel[e.agrupamento]||e.agrupamento}</p><span>{e.maquina||'Peso livre'}</span></div>{isAdm&&<div className="card-actions"><button className="icon-btn" onClick={()=>onEdit(e)} title="Editar"><Pencil size={15}/></button><button className="icon-btn danger-hover" onClick={()=>onDelete(e)} title="Excluir"><Trash2 size={15}/></button></div>}</article>)}</div>:<Empty icon={Dumbbell} title="Nenhum exercício encontrado" text="O catálogo ainda não possui exercícios com esse filtro."/>}</>
}
function MachinesPage({machines,isAdm,onEdit,onDelete}:{machines:Machine[];isAdm:boolean;onEdit:(m:Machine)=>void;onDelete:(m:Machine)=>void}) {
 return <><div className="list-summary"><div><b>{machines.length}</b><span>equipamento(s) cadastrado(s)</span></div><div className="summary-chip"><Cog size={15}/> Catálogo de equipamentos</div></div>{machines.length?<div className="data-grid">{machines.map(m=><article className="data-card" key={m.id}><div className="data-icon"><Cog size={19}/></div><div className="data-info"><h3>{m.nome}</h3><p>{m.fabricante||'Fabricante não informado'}</p><span>Equipamento #{String(m.id).padStart(3,'0')}</span></div>{isAdm&&<div className="card-actions"><button className="icon-btn" onClick={()=>onEdit(m)} title="Editar"><Pencil size={15}/></button><button className="icon-btn danger-hover" onClick={()=>onDelete(m)} title="Excluir"><Trash2 size={15}/></button></div>}</article>)}</div>:<Empty icon={Cog} title="Nenhuma máquina encontrada" text="Cadastre equipamentos para associá-los aos exercícios."/>}</>
}
function UsersPage({users,onRole,onDelete,onEdit}:{users:User[];onEdit:(u:User)=>void;onRole:(u:User,r:Role)=>void;onDelete:(u:User)=>void}) {
 return <><div className="list-summary"><div><b>{users.length}</b><span>usuário(s) registrado(s)</span></div><div className="summary-chip"><ShieldCheck size={15}/> Gestão de acessos</div></div><div className="users-table"><div className="table-head"><span>USUÁRIO</span><span>CPF</span><span>CONTATO</span><span>PERFIL</span><span>AÇÕES</span></div>{users.map(u=><div className="table-row" key={u.id}><div className="table-person"><div className="avatar small">{initials(u.nome)}</div><div><b>{u.nome}</b><small>{u.email}</small></div></div><span>{u.cpf}</span><span>{u.contato||'—'}</span><span><span className={`role-pill ${u.role==='ADM'?'admin':''}`}>{u.role==='ADM'?'Administrador':'Usuário'}</span></span><div className="table-actions"><button className="icon-btn" onClick={()=>onEdit(u)} title="Editar usuário"><Pencil size={15}/></button><select value={u.role} onChange={e=>onRole(u,e.target.value as Role)} aria-label={`Perfil de ${u.nome}`}><option value="USER">USER</option><option value="ADM">ADM</option></select><button className="icon-btn danger-hover" onClick={()=>onDelete(u)} title="Excluir usuário"><Trash2 size={15}/></button></div></div>)}</div></>
}
function UserEditForm({initial,onSave,onCancel}:{initial:User;onSave:(d:{nome:string;email:string;cpf:string;contato:string},id:number)=>void;onCancel:()=>void}) {
 const [nome,setNome]=useState(initial.nome),[email,setEmail]=useState(initial.email),[cpf,setCpf]=useState(initial.cpf),[contato,setContato]=useState(initial.contato||'')
 return <form className="modal-form" onSubmit={e=>{e.preventDefault();onSave({nome,email,cpf,contato},initial.id)}}><Field label="Nome completo"><input value={nome} onChange={e=>setNome(e.target.value)} required/></Field><Field label="E-mail"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></Field><Field label="CPF"><input value={cpf} onChange={e=>setCpf(e.target.value)} required/></Field><Field label="Contato"><input value={contato} onChange={e=>setContato(e.target.value)} placeholder="Opcional"/></Field><div className="modal-actions"><button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button><button className="btn-primary"><Check size={16}/>Salvar usuário</button></div></form>
}
function Empty({icon:Icon,title,text,action,actionLabel}:{icon:typeof Dumbbell;title:string;text:string;action?:()=>void;actionLabel?:string}) {return <div className="empty-state"><div className="empty-icon"><Icon size={25}/></div><h3>{title}</h3><p>{text}</p>{action&&<button className="btn-primary" onClick={action}><Plus size={16}/>{actionLabel}</button>}</div>}
function Modal({children,onClose}:{children:ReactNode;onClose:()=>void}) {useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[onClose]);return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal-card">{children}</div></div>}
function WorkoutForm({initial,exercises,onSave,onCancel}:{initial?:Workout;exercises:Exercise[];onSave:(d:WorkoutRequest,id?:number)=>void;onCancel:()=>void}) {
 const [day,setDay]=useState<Weekday>(initial?.diaSemana||'SEGUNDA')
 const [items,setItems]=useState<{exercicioId:string;series:string;repeticoes:string;carga:string;ordem:number}[]>(initial?.itens.map((it,i)=>({exercicioId:String(exercises.find(e=>e.nome===it.exercicio)?.id||''),series:String(it.series),repeticoes:String(it.repeticoes),carga:String(it.carga),ordem:i}))||[{exercicioId:'',series:'3',repeticoes:'12',carga:'0',ordem:0}])
 const update=(i:number,key:string,value:string)=>setItems(old=>old.map((it,n)=>n===i?{...it,[key]:value}:it))
 const submit=(e:FormEvent)=>{e.preventDefault();if(!items.length||items.some(i=>!i.exercicioId)){return}onSave({diaSemana:day,itens:items.map((i,n)=>({exercicioId:Number(i.exercicioId),series:Number(i.series),repeticoes:Number(i.repeticoes),carga:Number(i.carga),ordem:n}))},initial?.id)}
 return <form className="modal-form" onSubmit={submit}><Field label="Dia da semana"><select value={day} onChange={e=>setDay(e.target.value as Weekday)}>{DAYS.map(d=><option key={d} value={d}>{dayLabel[d]}</option>)}</select></Field><div className="form-section-head"><div><b>Exercícios da sessão</b><small>Adicione pelo menos um exercício ao treino.</small></div><button type="button" className="btn-secondary small-btn" onClick={()=>setItems(old=>[...old,{exercicioId:'',series:'3',repeticoes:'12',carga:'0',ordem:old.length}])}><Plus size={15}/> Adicionar</button></div>{items.map((it,i)=><div className="item-editor" key={i}><div className="item-editor-top"><span>EXERCÍCIO {String(i+1).padStart(2,'0')}</span>{items.length>1&&<button type="button" className="remove-item" onClick={()=>setItems(old=>old.filter((_,n)=>n!==i))}><Trash2 size={14}/> Remover</button>}</div><select value={it.exercicioId} required onChange={e=>update(i,'exercicioId',e.target.value)}><option value="">Selecione um exercício</option>{exercises.map(ex=><option key={ex.id} value={ex.id}>{ex.nome} · {muscleLabel[ex.agrupamento]}</option>)}</select><div className="item-fields"><Field label="Séries"><input type="number" min="1" value={it.series} required onChange={e=>update(i,'series',e.target.value)}/></Field><Field label="Repetições"><input type="number" min="1" value={it.repeticoes} required onChange={e=>update(i,'repeticoes',e.target.value)}/></Field><Field label="Carga (kg)"><input type="number" min="0" step="0.5" value={it.carga} required onChange={e=>update(i,'carga',e.target.value)}/></Field></div></div>)}{!exercises.length&&<p className="form-hint warning">Cadastre exercícios antes de montar um treino.</p>}<div className="modal-actions"><button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button><button className="btn-primary" disabled={!exercises.length||!items.length||items.some(i=>!i.exercicioId||Number(i.series)<1||Number(i.repeticoes)<1||Number(i.carga)<0)}><Check size={16}/>{initial?'Salvar alterações':'Criar treino'}</button></div></form>
}
function ExerciseForm({initial,machines,onSave,onCancel}:{initial?:Exercise;machines:Machine[];onSave:(d:{nome:string;agrupamento:string;maquinaId:number|null},id?:number)=>void;onCancel:()=>void}) {
 const [nome,setNome]=useState(initial?.nome||''),[group,setGroup]=useState<Muscle>(initial?.agrupamento||'PEITO'),[machine,setMachine]=useState(String(machines.find(m=>m.nome===initial?.maquina)?.id||''))
 return <form className="modal-form" onSubmit={e=>{e.preventDefault();onSave({nome,agrupamento:group,maquinaId:machine?Number(machine):null},initial?.id)}}><Field label="Nome do exercício"><input value={nome} onChange={e=>setNome(e.target.value)} required placeholder="Ex.: Supino reto"/></Field><Field label="Grupo muscular"><select value={group} onChange={e=>setGroup(e.target.value as Muscle)}>{MUSCLES.map(m=><option key={m} value={m}>{muscleLabel[m]}</option>)}</select></Field><Field label="Máquina / equipamento"><select value={machine} onChange={e=>setMachine(e.target.value)}><option value="">Peso livre / sem máquina</option>{machines.map(m=><option key={m.id} value={m.id}>{m.nome}</option>)}</select></Field><div className="modal-actions"><button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button><button className="btn-primary"><Check size={16}/>{initial?'Salvar alterações':'Cadastrar exercício'}</button></div></form>
}
function MachineForm({initial,onSave,onCancel}:{initial?:Machine;onSave:(d:{nome:string;fabricante:string},id?:number)=>void;onCancel:()=>void}) {
 const [nome,setNome]=useState(initial?.nome||''),[fabricante,setFabricante]=useState(initial?.fabricante||'')
 return <form className="modal-form" onSubmit={e=>{e.preventDefault();onSave({nome,fabricante},initial?.id)}}><Field label="Nome da máquina"><input value={nome} onChange={e=>setNome(e.target.value)} required placeholder="Ex.: Leg press 45°"/></Field><Field label="Fabricante"><input value={fabricante} onChange={e=>setFabricante(e.target.value)} placeholder="Ex.: Movement (opcional)"/></Field><div className="modal-actions"><button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button><button className="btn-primary"><Check size={16}/>{initial?'Salvar alterações':'Cadastrar máquina'}</button></div></form>
}

export default App
