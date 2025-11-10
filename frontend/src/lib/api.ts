import axios from 'axios';
import type { PortalBundle, Role } from '../types/portal';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
});

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: PortalBundle['user'];
  role: Role;
}

export const loginRequest = async (payload: LoginPayload) => {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
};

export const fetchPortalBundle = async (role: Role) => {
  const { data } = await api.get<PortalBundle>(`/portal/${role}/bundle`);
  return data;
};
