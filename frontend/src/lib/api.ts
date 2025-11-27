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

export const updatePortalBundle = async (role: Role, bundle: PortalBundle) => {
  const { data } = await api.put(`/portal/${role}/bundle`, bundle);
  return data;
};

export interface MaterialUploadResponse {
  status: string;
  filename: string;
  stored_as: string;
  url: string;
  message?: string;
}

export const uploadMaterialFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<MaterialUploadResponse>('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
