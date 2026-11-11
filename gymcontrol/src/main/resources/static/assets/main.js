import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, Dumbbell, LayoutDashboard, CalendarDays, ClipboardList, Users, LogOut, Sun, Moon, Palette, Plus, Search, Menu, X, ArrowUpRight, TrendingUp, Clock3, Target, Pencil, Trash2, Check, AlertCircle, CheckCircle2, LoaderCircle, ChevronRight, UserRound, ShieldCheck, Zap, SlidersHorizontal, Save, Eye, EyeOff, Mail, Lock, Hash, Phone, Calendar, Filter, RefreshCw } from 'lucide-react';
const API = window.GYMCONTROL_API || '';
const TOKEN_KEY = 'gymcontrol_token';
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
];
const DAYS = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];
const DAY_LABEL = { SEGUNDA: 'Segunda-feira', TERCA: 'Terça-feira', QUARTA: 'Quarta-feira', QUINTA: 'Quinta-feira', SEXTA: 'Sexta-feira', SABADO: 'Sábado', DOMINGO: 'Domingo' };
const MUSCLE = ['PEITO', 'COSTAS', 'OMBRO', 'BICEPS', 'TRICEPS', 'ANTEBRACO', 'ABDOMEN', 'QUADRICEPS', 'POSTERIOR_COXA', 'GLUTEO', 'PANTURRILHA'];
const muscleLabel = v => ({ PEITO: 'Peito', COSTAS: 'Costas', OMBRO: 'Ombros', BICEPS: 'Bíceps', TRICEPS: 'Tríceps', ANTEBRACO: 'Antebraço', ABDOMEN: 'Abdômen', QUADRICEPS: 'Quadríceps', POSTERIOR_COXA: 'Posterior de coxa', GLUTEO: 'Glúteos', PANTURRILHA: 'Panturrilha' }[v] || v);
function readToken() { try {
    return localStorage.getItem(TOKEN_KEY) || '';
}
catch {
    return '';
} }
function tokenExpiry(token) { try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000;
}
catch {
    return 0;
} }
function saveToken(token) { localStorage.setItem(TOKEN_KEY, token); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }
async function api(path, options = {}) {
    const token = readToken();
    const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
    let response;
    try {
        response = await fetch(`${API}${path}`, { ...options, headers });
    }
    catch {
        throw new Error('Não foi possível conectar à API. Verifique se o servidor está disponível.');
    }
    if (response.status === 401 && !path.startsWith('/auth/')) {
        clearToken();
        window.dispatchEvent(new Event('gym-session-expired'));
        throw new Error('Sua sessão expirou. Entre novamente.');
    }
    if (!response.ok) {
        let message = `Erro ${response.status}. Não foi possível concluir a operação.`;
        try {
            const data = await response.json();
            message = data.detail || data.message || data.error || data.mensagem || message;
        }
        catch { }
        throw new Error(message);
    }
    if (response.status === 204)
        return null;
    const raw = await response.text();
    return raw ? JSON.parse(raw) : null;
}
const send = (path, method, data) => api(path, { method, body: JSON.stringify(data) });
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('overview');
    const [theme, setTheme] = useState(() => localStorage.getItem('gc_theme') || 'dark');
    const [accent, setAccent] = useState(() => localStorage.getItem('gc_accent') || 'red');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);
    const [toast, setToast] = useState(null);
    const [data, setData] = useState({ treinos: [], exercicios: [], maquinas: [], users: [] });
    const [refreshing, setRefreshing] = useState(false);
    const isAdmin = user?.role === 'ADM';
    const isProfessor = user?.role === 'PROF';
    const isStudent = user?.role === 'USER';
    const canManageWorkouts = isAdmin || isProfessor;
    const canManageMachines = isAdmin || isProfessor;
    useEffect(() => {
        const root = document.documentElement;
        root.dataset.theme = theme;
        const hex = COLORS.find(c => c.id === accent)?.value || COLORS[0].value;
        const rgb = hex.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16)).join(',');
        root.style.setProperty('--accent', hex);
        root.style.setProperty('--accent-rgb', rgb);
        const stone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420"><g fill="none" stroke="${hex}" stroke-opacity=".28" stroke-width="1.35"><path d="M-25 35 22 17 61 31 105 8 149 29 195 11 238 34 281 13 326 37 370 16 445 39M-30 91 15 73 54 90 99 65 143 87 187 69 232 92 276 70 321 93 365 74 450 98M-22 151 19 128 65 149 108 122 151 147 199 126 242 153 286 130 331 153 378 131 445 158M-30 211 13 187 58 207 102 181 148 205 194 183 239 210 284 187 329 212 373 190 450 218M-24 270 20 244 63 266 109 239 153 264 198 242 245 269 289 245 335 270 378 249 450 276M-28 329 17 303 62 325 106 298 153 325 197 300 242 329 287 303 332 330 377 306 450 337M-20 388 25 362 69 384 114 357 158 384 204 360 249 388 293 364 338 389 383 366 450 395"/><path d="m22 17 5 56 34-42 38 34 6-57 44 58 46-54 43 57 43-55 45 57 45-54 44 58M15 73l4 55 46 21 43-27 43 25 48-21 43 27 44-23 45 23 47-22 44 27M19 128l-6 59 45 20 44-26 46 24 46-22 45 27 45-23 45 25 47-22 46 28M13 187l7 57 43 22 46-27 44 25 45-22 47 27 44-24 46 25 45-21 70 27M20 244l-3 59 45 22 47-27 44 27 44-25 48 29 44-26 46 27 43-24 75 30"/></g></svg>`;
        root.style.setProperty('--texture', `url("data:image/svg+xml,${encodeURIComponent(stone)}")`);
        localStorage.setItem('gc_theme', theme);
        localStorage.setItem('gc_accent', accent);
    }, [theme, accent]);
    const notify = useCallback((message, type = 'success') => {
        setToast({ message, type });
        window.clearTimeout(notify.timer);
        notify.timer = window.setTimeout(() => setToast(null), 3800);
    }, []);
    const logout = useCallback(() => { clearToken(); setUser(null); setData({ treinos: [], exercicios: [], maquinas: [], users: [] }); setPage('overview'); }, []);
    const loadData = useCallback(async (currentUser = user) => {
        if (!currentUser)
            return;
        setRefreshing(true);
        try {
            if (currentUser.role === 'USER') {
                const treinos = await api('/treinos');
                setData({ treinos: treinos || [], exercicios: [], maquinas: [], users: [] });
            }
            else {
                const [treinos, exercicios, maquinas] = await Promise.all([
                    api('/treinos'), api('/exercicios'), api('/maquinas')
                ]);
                const users = currentUser.role === 'ADM' ? await api('/users') : (await api('/users/alunos')).map(u => ({ ...u, role: 'USER' }));
                setData({ treinos: treinos || [], exercicios: exercicios || [], maquinas: maquinas || [], users: users || [] });
            }
        }
        catch (error) {
            notify(error.message, 'error');
        }
        finally {
            setRefreshing(false);
        }
    }, [user, notify]);
    useEffect(() => {
        const onExpired = () => { setUser(null); notify('Sua sessão expirou. Entre novamente.', 'error'); };
        window.addEventListener('gym-session-expired', onExpired);
        const token = readToken();
        if (!token || tokenExpiry(token) < Date.now()) {
            clearToken();
            setLoading(false);
        }
        else
            api('/users/me').then(u => { setUser(u); setPage(u.role === 'USER' ? 'treinos' : 'overview'); return loadData(u); }).catch(() => clearToken()).finally(() => setLoading(false));
        return () => window.removeEventListener('gym-session-expired', onExpired);
    }, []);
    useEffect(() => {
        if (!user)
            return;
        const exp = tokenExpiry(readToken());
        const timer = window.setTimeout(() => { logout(); notify('Sua sessão expirou. Entre novamente.', 'error'); }, Math.max(0, exp - Date.now()));
        return () => window.clearTimeout(timer);
    }, [user, logout, notify]);
    const onLogin = async (token) => {
        saveToken(token);
        const current = await api('/users/me');
        setUser(current);
        setPage(current.role === 'USER' ? 'treinos' : 'overview');
        await loadData(current);
    };
    const changePage = p => { setPage(p); setMobileNav(false); };
    if (loading)
        return React.createElement("div", { className: "screen-loader" },
            React.createElement("div", { className: "brand-mark" },
                React.createElement(Activity, null)),
            React.createElement(LoaderCircle, { className: "spin", size: 22 }),
            React.createElement("span", null, "Preparando seu espa\u00E7o"));
    if (!user)
        return React.createElement(AuthScreen, { onLogin: onLogin, theme: theme, setTheme: setTheme, accent: accent, setAccent: setAccent, notify: notify });
    const nav = isStudent ? [
        { id: 'treinos', label: 'Treino do dia', icon: CalendarDays, group: 'workspace' }
    ] : [
        { id: 'overview', label: 'Visão geral', icon: LayoutDashboard, group: 'workspace' },
        { id: 'treinos', label: 'Treinos', icon: CalendarDays, group: 'workspace' },
        { id: 'exercicios', label: 'Exercícios', icon: ClipboardList, group: 'management' },
        { id: 'maquinas', label: 'Máquinas', icon: Dumbbell, group: 'management' },
        ...(isAdmin ? [{ id: 'usuarios', label: 'Usuários', icon: Users, group: 'admin' }] : []),
        { id: 'perfil', label: 'Meu perfil', icon: UserRound, group: 'account' }
    ];
    return React.createElement("div", { className: "app-shell" },
        mobileNav && React.createElement("button", { className: "mobile-scrim", onClick: () => setMobileNav(false), "aria-label": "Fechar menu" }),
        React.createElement("aside", { className: `sidebar ${mobileNav ? 'sidebar-open' : ''}` },
            React.createElement("div", { className: "sidebar-brand" },
                React.createElement("div", { className: "brand-mark" },
                    React.createElement(Activity, { size: 22 })),
                React.createElement("div", null,
                    React.createElement("strong", null,
                        "GYM",
                        React.createElement("span", null, "CONTROL")),
                    React.createElement("small", null, "TRAINING MANAGEMENT")),
                React.createElement("button", { className: "mobile-close icon-button", onClick: () => setMobileNav(false) },
                    React.createElement(X, null))),
            React.createElement("div", { className: "sidebar-user" },
                React.createElement("div", { className: "avatar" }, (user.nome || user.email || 'U').slice(0, 1).toUpperCase()),
                React.createElement("div", { className: "sidebar-user-info" },
                    React.createElement("strong", null, user.nome || 'Usuário'),
                    React.createElement("span", null, isAdmin ? 'Administrador' : isProfessor ? 'Professor' : 'Aluno')),
                React.createElement("span", { className: "online-dot" })),
            React.createElement("nav", { className: "nav-list" },
                React.createElement(NavGroup, { title: "PAINEL", items: nav.filter(n => n.group === 'workspace'), page: page, changePage: changePage }),
                !isStudent && React.createElement(NavGroup, { title: "GEST\u00C3O", items: nav.filter(n => n.group === 'management'), page: page, changePage: changePage }),
                isAdmin && React.createElement(NavGroup, { title: "ADMINISTRA\u00C7\u00C3O", items: nav.filter(n => n.group === 'admin'), page: page, changePage: changePage }),
                !isStudent && React.createElement(NavGroup, { title: "CONTA", items: nav.filter(n => n.group === 'account'), page: page, changePage: changePage })),
            React.createElement("div", { className: "sidebar-bottom" },
                React.createElement("div", { className: "sidebar-tip" },
                    React.createElement(Zap, { size: 17 }),
                    React.createElement("div", null,
                        React.createElement("strong", null, "Consist\u00EAncia gera resultado."),
                        React.createElement("span", null, "Um treino de cada vez."))),
                React.createElement("button", { className: "logout-button", onClick: logout },
                    React.createElement(LogOut, { size: 17 }),
                    " Sair da conta"),
                React.createElement("span", { className: "sidebar-version" }, "GYMCONTROL \u00B7 1.0"))),
        React.createElement("main", { className: "main-area" },
            React.createElement("header", { className: "topbar" },
                React.createElement("div", { className: "topbar-left" },
                    React.createElement("button", { className: "icon-button mobile-menu", onClick: () => setMobileNav(true) },
                        React.createElement(Menu, null)),
                    React.createElement("div", { className: "breadcrumb" },
                        React.createElement("span", null, "GymControl"),
                        React.createElement(ChevronRight, { size: 14 }),
                        React.createElement("strong", null, nav.find(n => n.id === page)?.label || 'Visão geral'))),
                React.createElement("div", { className: "topbar-actions" },
                    React.createElement("span", { className: "today-label" }, new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })),
                    React.createElement("button", { className: "icon-button", title: "Atualizar dados", onClick: () => loadData() },
                        React.createElement(RefreshCw, { size: 17, className: refreshing ? 'spin' : '' })),
                    React.createElement("div", { className: "settings-wrap" },
                        React.createElement("button", { className: "icon-button", title: "Apar\u00EAncia", onClick: () => setSettingsOpen(v => !v) },
                            React.createElement(SlidersHorizontal, { size: 18 })),
                        settingsOpen && React.createElement(AppearancePanel, { theme: theme, setTheme: setTheme, accent: accent, setAccent: setAccent, close: () => setSettingsOpen(false) })),
                    React.createElement("div", { className: "topbar-avatar", title: user.nome }, (user.nome || user.email).slice(0, 1).toUpperCase()))),
            React.createElement("div", { className: "page-content" },
                page === 'overview' && React.createElement(Overview, { user: user, data: data, changePage: changePage }),
                page === 'treinos' && React.createElement(Workouts, { data: data, reload: loadData, notify: notify, user: user }),
                page === 'exercicios' && React.createElement(Exercises, { data: data, reload: loadData, notify: notify, isAdmin: isAdmin }),
                page === 'maquinas' && React.createElement(Machines, { data: data, reload: loadData, notify: notify, canManage: canManageMachines }),
                page === 'usuarios' && isAdmin && React.createElement(UsersPage, { data: data, reload: loadData, notify: notify, me: user }),
                page === 'perfil' && !isStudent && React.createElement(Profile, { user: user, isAdmin: isAdmin, onUpdate: async (updated) => { setUser(updated); notify('Perfil atualizado.'); }, notify: notify })),
            React.createElement("footer", { className: "footer" },
                React.createElement("span", null,
                    "GYMCONTROL ",
                    React.createElement("i", null, "\u00B7"),
                    " Seu treino, sob controle."),
                React.createElement("span", null,
                    "FEITO PARA EVOLUIR ",
                    React.createElement(Activity, { size: 13 })))),
        toast && React.createElement("div", { className: `toast ${toast.type}` },
            React.createElement("span", { className: "toast-icon" }, toast.type === 'error' ? React.createElement(AlertCircle, { size: 18 }) : React.createElement(CheckCircle2, { size: 18 })),
            toast.message,
            React.createElement("button", { onClick: () => setToast(null) },
                React.createElement(X, { size: 15 }))));
}
function NavGroup({ title, items, page, changePage }) { return React.createElement("div", { className: "nav-group" },
    React.createElement("span", { className: "nav-group-title" }, title),
    items.map(item => React.createElement("button", { key: item.id, onClick: () => changePage(item.id), className: `nav-item ${page === item.id ? 'active' : ''}` },
        React.createElement(item.icon, { size: 18 }),
        React.createElement("span", null, item.label),
        page === item.id && React.createElement("span", { className: "nav-active-mark" })))); }
function AppearancePanel({ theme, setTheme, accent, setAccent, close }) { return React.createElement("div", { className: "appearance-panel" },
    React.createElement("div", { className: "panel-heading" },
        React.createElement("strong", null, "Apar\u00EAncia"),
        React.createElement("button", { className: "icon-button", onClick: close },
            React.createElement(X, { size: 16 }))),
    React.createElement("span", { className: "setting-label" }, "TEMA"),
    React.createElement("div", { className: "theme-choices" },
        React.createElement("button", { className: theme === 'dark' ? 'selected' : '', onClick: () => setTheme('dark') },
            React.createElement(Moon, { size: 17 }),
            "Escuro"),
        React.createElement("button", { className: theme === 'light' ? 'selected' : '', onClick: () => setTheme('light') },
            React.createElement(Sun, { size: 17 }),
            "Claro")),
    React.createElement("span", { className: "setting-label" }, "COR DE DESTAQUE"),
    React.createElement("div", { className: "color-grid" }, COLORS.map(c => React.createElement("button", { key: c.id, title: c.name, "aria-label": c.name, className: accent === c.id ? 'chosen' : '', style: { '--swatch': c.value }, onClick: () => setAccent(c.id) }, accent === c.id && React.createElement(Check, { size: 15 })))),
    React.createElement("p", { className: "panel-note" }, "A textura do painel acompanha a cor selecionada.")); }
function AuthScreen({ onLogin, theme, setTheme, accent, setAccent, notify }) {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [contato, setContato] = useState('');
    const [busy, setBusy] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const changeMode = nextMode => {
        setMode(nextMode);
        setPassword('');
        setConfirmPassword('');
    };
    const submit = async (e) => {
        e.preventDefault();
        if (mode === 'register' && password !== confirmPassword) {
            notify('As senhas não coincidem.', 'error');
            return;
        }
        setBusy(true);
        try {
            if (mode === 'login') {
                const result = await send('/auth/login', 'POST', { email: email.trim(), password });
                await onLogin(result.token);
            }
            else {
                await send('/auth/register', 'POST', {
                    nome: nome.trim(),
                    cpf: cpf.trim(),
                    contato: contato.trim(),
                    email: email.trim(),
                    password
                });
                notify('Conta criada com sucesso. Faça login para continuar.');
                changeMode('login');
                setNome('');
                setCpf('');
                setContato('');
            }
        }
        catch (err) {
            notify(err.message, 'error');
        }
        finally {
            setBusy(false);
        }
    };
    return React.createElement("div", { className: `auth-screen ${mode === 'register' ? 'auth-register' : ''}` },
        React.createElement("div", { className: "auth-texture" }),
        React.createElement("div", { className: "auth-top" },
            React.createElement("div", { className: "sidebar-brand" },
                React.createElement("div", { className: "brand-mark" },
                    React.createElement(Activity, null)),
                React.createElement("div", null,
                    React.createElement("strong", null,
                        "GYM",
                        React.createElement("span", null, "CONTROL")),
                    React.createElement("small", null, "TRAINING MANAGEMENT"))),
            React.createElement("div", { className: "auth-tools" },
                React.createElement("button", { className: "auth-theme", onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
                    theme === 'dark' ? React.createElement(Sun, { size: 17 }) : React.createElement(Moon, { size: 17 }),
                    React.createElement("span", null, theme === 'dark' ? 'Modo claro' : 'Modo escuro')),
                React.createElement("button", { className: "auth-theme", onClick: () => document.getElementById('auth-colors')?.classList.toggle('show') },
                    React.createElement(Palette, { size: 17 }),
                    React.createElement("span", null, "Cor")),
                React.createElement("div", { id: "auth-colors", className: "auth-color-pop" }, COLORS.map(c => React.createElement("button", { key: c.id, style: { background: c.value }, onClick: () => setAccent(c.id), "aria-label": c.name }))))),
        React.createElement("div", { className: "auth-layout" },
            React.createElement("section", { className: "auth-hero" },
                React.createElement("span", { className: "eyebrow" },
                    React.createElement("span", null),
                    " PERFORMANCE, ORGANIZA\u00C7\u00C3O E EVOLU\u00C7\u00C3O"),
                React.createElement("h1", null,
                    "SEU PR\u00D3XIMO",
                    React.createElement("br", null),
                    "N\u00CDVEL COME\u00C7A",
                    React.createElement("br", null),
                    React.createElement("em", null, "NO TREINO.")),
                React.createElement("p", null, "Organize sua rotina, acompanhe seus exerc\u00EDcios e mantenha o foco no que realmente importa: sua evolu\u00E7\u00E3o."),
                React.createElement("div", { className: "auth-stats" },
                    React.createElement("div", null,
                        React.createElement("strong", null, "01"),
                        React.createElement("span", null, "PLANEJE")),
                    React.createElement("div", null,
                        React.createElement("strong", null, "02"),
                        React.createElement("span", null, "EXECUTE")),
                    React.createElement("div", null,
                        React.createElement("strong", null, "03"),
                        React.createElement("span", null, "EVOLUA"))),
                React.createElement("div", { className: "hero-watermark" },
                    "GC",
                    React.createElement("span", null, "."))),
            React.createElement("section", { className: "auth-card-wrap" },
                React.createElement("div", { className: "auth-card" },
                    React.createElement("div", { className: "auth-card-kicker" }, mode === 'login' ? 'ÁREA DE ACESSO' : 'NOVO CADASTRO'),
                    React.createElement("h2", null, mode === 'login' ? 'Bem-vindo ao GymControl.' : 'Crie sua conta.'),
                    React.createElement("p", { className: "auth-description" }, mode === 'login' ? 'Entre com seus dados para acessar seus treinos.' : 'Preencha seus dados para criar seu acesso ao GymControl.'),
                    React.createElement("form", { onSubmit: submit, className: "auth-form" },
                        mode === 'register' && React.createElement(React.Fragment, null,
                            React.createElement(FormField, { label: "Nome completo", icon: UserRound },
                                React.createElement("input", { autoComplete: "name", value: nome, onChange: e => setNome(e.target.value), required: true, maxLength: 120, placeholder: "Seu nome completo" })),
                            React.createElement(FormField, { label: "CPF", icon: Hash },
                                React.createElement("input", { inputMode: "numeric", autoComplete: "off", value: cpf, onChange: e => setCpf(e.target.value), required: true, maxLength: 14, placeholder: "000.000.000-00" })),
                            React.createElement(FormField, { label: "Contato (opcional)", icon: Phone },
                                React.createElement("input", { type: "tel", autoComplete: "tel", value: contato, onChange: e => setContato(e.target.value), maxLength: 30, placeholder: "(00) 00000-0000" }))),
                        React.createElement(FormField, { label: "E-mail", icon: Mail },
                            React.createElement("input", { type: "email", autoComplete: "email", value: email, onChange: e => setEmail(e.target.value), required: true, maxLength: 180, placeholder: "voce@email.com" })),
                        React.createElement(FormField, { label: "Senha", icon: Lock },
                            React.createElement("input", { type: showPassword ? 'text' : 'password', autoComplete: mode === 'login' ? 'current-password' : 'new-password', value: password, onChange: e => setPassword(e.target.value), required: true, minLength: mode === 'register' ? 6 : 1, placeholder: mode === 'register' ? 'Mínimo de 6 caracteres' : 'Sua senha' }),
                            React.createElement("button", { type: "button", className: "password-toggle", onClick: () => setShowPassword(v => !v), "aria-label": showPassword ? 'Ocultar senha' : 'Mostrar senha' }, showPassword ? React.createElement(EyeOff, { size: 17 }) : React.createElement(Eye, { size: 17 }))),
                        mode === 'register' && React.createElement(FormField, { label: "Confirmar senha", icon: Lock },
                            React.createElement("input", { type: showConfirmPassword ? 'text' : 'password', autoComplete: "new-password", value: confirmPassword, onChange: e => setConfirmPassword(e.target.value), required: true, minLength: 6, placeholder: "Digite a senha novamente" }),
                            React.createElement("button", { type: "button", className: "password-toggle", onClick: () => setShowConfirmPassword(v => !v), "aria-label": showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação' }, showConfirmPassword ? React.createElement(EyeOff, { size: 17 }) : React.createElement(Eye, { size: 17 }))),
                        React.createElement("button", { className: "primary-button auth-submit", disabled: busy },
                            busy ? React.createElement(LoaderCircle, { className: "spin", size: 18 }) : null,
                            mode === 'login' ? 'ENTRAR NO PAINEL' : 'CRIAR MINHA CONTA',
                            React.createElement(ArrowUpRight, { size: 18 }))),
                    React.createElement("div", { className: "auth-switch" },
                        mode === 'login' ? 'Ainda não tem uma conta?' : 'Já possui uma conta?',
                        " ",
                        React.createElement("button", { type: "button", onClick: () => changeMode(mode === 'login' ? 'register' : 'login') }, mode === 'login' ? 'Criar conta' : 'Fazer login')),
                    React.createElement("div", { className: "auth-security" },
                        React.createElement(ShieldCheck, { size: 15 }),
                        " ACESSO PROTEGIDO POR AUTENTICA\u00C7\u00C3O")))),
        React.createElement("div", { className: "auth-bottom" },
            React.createElement("span", null,
                "GYMCONTROL \u00A9 ",
                new Date().getFullYear()),
            React.createElement("span", null, "DISCIPLINA CONSTR\u00D3I RESULTADOS.")));
}
function FormField({ label, icon: Icon, children }) { return React.createElement("label", { className: "form-field" },
    React.createElement("span", null, label),
    React.createElement("div", { className: "form-input-wrap" },
        React.createElement(Icon, { size: 17 }),
        children)); }
function PageHeading({ eyebrow, title, description, action }) { return React.createElement("div", { className: "page-heading" },
    React.createElement("div", null,
        React.createElement("span", { className: "eyebrow" },
            React.createElement("span", null),
            eyebrow),
        React.createElement("h1", null, title),
        React.createElement("p", null, description)),
    action); }
function StatCard({ label, value, detail, icon: Icon, trend }) { return React.createElement("div", { className: "stat-card" },
    React.createElement("div", { className: "stat-top" },
        React.createElement("span", null, label),
        React.createElement("div", { className: "stat-icon" },
            React.createElement(Icon, { size: 19 }))),
    React.createElement("div", { className: "stat-value" }, value),
    React.createElement("div", { className: "stat-detail" },
        trend && React.createElement("span", { className: "stat-trend" },
            React.createElement(TrendingUp, { size: 13 }),
            trend),
        detail)); }
function Overview({ user, data, changePage }) {
    const totalExercises = data.exercicios.length, totalWorkouts = data.treinos.length, totalMachines = data.maquinas.length;
    const recent = [...data.treinos].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 4);
    const counts = data.treinos.reduce((acc, t) => { acc[t.diaSemana] = (acc[t.diaSemana] || 0) + 1; return acc; }, {});
    const maxCount = Math.max(1, ...Object.values(counts));
    return React.createElement(React.Fragment, null,
        React.createElement(PageHeading, { eyebrow: "SEU CENTRO DE COMANDO", title: React.createElement(React.Fragment, null,
                "Ol\u00E1, ",
                user.nome?.split(' ')[0] || 'atleta',
                React.createElement("span", { className: "title-period" }, ".")), description: "Acompanhe sua rotina e mantenha o ritmo da evolu\u00E7\u00E3o.", action: React.createElement("button", { className: "primary-button", onClick: () => changePage('treinos') },
                React.createElement(Plus, { size: 17 }),
                " NOVO TREINO") }),
        React.createElement("div", { className: "welcome-strip" },
            React.createElement("div", { className: "welcome-copy" },
                React.createElement("span", null, "FOCO NO PROCESSO"),
                React.createElement("h2", null,
                    "Resultado \u00E9 consequ\u00EAncia.",
                    React.createElement("br", null),
                    React.createElement("em", null, "Consist\u00EAncia \u00E9 escolha.")),
                React.createElement("p", null, "Seu espa\u00E7o para planejar, registrar e evoluir a cada sess\u00E3o.")),
            React.createElement("div", { className: "welcome-art" },
                React.createElement("div", { className: "art-ring ring-one" }),
                React.createElement("div", { className: "art-ring ring-two" }),
                React.createElement(Dumbbell, { size: 112, strokeWidth: 1.1 }),
                React.createElement("span", null,
                    "TRAIN",
                    React.createElement("br", null),
                    "HARD")),
            React.createElement("div", { className: "welcome-index" }, "GC / 001")),
        React.createElement("div", { className: "stats-grid" },
            React.createElement(StatCard, { label: "TREINOS CADASTRADOS", value: totalWorkouts.toString().padStart(2, '0'), detail: "na sua rotina", icon: CalendarDays }),
            React.createElement(StatCard, { label: "EXERC\u00CDCIOS DISPON\u00CDVEIS", value: totalExercises.toString().padStart(2, '0'), detail: "no cat\u00E1logo", icon: Target }),
            React.createElement(StatCard, { label: "M\u00C1QUINAS", value: totalMachines.toString().padStart(2, '0'), detail: "cadastradas", icon: Dumbbell }),
            React.createElement(StatCard, { label: "EXERC\u00CDCIOS PLANEJADOS", value: data.treinos.reduce((s, t) => s + (t.itens?.length || 0), 0).toString().padStart(2, '0'), detail: "em todos os treinos", icon: Activity })),
        React.createElement("div", { className: "overview-grid" },
            React.createElement("section", { className: "panel week-panel" },
                React.createElement("div", { className: "panel-header" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "section-kicker" }, "DISTRIBUI\u00C7\u00C3O"),
                        React.createElement("h3", null, "Treinos na semana")),
                    React.createElement("span", { className: "panel-tag" }, "VIS\u00C3O GERAL")),
                React.createElement("div", { className: "week-bars" }, DAYS.map(day => { const value = counts[day] || 0; return React.createElement("div", { className: "week-bar-col", key: day },
                    React.createElement("span", { className: "bar-number" }, value || ''),
                    React.createElement("div", { className: "bar-track" },
                        React.createElement("div", { className: "bar-fill", style: { height: `${value ? Math.max(10, value / maxCount * 100) : 3}%` } })),
                    React.createElement("span", { className: "bar-day" }, day.slice(0, 3))); })),
                React.createElement("div", { className: "week-foot" },
                    React.createElement("span", null,
                        React.createElement("i", null),
                        " Treinos cadastrados"),
                    React.createElement("strong", null,
                        totalWorkouts,
                        " NO TOTAL"))),
            React.createElement("section", { className: "panel recent-panel" },
                React.createElement("div", { className: "panel-header" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "section-kicker" }, "ATIVIDADE"),
                        React.createElement("h3", null, "Treinos recentes")),
                    React.createElement("button", { className: "text-action", onClick: () => changePage('treinos') },
                        "Ver todos ",
                        React.createElement(ArrowUpRight, { size: 15 }))),
                recent.length === 0 ? React.createElement(EmptyState, { icon: CalendarDays, title: "Sua rotina come\u00E7a aqui", text: "Cadastre seu primeiro treino para visualizar sua semana." }) : React.createElement("div", { className: "recent-list" }, recent.map(t => React.createElement("div", { className: "recent-item", key: t.id },
                    React.createElement("div", { className: "recent-day-icon" },
                        React.createElement(CalendarDays, { size: 18 })),
                    React.createElement("div", { className: "recent-item-main" },
                        React.createElement("strong", null, DAY_LABEL[t.diaSemana] || t.diaSemana),
                        React.createElement("span", null,
                            t.itens?.length || 0,
                            " exerc\u00EDcios \u00B7 Treino #",
                            t.id)),
                    React.createElement("span", { className: "recent-status" }, "CADASTRADO"),
                    React.createElement(ChevronRight, { size: 16 })))))),
        React.createElement("div", { className: "quick-actions" },
            React.createElement("div", null,
                React.createElement("span", { className: "section-kicker" }, "ACESSO R\u00C1PIDO"),
                React.createElement("h3", null, "O que vamos organizar hoje?")),
            React.createElement("button", { onClick: () => changePage('exercicios') },
                React.createElement(ClipboardList, null),
                React.createElement("span", null,
                    React.createElement("strong", null, "Exerc\u00EDcios"),
                    React.createElement("small", null, "Consultar cat\u00E1logo")),
                React.createElement(ArrowUpRight, null)),
            React.createElement("button", { onClick: () => changePage('maquinas') },
                React.createElement(Dumbbell, null),
                React.createElement("span", null,
                    React.createElement("strong", null, "M\u00E1quinas"),
                    React.createElement("small", null, "Ver equipamentos")),
                React.createElement(ArrowUpRight, null))));
}
function EmptyState({ icon: Icon, title, text, action }) { return React.createElement("div", { className: "empty-state" },
    React.createElement("div", null,
        React.createElement(Icon, { size: 23 })),
    React.createElement("strong", null, title),
    React.createElement("p", null, text),
    action); }
function Modal({ title, subtitle, onClose, children, wide = false }) { return React.createElement("div", { className: "modal-backdrop", onMouseDown: e => e.target === e.currentTarget && onClose() },
    React.createElement("div", { className: `modal ${wide ? 'modal-wide' : ''}` },
        React.createElement("div", { className: "modal-header" },
            React.createElement("div", null,
                React.createElement("span", { className: "section-kicker" }, "GYMCONTROL / FORMUL\u00C1RIO"),
                React.createElement("h2", null, title),
                subtitle && React.createElement("p", null, subtitle)),
            React.createElement("button", { className: "icon-button", onClick: onClose },
                React.createElement(X, null))),
        children)); }
function Field({ label, children, hint }) { return React.createElement("label", { className: "field" },
    React.createElement("span", null, label),
    children,
    hint && React.createElement("small", null, hint)); }
function FormActions({ onCancel, busy, label = 'Salvar' }) { return React.createElement("div", { className: "form-actions" },
    React.createElement("button", { type: "button", className: "secondary-button", onClick: onCancel }, "Cancelar"),
    React.createElement("button", { className: "primary-button", disabled: busy },
        busy ? React.createElement(LoaderCircle, { className: "spin", size: 17 }) : React.createElement(Save, { size: 16 }),
        " ",
        label)); }
function ConfirmDelete({ item, onClose, onConfirm, busy }) { return React.createElement(Modal, { title: "Excluir registro", subtitle: "Essa a\u00E7\u00E3o n\u00E3o pode ser desfeita.", onClose: onClose },
    React.createElement("p", { className: "confirm-copy" },
        "Tem certeza de que deseja excluir ",
        React.createElement("strong", null, item),
        "?"),
    React.createElement("div", { className: "form-actions" },
        React.createElement("button", { className: "secondary-button", onClick: onClose }, "Cancelar"),
        React.createElement("button", { className: "danger-button", onClick: onConfirm, disabled: busy },
            busy ? React.createElement(LoaderCircle, { className: "spin", size: 16 }) : React.createElement(Trash2, { size: 16 }),
            " Excluir"))); }
function Workouts({ data, reload, notify, user }) {
    const isAdmin = user.role === 'ADM', isProfessor = user.role === 'PROF', isStudent = user.role === 'USER';
    const canManage = isAdmin || isProfessor;
    const [modal, setModal] = useState(false), [editing, setEditing] = useState(null), [deleting, setDeleting] = useState(null), [busy, setBusy] = useState(false), [search, setSearch] = useState('');
    const blankItem = () => ({ exercicioId: '', series: 3, repeticoes: 12, carga: 0, ordem: 1 });
    const [day, setDay] = useState('SEGUNDA'), [items, setItems] = useState([blankItem()]), [alunoId, setAlunoId] = useState('');
    const today = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'][new Date().getDay()];
    const open = (t = null) => { setEditing(t); setDay(t?.diaSemana || 'SEGUNDA'); setAlunoId(t?.alunoId && t.alunoId !== user.id ? String(t.alunoId) : ''); setItems(t?.itens?.length ? t.itens.map((i, index) => ({ exercicioId: String(data.exercicios.find(e => e.nome === i.exercicio)?.id || ''), series: i.series, repeticoes: i.repeticoes, carga: i.carga, ordem: i.ordem ?? index + 1 })) : [blankItem()]); setModal(true); };
    const updateItem = (index, key, value) => setItems(old => old.map((it, i) => i === index ? { ...it, [key]: value } : it));
    const submit = async (e) => { e.preventDefault(); if (items.some(i => !i.exercicioId)) {
        notify('Selecione um exercício para cada item.', 'error');
        return;
    } setBusy(true); try {
        const payload = { diaSemana: day, alunoId: alunoId ? Number(alunoId) : null, itens: items.map((i, index) => ({ exercicioId: Number(i.exercicioId), series: Number(i.series), repeticoes: Number(i.repeticoes), carga: Number(i.carga), ordem: index + 1 })) };
        if (editing)
            await send(`/treinos/${editing.id}`, 'PUT', payload);
        else
            await send('/treinos', 'POST', payload);
        notify(editing ? 'Treino atualizado.' : 'Treino cadastrado.');
        setModal(false);
        await reload();
    }
    catch (err) {
        notify(err.message, 'error');
    }
    finally {
        setBusy(false);
    } };
    const remove = async () => { setBusy(true); try {
        await api(`/treinos/${deleting.id}`, { method: 'DELETE' });
        notify('Treino excluído.');
        setDeleting(null);
        await reload();
    }
    catch (e) {
        notify(e.message, 'error');
    }
    finally {
        setBusy(false);
    } };
    const visible = data.treinos.filter(t => !isStudent || t.diaSemana === today);
    const filtered = visible.filter(t => (DAY_LABEL[t.diaSemana] || t.diaSemana).toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search) || (t.alunoNome || '').toLowerCase().includes(search.toLowerCase()));
    return React.createElement(React.Fragment, null,
        React.createElement(PageHeading, { eyebrow: isStudent ? 'ROTINA DE HOJE' : 'PLANEJAMENTO', title: isStudent ? 'Meu treino de hoje' : 'Treinos', description: isStudent ? 'Confira os exercícios programados para hoje.' : isProfessor ? 'Consulte os treinos dos alunos e monte novas rotinas.' : 'Gerencie os treinos cadastrados na academia.', action: canManage && React.createElement("button", { className: "primary-button", onClick: () => open() },
                React.createElement(Plus, { size: 17 }),
                " CRIAR TREINO") }),
        !isStudent && React.createElement("div", { className: "toolbar" },
            React.createElement("div", { className: "search-box" },
                React.createElement(Search, { size: 17 }),
                React.createElement("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar por dia, aluno ou c\u00F3digo..." })),
            React.createElement("span", { className: "result-count" },
                filtered.length,
                " ",
                filtered.length === 1 ? 'treino' : 'treinos')),
        filtered.length === 0 ? React.createElement("div", { className: "panel empty-panel" },
            React.createElement(EmptyState, { icon: CalendarDays, title: isStudent ? 'Nenhum treino para hoje' : 'Nenhum treino encontrado', text: isStudent ? 'Não há exercícios programados para hoje.' : 'Crie um treino para começar a organizar a rotina.', action: canManage && React.createElement("button", { className: "primary-button", onClick: () => open() },
                    React.createElement(Plus, { size: 16 }),
                    " Criar treino") })) : React.createElement("div", { className: "workout-grid" }, filtered.map(t => React.createElement("article", { className: "workout-card", key: t.id },
            React.createElement("div", { className: "workout-card-top" },
                React.createElement("span", { className: "workout-id" },
                    "TREINO / ",
                    String(t.id).padStart(3, '0')),
                canManage && React.createElement("div", { className: "card-actions" },
                    React.createElement("button", { className: "icon-button", onClick: () => open(t), title: "Editar" },
                        React.createElement(Pencil, { size: 16 })),
                    React.createElement("button", { className: "icon-button danger-hover", onClick: () => setDeleting(t), title: "Excluir" },
                        React.createElement(Trash2, { size: 16 })))),
            React.createElement("div", { className: "workout-day" },
                React.createElement("div", { className: "workout-day-icon" },
                    React.createElement(CalendarDays, { size: 21 })),
                React.createElement("div", null,
                    React.createElement("span", null, t.alunoNome && t.alunoId !== user.id ? 'RESPONSÁVEL' : 'DIA DE TREINO'),
                    React.createElement("h3", null, DAY_LABEL[t.diaSemana] || t.diaSemana),
                    t.alunoNome && t.alunoId !== user.id && React.createElement("small", null, t.alunoNome))),
            React.createElement("div", { className: "workout-divider" }),
            React.createElement("div", { className: "workout-card-meta" },
                React.createElement("span", null,
                    React.createElement(ClipboardList, { size: 15 }),
                    t.itens?.length || 0,
                    " exerc\u00EDcios"),
                React.createElement("span", null,
                    React.createElement(Clock3, { size: 15 }),
                    "Rotina semanal")),
            React.createElement("div", { className: "workout-exercises" },
                (t.itens || []).slice(0, 3).map((i, index) => React.createElement("div", { key: i.id || index },
                    React.createElement("span", null, String(index + 1).padStart(2, '0')),
                    i.exercicio,
                    React.createElement("small", null,
                        i.series,
                        " \u00D7 ",
                        i.repeticoes))),
                (t.itens || []).length > 3 && React.createElement("span", { className: "more-exercises" },
                    "+ ",
                    (t.itens || []).length - 3,
                    " exerc\u00EDcios"))))),
        modal && React.createElement(Modal, { title: editing ? 'Editar treino' : 'Novo treino', subtitle: "Defina o aluno, o dia e os exerc\u00EDcios da sess\u00E3o.", onClose: () => setModal(false), wide: true },
            React.createElement("form", { onSubmit: submit },
                React.createElement("div", { className: "form-grid" },
                    canManage && React.createElement(Field, { label: "Aluno (opcional)" },
                        React.createElement("select", { value: alunoId, onChange: e => setAlunoId(e.target.value) },
                            React.createElement("option", { value: "" }, "Treino para mim"),
                            data.users.filter(u => isAdmin || u.role === 'USER').map(u => React.createElement("option", { key: u.id, value: u.id },
                                u.nome,
                                " \u00B7 ",
                                u.role === 'PROF' ? 'Professor' : u.role === 'ADM' ? 'Administrador' : 'Aluno')))),
                    React.createElement(Field, { label: "Dia da semana" },
                        React.createElement("select", { value: day, onChange: e => setDay(e.target.value) }, DAYS.map(d => React.createElement("option", { key: d, value: d }, DAY_LABEL[d]))))),
                React.createElement("div", { className: "items-heading" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "section-kicker" }, "COMPOSI\u00C7\u00C3O DO TREINO"),
                        React.createElement("h3", null,
                            "Exerc\u00EDcios ",
                            React.createElement("b", null, items.length))),
                    React.createElement("button", { type: "button", className: "secondary-button compact", onClick: () => setItems(old => [...old, blankItem()]) },
                        React.createElement(Plus, { size: 15 }),
                        " Adicionar exerc\u00EDcio")),
                items.map((item, index) => React.createElement("div", { className: "exercise-form-row", key: index },
                    React.createElement("div", { className: "exercise-row-number" }, String(index + 1).padStart(2, '0')),
                    React.createElement("div", { className: "exercise-row-fields" },
                        React.createElement(Field, { label: "Exerc\u00EDcio" },
                            React.createElement("select", { value: item.exercicioId, onChange: e => updateItem(index, 'exercicioId', e.target.value), required: true },
                                React.createElement("option", { value: "" }, "Selecione..."),
                                data.exercicios.map(ex => React.createElement("option", { key: ex.id, value: ex.id },
                                    ex.nome,
                                    " \u00B7 ",
                                    muscleLabel(ex.agrupamento))))),
                        React.createElement(Field, { label: "S\u00E9ries" },
                            React.createElement("input", { type: "number", min: "1", value: item.series, onChange: e => updateItem(index, 'series', e.target.value), required: true })),
                        React.createElement(Field, { label: "Repeti\u00E7\u00F5es" },
                            React.createElement("input", { type: "number", min: "1", value: item.repeticoes, onChange: e => updateItem(index, 'repeticoes', e.target.value), required: true })),
                        React.createElement(Field, { label: "Carga (kg)" },
                            React.createElement("input", { type: "number", min: "0", step: "0.5", value: item.carga, onChange: e => updateItem(index, 'carga', e.target.value), required: true }))),
                    items.length > 1 && React.createElement("button", { type: "button", className: "remove-item", onClick: () => setItems(old => old.filter((_, i) => i !== index)) },
                        React.createElement(X, { size: 16 })))),
                data.exercicios.length === 0 && React.createElement("p", { className: "inline-warning" }, "Ainda n\u00E3o existem exerc\u00EDcios cadastrados no cat\u00E1logo."),
                React.createElement(FormActions, { onCancel: () => setModal(false), busy: busy, label: editing ? 'Salvar alterações' : 'Criar treino' }))),
        deleting && React.createElement(ConfirmDelete, { item: `Treino de ${DAY_LABEL[deleting.diaSemana] || deleting.diaSemana}`, onClose: () => setDeleting(null), onConfirm: remove, busy: busy }));
}
function Exercises({ data, reload, notify, isAdmin }) {
    const [modal, setModal] = useState(false), [editing, setEditing] = useState(null), [deleting, setDeleting] = useState(null), [busy, setBusy] = useState(false), [search, setSearch] = useState(''), [group, setGroup] = useState('TODOS');
    const [form, setForm] = useState({ nome: '', agrupamento: 'PEITO', maquinaId: '' });
    const open = (item = null) => { setEditing(item); setForm(item ? { nome: item.nome, agrupamento: item.agrupamento, maquinaId: String(data.maquinas.find(m => m.nome === item.maquina)?.id || '') } : { nome: '', agrupamento: 'PEITO', maquinaId: '' }); setModal(true); };
    const submit = async (e) => { e.preventDefault(); setBusy(true); try {
        const payload = { nome: form.nome.trim(), agrupamento: form.agrupamento, maquinaId: form.maquinaId ? Number(form.maquinaId) : null };
        if (editing)
            await send(`/exercicios/${editing.id}`, 'PUT', payload);
        else
            await send('/exercicios', 'POST', payload);
        notify(editing ? 'Exercício atualizado.' : 'Exercício cadastrado.');
        setModal(false);
        await reload();
    }
    catch (err) {
        notify(err.message, 'error');
    }
    finally {
        setBusy(false);
    } };
    const remove = async () => { setBusy(true); try {
        await api(`/exercicios/${deleting.id}`, { method: 'DELETE' });
        notify('Exercício excluído.');
        setDeleting(null);
        await reload();
    }
    catch (e) {
        notify(e.message, 'error');
    }
    finally {
        setBusy(false);
    } };
    const filtered = data.exercicios.filter(i => (group === 'TODOS' || i.agrupamento === group) && `${i.nome} ${i.maquina || ''}`.toLowerCase().includes(search.toLowerCase()));
    return React.createElement(React.Fragment, null,
        React.createElement(PageHeading, { eyebrow: "BIBLIOTECA DE MOVIMENTOS", title: "Exerc\u00EDcios", description: "Consulte os movimentos dispon\u00EDveis e seus agrupamentos musculares.", action: isAdmin && React.createElement("button", { className: "primary-button", onClick: () => open() },
                React.createElement(Plus, { size: 17 }),
                " NOVO EXERC\u00CDCIO") }),
        React.createElement("div", { className: "toolbar" },
            React.createElement("div", { className: "search-box" },
                React.createElement(Search, { size: 17 }),
                React.createElement("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar exerc\u00EDcio..." })),
            React.createElement("div", { className: "filter-wrap" },
                React.createElement(Filter, { size: 16 }),
                React.createElement("select", { value: group, onChange: e => setGroup(e.target.value) },
                    React.createElement("option", { value: "TODOS" }, "Todos os grupos"),
                    MUSCLE.map(m => React.createElement("option", { key: m, value: m }, muscleLabel(m))))),
            React.createElement("span", { className: "result-count" },
                filtered.length,
                " resultados")),
        filtered.length === 0 ? React.createElement("div", { className: "panel empty-panel" },
            React.createElement(EmptyState, { icon: ClipboardList, title: "Nenhum exerc\u00EDcio encontrado", text: "Ajuste os filtros ou cadastre um novo movimento.", action: isAdmin && React.createElement("button", { className: "primary-button", onClick: () => open() },
                    React.createElement(Plus, { size: 16 }),
                    " Novo exerc\u00EDcio") })) : React.createElement("div", { className: "catalog-grid" }, filtered.map((ex, index) => React.createElement("article", { className: "catalog-card", key: ex.id },
            React.createElement("div", { className: "catalog-card-top" },
                React.createElement("span", { className: "catalog-number" },
                    "EX / ",
                    String(ex.id).padStart(3, '0')),
                React.createElement("div", { className: "catalog-symbol" },
                    React.createElement(Activity, { size: 20 }))),
            React.createElement("h3", null, ex.nome),
            React.createElement("span", { className: "muscle-chip" }, muscleLabel(ex.agrupamento)),
            React.createElement("div", { className: "catalog-card-bottom" },
                React.createElement("span", null,
                    React.createElement(Dumbbell, { size: 14 }),
                    ex.maquina || 'Peso livre / sem máquina'),
                isAdmin && React.createElement("div", { className: "card-actions" },
                    React.createElement("button", { className: "icon-button", onClick: () => open(ex) },
                        React.createElement(Pencil, { size: 15 })),
                    React.createElement("button", { className: "icon-button danger-hover", onClick: () => setDeleting(ex) },
                        React.createElement(Trash2, { size: 15 }))))))),
        modal && React.createElement(Modal, { title: editing ? 'Editar exercício' : 'Cadastrar exercício', subtitle: "Adicione um movimento ao cat\u00E1logo da academia.", onClose: () => setModal(false) },
            React.createElement("form", { onSubmit: submit, className: "modal-form" },
                React.createElement(Field, { label: "Nome do exerc\u00EDcio" },
                    React.createElement("input", { value: form.nome, onChange: e => setForm({ ...form, nome: e.target.value }), required: true, placeholder: "Ex.: Supino reto" })),
                React.createElement(Field, { label: "Agrupamento muscular" },
                    React.createElement("select", { value: form.agrupamento, onChange: e => setForm({ ...form, agrupamento: e.target.value }) }, MUSCLE.map(m => React.createElement("option", { key: m, value: m }, muscleLabel(m))))),
                React.createElement(Field, { label: "M\u00E1quina / equipamento" },
                    React.createElement("select", { value: form.maquinaId, onChange: e => setForm({ ...form, maquinaId: e.target.value }) },
                        React.createElement("option", { value: "" }, "Sem m\u00E1quina vinculada"),
                        data.maquinas.map(m => React.createElement("option", { key: m.id, value: m.id }, m.nome)))),
                React.createElement(FormActions, { onCancel: () => setModal(false), busy: busy, label: editing ? 'Salvar alterações' : 'Cadastrar exercício' }))),
        deleting && React.createElement(ConfirmDelete, { item: deleting.nome, onClose: () => setDeleting(null), onConfirm: remove, busy: busy }));
}
function Machines({ data, reload, notify, canManage }) {
    const [modal, setModal] = useState(false), [editing, setEditing] = useState(null), [deleting, setDeleting] = useState(null), [busy, setBusy] = useState(false), [search, setSearch] = useState(''), [form, setForm] = useState({ nome: '', fabricante: '' });
    const open = m => { setEditing(m || null); setForm(m ? { nome: m.nome, fabricante: m.fabricante || '' } : { nome: '', fabricante: '' }); setModal(true); };
    const submit = async (e) => { e.preventDefault(); setBusy(true); try {
        const payload = { nome: form.nome.trim(), fabricante: form.fabricante.trim() || null };
        if (editing)
            await send(`/maquinas/${editing.id}`, 'PUT', payload);
        else
            await send('/maquinas', 'POST', payload);
        notify(editing ? 'Máquina atualizada.' : 'Máquina cadastrada.');
        setModal(false);
        await reload();
    }
    catch (err) {
        notify(err.message, 'error');
    }
    finally {
        setBusy(false);
    } };
    const remove = async () => { setBusy(true); try {
        await api(`/maquinas/${deleting.id}`, { method: 'DELETE' });
        notify('Máquina excluída.');
        setDeleting(null);
        await reload();
    }
    catch (e) {
        notify(e.message, 'error');
    }
    finally {
        setBusy(false);
    } };
    const filtered = data.maquinas.filter(m => `${m.nome} ${m.fabricante || ''}`.toLowerCase().includes(search.toLowerCase()));
    return React.createElement(React.Fragment, null,
        React.createElement(PageHeading, { eyebrow: "ESTRUTURA DA ACADEMIA", title: "M\u00E1quinas", description: "Gerencie os equipamentos e fabricantes dispon\u00EDveis.", action: canManage && React.createElement("button", { className: "primary-button", onClick: () => open() },
                React.createElement(Plus, { size: 17 }),
                " NOVA M\u00C1QUINA") }),
        React.createElement("div", { className: "toolbar" },
            React.createElement("div", { className: "search-box" },
                React.createElement(Search, { size: 17 }),
                React.createElement("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar equipamento..." })),
            React.createElement("span", { className: "result-count" },
                filtered.length,
                " equipamentos")),
        filtered.length === 0 ? React.createElement("div", { className: "panel empty-panel" },
            React.createElement(EmptyState, { icon: Dumbbell, title: "Nenhuma m\u00E1quina encontrada", text: "Os equipamentos cadastrados aparecer\u00E3o aqui.", action: canManage && React.createElement("button", { className: "primary-button", onClick: () => open() },
                    React.createElement(Plus, { size: 16 }),
                    " Nova m\u00E1quina") })) : React.createElement("div", { className: "machine-grid" }, filtered.map(m => React.createElement("article", { className: "machine-card", key: m.id },
            React.createElement("div", { className: "machine-visual" },
                React.createElement(Dumbbell, { size: 34 }),
                React.createElement("span", null,
                    "EQ / ",
                    String(m.id).padStart(3, '0'))),
            React.createElement("div", { className: "machine-info" },
                React.createElement("h3", null, m.nome),
                React.createElement("p", null, m.fabricante || 'Fabricante não informado')),
            canManage && React.createElement("div", { className: "card-actions" },
                React.createElement("button", { className: "icon-button", onClick: () => open(m) },
                    React.createElement(Pencil, { size: 15 })),
                React.createElement("button", { className: "icon-button danger-hover", onClick: () => setDeleting(m) },
                    React.createElement(Trash2, { size: 15 })))))),
        modal && React.createElement(Modal, { title: editing ? 'Editar máquina' : 'Cadastrar máquina', subtitle: "Registre um equipamento no cat\u00E1logo.", onClose: () => setModal(false) },
            React.createElement("form", { onSubmit: submit, className: "modal-form" },
                React.createElement(Field, { label: "Nome da m\u00E1quina" },
                    React.createElement("input", { value: form.nome, onChange: e => setForm({ ...form, nome: e.target.value }), required: true, placeholder: "Ex.: Leg press 45\u00B0" })),
                React.createElement(Field, { label: "Fabricante" },
                    React.createElement("input", { value: form.fabricante, onChange: e => setForm({ ...form, fabricante: e.target.value }), placeholder: "Ex.: Technogym" })),
                React.createElement(FormActions, { onCancel: () => setModal(false), busy: busy, label: editing ? 'Salvar alterações' : 'Cadastrar máquina' }))),
        deleting && React.createElement(ConfirmDelete, { item: deleting.nome, onClose: () => setDeleting(null), onConfirm: remove, busy: busy }));
}
function UsersPage({ data, reload, notify, me }) {
    const [search, setSearch] = useState(''), [deleting, setDeleting] = useState(null), [busy, setBusy] = useState(false), [modal, setModal] = useState(false), [editing, setEditing] = useState(null);
    const emptyForm = { nome: '', email: '', cpf: '', contato: '', password: '', role: 'USER' };
    const [form, setForm] = useState(emptyForm);
    const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModal(true); };
    const openEdit = u => { setEditing(u); setForm({ nome: u.nome || '', email: u.email || '', cpf: u.cpf || '', contato: u.contato || '', password: '', role: u.role || 'USER' }); setModal(true); };
    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            if (editing) {
                const payload = { nome: form.nome.trim(), email: form.email.trim(), cpf: form.cpf.trim(), contato: form.contato.trim() || null };
                await send(`/users/${editing.id}`, 'PUT', payload);
                notify('Dados do usuário atualizados.');
            }
            else {
                await send('/users', 'POST', form);
                notify(form.role === 'PROF' ? 'Professor cadastrado.' : 'Aluno cadastrado.');
            }
            setModal(false);
            setEditing(null);
            setForm({ ...emptyForm });
            await reload();
        }
        catch (err) {
            notify(err.message, 'error');
        }
        finally {
            setBusy(false);
        }
    };
    const changeRole = async (u) => { const role = u.role === 'PROF' ? 'USER' : 'PROF'; if (!confirm(`Alterar ${u.nome} para ${role === 'PROF' ? 'Professor' : 'Aluno'}?`))
        return; try {
        await send(`/users/${u.id}/role`, 'PATCH', { role });
        notify('Perfil atualizado.');
        await reload();
    }
    catch (e) {
        notify(e.message, 'error');
    } };
    const remove = async () => { setBusy(true); try {
        await api(`/users/${deleting.id}`, { method: 'DELETE' });
        notify('Usuário excluído.');
        setDeleting(null);
        await reload();
    }
    catch (e) {
        notify(e.message, 'error');
    }
    finally {
        setBusy(false);
    } };
    const filtered = data.users.filter(u => `${u.nome} ${u.email} ${u.cpf}`.toLowerCase().includes(search.toLowerCase()));
    const roleLabel = role => ({ ADM: 'ADMINISTRADOR', PROF: 'PROFESSOR', USER: 'ALUNO' }[role] || role);
    return React.createElement(React.Fragment, null,
        React.createElement(PageHeading, { eyebrow: "CONTROLE DE ACESSO", title: "Usu\u00E1rios", description: "Cadastre alunos e professores e gerencie os acessos.", action: React.createElement("button", { className: "primary-button", onClick: openCreate },
                React.createElement(Plus, { size: 17 }),
                " NOVO CADASTRO") }),
        React.createElement("div", { className: "user-summary" },
            React.createElement("div", null,
                React.createElement(Users, { size: 20 }),
                React.createElement("span", null,
                    React.createElement("strong", null, data.users.length),
                    " usu\u00E1rios cadastrados")),
            React.createElement("div", null,
                React.createElement(ShieldCheck, { size: 20 }),
                React.createElement("span", null,
                    React.createElement("strong", null, data.users.filter(u => u.role === 'PROF').length),
                    " professores")),
            React.createElement("div", null,
                React.createElement(UserRound, { size: 20 }),
                React.createElement("span", null,
                    React.createElement("strong", null, data.users.filter(u => u.role === 'USER').length),
                    " alunos"))),
        React.createElement("div", { className: "toolbar" },
            React.createElement("div", { className: "search-box" },
                React.createElement(Search, { size: 17 }),
                React.createElement("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar por nome, e-mail ou CPF..." })),
            React.createElement("span", { className: "result-count" },
                filtered.length,
                " usu\u00E1rios")),
        React.createElement("div", { className: "panel users-table-panel" },
            React.createElement("div", { className: "users-table-head" },
                React.createElement("span", null, "MEMBRO"),
                React.createElement("span", null, "CPF"),
                React.createElement("span", null, "CONTATO"),
                React.createElement("span", null, "PERFIL"),
                React.createElement("span", null, "A\u00C7\u00D5ES")),
            filtered.map(u => React.createElement("div", { className: "user-row", key: u.id },
                React.createElement("div", { className: "user-cell" },
                    React.createElement("div", { className: "avatar small" }, (u.nome || u.email).slice(0, 1).toUpperCase()),
                    React.createElement("div", null,
                        React.createElement("strong", null, u.nome),
                        React.createElement("span", null, u.email))),
                React.createElement("span", { className: "table-text" }, u.cpf || '—'),
                React.createElement("span", { className: "table-text" }, u.contato || '—'),
                React.createElement("span", null,
                    React.createElement("span", { className: `role-pill ${u.role === 'ADM' ? 'admin' : ''}` }, roleLabel(u.role))),
                React.createElement("div", { className: "row-actions" },
                    React.createElement("button", { className: "icon-button", onClick: () => openEdit(u), title: "Editar usu\u00E1rio", "aria-label": `Editar ${u.nome}` },
                        React.createElement(Pencil, { size: 16 })),
                    u.role !== 'ADM' && React.createElement(React.Fragment, null,
                        React.createElement("button", { className: "secondary-button compact", onClick: () => changeRole(u) }, u.role === 'PROF' ? 'Tornar aluno' : 'Tornar professor'),
                        React.createElement("button", { className: "icon-button danger-hover", onClick: () => setDeleting(u), title: "Excluir usu\u00E1rio" },
                            React.createElement(Trash2, { size: 16 })))))),
            filtered.length === 0 && React.createElement(EmptyState, { icon: Users, title: "Nenhum usu\u00E1rio encontrado", text: "Tente buscar por outro termo." })),
        modal && React.createElement(Modal, { title: editing ? 'Editar usuário' : 'Cadastrar usuário', subtitle: editing ? 'Atualize os dados cadastrais deste usuário.' : 'Crie uma conta de aluno ou professor.', onClose: () => { setModal(false); setEditing(null); } },
            React.createElement("form", { onSubmit: submit, className: "modal-form" },
                !editing && React.createElement(Field, { label: "Tipo de conta" },
                    React.createElement("select", { value: form.role, onChange: e => setForm({ ...form, role: e.target.value }) },
                        React.createElement("option", { value: "USER" }, "Aluno (USER)"),
                        React.createElement("option", { value: "PROF" }, "Professor (PROF)"))),
                React.createElement(Field, { label: "Nome completo" },
                    React.createElement("input", { value: form.nome, onChange: e => setForm({ ...form, nome: e.target.value }), required: true })),
                React.createElement(Field, { label: "E-mail" },
                    React.createElement("input", { type: "email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), required: true })),
                React.createElement(Field, { label: "CPF" },
                    React.createElement("input", { value: form.cpf, onChange: e => setForm({ ...form, cpf: e.target.value }), required: true })),
                React.createElement(Field, { label: "Contato" },
                    React.createElement("input", { value: form.contato, onChange: e => setForm({ ...form, contato: e.target.value }) })),
                !editing && React.createElement(Field, { label: "Senha inicial" },
                    React.createElement("input", { type: "password", minLength: "6", value: form.password, onChange: e => setForm({ ...form, password: e.target.value }), required: true })),
                editing && React.createElement("p", { className: "inline-warning" }, "A edi\u00E7\u00E3o atualiza nome, e-mail, CPF e contato. A senha e o tipo de conta s\u00E3o gerenciados separadamente."),
                React.createElement(FormActions, { onCancel: () => { setModal(false); setEditing(null); }, busy: busy, label: editing ? 'Salvar alterações' : 'Cadastrar' }))),
        deleting && React.createElement(ConfirmDelete, { item: deleting.nome, onClose: () => setDeleting(null), onConfirm: remove, busy: busy }));
}
function Profile({ user, isAdmin, onUpdate, notify }) {
    const [form, setForm] = useState({ nome: user.nome || '', email: user.email || '', cpf: user.cpf || '', contato: user.contato || '' }), [busy, setBusy] = useState(false);
    useEffect(() => setForm({ nome: user.nome || '', email: user.email || '', cpf: user.cpf || '', contato: user.contato || '' }), [user]);
    const submit = async (e) => { e.preventDefault(); setBusy(true); try {
        const updated = await send(`/users/${user.id}`, 'PUT', form);
        onUpdate(updated);
    }
    catch (err) {
        notify(err.message, 'error');
    }
    finally {
        setBusy(false);
    } };
    return React.createElement(React.Fragment, null,
        React.createElement(PageHeading, { eyebrow: "DADOS DA CONTA", title: "Meu perfil", description: isAdmin ? "Mantenha os dados cadastrais atualizados." : "Consulte os dados da sua conta." }),
        React.createElement("div", { className: "profile-layout" },
            React.createElement("section", { className: "profile-identity panel" },
                React.createElement("div", { className: "profile-avatar" }, (user.nome || user.email).slice(0, 1).toUpperCase()),
                React.createElement("h2", null, user.nome),
                React.createElement("span", null, user.email),
                React.createElement("div", { className: `role-pill ${user.role === 'ADM' ? 'admin' : ''}` }, { ADM: 'ADMINISTRADOR', PROF: 'PROFESSOR', USER: 'ALUNO' }[user.role]),
                React.createElement("div", { className: "profile-divider" }),
                React.createElement("div", { className: "profile-detail" },
                    React.createElement(ShieldCheck, { size: 16 }),
                    React.createElement("span", null, "Conta protegida")),
                React.createElement("div", { className: "profile-detail" },
                    React.createElement(Calendar, { size: 16 }),
                    React.createElement("span", null, "Membro GymControl"))),
            React.createElement("section", { className: "panel profile-form-panel" },
                React.createElement("div", { className: "panel-header" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "section-kicker" }, "INFORMA\u00C7\u00D5ES PESSOAIS"),
                        React.createElement("h3", null, isAdmin ? 'Editar cadastro' : 'Dados cadastrais'))),
                isAdmin ? React.createElement("form", { onSubmit: submit, className: "profile-form" },
                    React.createElement("div", { className: "form-grid" },
                        React.createElement(Field, { label: "Nome completo" },
                            React.createElement("input", { value: form.nome, onChange: e => setForm({ ...form, nome: e.target.value }), required: true })),
                        React.createElement(Field, { label: "E-mail" },
                            React.createElement("input", { type: "email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), required: true })),
                        React.createElement(Field, { label: "CPF" },
                            React.createElement("input", { value: form.cpf, onChange: e => setForm({ ...form, cpf: e.target.value }), required: true })),
                        React.createElement(Field, { label: "Contato" },
                            React.createElement("input", { value: form.contato, onChange: e => setForm({ ...form, contato: e.target.value }) }))),
                    React.createElement("div", { className: "profile-form-foot" },
                        React.createElement("span", null, "As altera\u00E7\u00F5es s\u00E3o salvas diretamente na conta."),
                        React.createElement("button", { className: "primary-button", disabled: busy },
                            busy ? React.createElement(LoaderCircle, { className: "spin", size: 17 }) : React.createElement(Save, { size: 16 }),
                            " Salvar altera\u00E7\u00F5es"))) : React.createElement("div", { className: "profile-readonly" },
                    React.createElement("p", null,
                        "Nome: ",
                        React.createElement("strong", null, user.nome)),
                    React.createElement("p", null,
                        "E-mail: ",
                        React.createElement("strong", null, user.email)),
                    React.createElement("p", null,
                        "CPF: ",
                        React.createElement("strong", null, user.cpf)),
                    React.createElement("p", null,
                        "Contato: ",
                        React.createElement("strong", null, user.contato || 'Não informado')),
                    React.createElement("small", null, "Seu perfil est\u00E1 dispon\u00EDvel para consulta. A API atual permite altera\u00E7\u00F5es cadastrais apenas para administradores.")))));
}
createRoot(document.getElementById('root')).render(React.createElement(App, null));
