// src/services/authService.ts
import { api } from 'src/boot/axios';
import apiConfig from 'src/config/apiConfig';
import type { LoginResponse } from 'src/types/apiTypes';

// Define a estrutura esperada para os dados de registro de um novo usuário
interface RegisterUserPayload {
  username: string;
  password: string;
  permissao: string;
  email: string;
  repo_name: string;
}

// Define a estrutura da resposta do endpoint de registro
interface RegisterUserResponse {
  message: string;
  user_uri: string;
}

/**
 * Realiza a autenticação do usuário na API.
 * @param email - O email do usuário.
 * @param password - A senha do usuário.
 * @returns Uma Promise com os dados da resposta de login.
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  // A URL completa é montada pelo Axios (baseURL + endpoint)
  const { data } = await api.post<LoginResponse>(apiConfig.endpoints.login, {
    email,
    password,
  });

  // Salva o token no localStorage para persistir a sessão
  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
}

/**
 * Registra um novo usuário (curador) no sistema.
 * @param payload - Objeto com os dados do novo usuário.
 * @returns Uma Promise com a mensagem de sucesso e a URI do novo usuário.
 */
export async function registerUser(
  payload: RegisterUserPayload
): Promise<RegisterUserResponse> {
  const { data } = await api.post<RegisterUserResponse>(
    apiConfig.endpoints.addUser,
    payload
  );
  return data;
}
