import type { Exercise, Machine, User, Workout, WorkoutRequest } from './types'

// Em produção, frontend e API são servidos pela mesma origem do Spring Boot.
// No desenvolvimento, o Vite encaminha as rotas da API via proxy.
const API = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'gymcontrol_token'

function readToken() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as { token:string; exp:number }
    if (!saved.token || saved.exp <= Date.now()) { localStorage.removeItem(TOKEN_KEY); return null }
    return saved.token
  } catch { return null }
}
export function saveToken(token:string) {
  try {
    const encoded = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')
    const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')))
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, exp: payload.exp * 1000 }))
  } catch {
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, exp: Date.now() + 15 * 60 * 1000 }))
  }
}
export function clearToken() { localStorage.removeItem(TOKEN_KEY) }
export function hasToken() { return !!readToken() }

export async function api<T>(path:string, options:RequestInit = {}):Promise<T> {
  const token = readToken()
  let response:Response
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type':'application/json' } : {}),
        ...(token ? { Authorization:`Bearer ${token}` } : {}),
        ...options.headers
      }
    })
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o Spring Boot está ativo na porta 3000.')
  }
  if (response.status === 401) {
    clearToken()
    window.dispatchEvent(new Event('gymcontrol:unauthorized'))
    throw new Error('Sua sessão expirou. Entre novamente.')
  }
  if (!response.ok) {
    let message = ''
    try {
      const body = await response.json()
      message = body.detail || body.message || body.title || body.error || ''
      if (!message && body.errors) message = Object.values(body.errors).join(', ')
    } catch { /* resposta sem corpo JSON */ }
    const defaults:Record<number,string> = {
      400:'Confira os dados informados.', 403:'Você não tem permissão para esta ação.',
      404:'O registro solicitado não foi encontrado.', 409:'Este registro já está cadastrado.',
      500:'O servidor não conseguiu concluir a operação.'
    }
    throw new Error(message || defaults[response.status] || `Erro ${response.status}.`)
  }
  if (response.status === 204) return null as T
  const text = await response.text()
  return text ? JSON.parse(text) as T : null as T
}
export const authApi = {
  login:(email:string,password:string) => api<{token:string}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
  register:(data:{nome:string;email:string;cpf:string;contato:string;password:string}) =>
    api('/auth/register',{method:'POST',body:JSON.stringify(data)})
}
export const getMe = () => api<User>('/users/me')
export const getUsers = () => api<User[]>('/users')
export const updateUser = (id:number,data:{nome:string;email:string;cpf:string;contato:string}) =>
  api<User>(`/users/${id}`,{method:'PUT',body:JSON.stringify(data)})
export const updateRole = (id:number,role:string) => api<User>(`/users/${id}/role`,{method:'PATCH',body:JSON.stringify({role})})
export const deleteUser = (id:number) => api<void>(`/users/${id}`,{method:'DELETE'})
export const getMachines = () => api<Machine[]>('/maquinas')
export const saveMachine = (data:{nome:string;fabricante:string},id?:number) =>
  api<Machine>(id ? `/maquinas/${id}` : '/maquinas',{method:id?'PUT':'POST',body:JSON.stringify(data)})
export const deleteMachine = (id:number) => api<void>(`/maquinas/${id}`,{method:'DELETE'})
export const getExercises = () => api<Exercise[]>('/exercicios')
export const saveExercise = (data:{nome:string;agrupamento:string;maquinaId:number|null},id?:number) =>
  api<Exercise>(id ? `/exercicios/${id}` : '/exercicios',{method:id?'PUT':'POST',body:JSON.stringify(data)})
export const deleteExercise = (id:number) => api<void>(`/exercicios/${id}`,{method:'DELETE'})
export const getWorkouts = () => api<Workout[]>('/treinos')
export const saveWorkout = (data:WorkoutRequest,id?:number) =>
  api<Workout>(id ? `/treinos/${id}` : '/treinos',{method:id?'PUT':'POST',body:JSON.stringify(data)})
export const deleteWorkout = (id:number) => api<void>(`/treinos/${id}`,{method:'DELETE'})
