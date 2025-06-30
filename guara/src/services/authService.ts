import { api } from 'src/boot/axios';
import type { LoginResponse } from './apiTypes';

// Login do usuário
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  console.log('=== DEBUG: AuthService Login ===');
  console.log('Email:', email);
  console.log('Password:', password ? '***' : 'undefined');

  const { data } = await api.post('/acesso/login', { email, password });

  console.log('Resposta do login:', data);
  console.log('Token recebido:', data.token);
  console.log('Tipo do token:', typeof data.token);
  console.log('==============================');

  return data;
}

// Cadastro de novo usuário/curador
export async function registerUser({
  username,
  password,
  permissao,
  email,
  repo_name,
}: {
  username: string;
  password: string;
  permissao: string;
  email: string;
  repo_name: string;
}): Promise<{ message: string; user_uri: string }> {
  const { data } = await api.post('/acesso/add_user', {
    username,
    password,
    permissao,
    email,
    repo_name,
  });
  return data;
}
