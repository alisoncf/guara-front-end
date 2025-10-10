/**
 * src/services/physicalObjectService.ts
 *
 * Serviço para interagir com os endpoints de Objetos Físicos (/fis).
 */
import { api } from '../boot/axios';
import apiConfig from '../config/apiConfig';
import type {
  CreatePhysicalObjectPayload,
  UpdatePhysicalObjectPayload,
} from '../types/apiTypes';

/**
 * Cria um novo objeto físico.
 * @param payload - Os dados do objeto a ser criado.
 */
export async function createPhysicalObject(
  payload: CreatePhysicalObjectPayload
) {
  const { data } = await api.post(apiConfig.endpoints.fisico.create, payload);
  return data;
}

/**
 * Atualiza um objeto físico existente.
 * @param payload - Os dados do objeto a ser atualizado.
 */
export async function updatePhysicalObject(
  payload: UpdatePhysicalObjectPayload
) {
  // A API espera PUT ou POST, vamos usar PUT para atualização
  const { data } = await api.put(apiConfig.endpoints.fisico.update, payload);
  return data;
}

/**
 * Apaga um objeto físico.
 * @param objectUri - A URI completa do objeto a ser apagado.
 * @param repositoryUpdateUrl - A URL de update do repositório.
 */
export async function deletePhysicalObject(
  objectUri: string,
  repositoryUpdateUrl: string
) {
  const { data } = await api.delete(apiConfig.endpoints.fisico.delete, {
    // No axios, o corpo de uma requisição DELETE vai na chave 'data'
    data: {
      object_uri_to_delete: objectUri,
      repository_update_url: repositoryUpdateUrl,
    },
  });
  return data;
}
