// src/services/mediaService.ts

import { api } from '../boot/axios';
import apiConfig from '../config/apiConfig';
import type {
  UploadResponse,
  RemoveMediaResponse,
  ListMediaResponse,
  MediaFile,
} from '../types/apiTypes';
import { Notify } from 'quasar';

// --- Tipos para os Payloads das Funções ---

interface UploadPayload {
  objetoId: string;
  repositoryUpdateUrl: string;
  repositoryBaseUri: string;
  arquivos: File[];
  linksExternos?: string[];
}

interface RemoveMediaPayload {
  objetoId: string;
  mediaUriToRemove: string;
  repositoryUpdateUrl: string;
  repositoryBaseUri: string;
}

/**
 * Realiza o upload de um ou mais arquivos de mídia e/ou associa links externos a um objeto.
 * @param payload - Os dados necessários para o upload.
 * @returns Uma Promise com os detalhes do resultado do upload.
 */
export async function uploadMedia(
  payload: UploadPayload
): Promise<UploadResponse> {
  const formData = new FormData();

  // Mapeia os nomes dos campos para o que a API Flask espera
  formData.append('objeto_id', payload.objetoId);
  formData.append('repository_update_url', payload.repositoryUpdateUrl);
  formData.append('repository_base_uri', payload.repositoryBaseUri);

  // Adiciona cada arquivo ao FormData
  payload.arquivos.forEach((file) => {
    formData.append('arquivos_midia', file);
  });

  // Adiciona links externos se existirem
  payload.linksExternos?.forEach((link) => {
    formData.append('links_externos', link);
  });

  try {
    const { data } = await api.post<UploadResponse>(
      apiConfig.endpoints.midias.upload,
      formData
      // O Axios definirá o 'Content-Type' como 'multipart/form-data' automaticamente
    );
    Notify.create({
      type: 'positive',
      message: data.message || 'Mídias processadas com sucesso!',
    });
    return data;
  } catch (error) {
    console.error('Erro no upload de mídia:', error);
    // O interceptor já mostra a notificação de erro.
    throw error;
  }
}

/**
 * Lista todos os arquivos de mídia associados a um objeto, combinando
 * informações do sistema de arquivos e do repositório SPARQL.
 * @param objetoId - O ID do objeto.
 * @param repoSparqlEndpoint - A URL de consulta SPARQL do repositório.
 * @param repoBaseUri - A URI base do repositório.
 * @returns Uma Promise com a lista de arquivos de mídia combinados.
 */
export async function listMediaForObject(
  objetoId: string,
  repoSparqlEndpoint: string,
  repoBaseUri: string
): Promise<MediaFile[]> {
  try {
    const response = await api.get<ListMediaResponse>(
      apiConfig.endpoints.midias.listByObject,
      {
        params: {
          objetoId: objetoId,
          repositorio_sparql_endpoint: repoSparqlEndpoint,
          repositorio_base_uri: repoBaseUri,
        },
      }
    );
    return response.data.arquivos_combinados || [];
  } catch (error) {
    console.error(`Erro ao listar mídias para o objeto ${objetoId}:`, error);
    throw new Error('Falha ao carregar as mídias do objeto.');
  }
}

/**
 * Remove a associação de uma mídia de um objeto e move o arquivo local.
 * @param payload - Os dados necessários para a remoção.
 * @returns Uma Promise com a mensagem de sucesso da API.
 */
export async function removeMedia(
  payload: RemoveMediaPayload
): Promise<RemoveMediaResponse> {
  try {
    const { data } = await api.post<RemoveMediaResponse>(
      apiConfig.endpoints.midias.remove,
      {
        objeto_id: payload.objetoId,
        media_uri_to_remove: payload.mediaUriToRemove,
        repository_update_url: payload.repositoryUpdateUrl,
        repository_base_uri: payload.repositoryBaseUri,
      }
    );
    Notify.create({
      type: 'positive',
      message: data.message || 'Mídia removida com sucesso!',
    });
    return data;
  } catch (error) {
    console.error('Erro ao remover mídia:', error);
    throw error;
  }
}
