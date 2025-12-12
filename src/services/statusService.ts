import { memoriaApi } from '../boot/axios'; // Importa a instância específica
import apiConfig from '../config/apiConfig';

export async function checkMemoriaStatus() {
  try {
    const { status } = await memoriaApi.get(apiConfig.endpoints.memoria.health);
    return status === 200;
  } catch (error) {
    return false;
  }
}

export async function checkOculusStatus() {
  try {
    const { data } = await memoriaApi.get(apiConfig.endpoints.memoria.oculusStatus);
    return data;
  } catch (error) {
    return { status: 'offline', message: 'Serviço indisponível' };
  }
}
