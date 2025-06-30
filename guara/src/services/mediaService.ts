import { api } from 'boot/axios';

// Upload de mídia
export async function uploadMedia(
  file: File,
  objetoUri: string,
  repository: string
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('objetoUri', objetoUri);
  formData.append('repository', repository);
  // Ajuste os nomes dos campos conforme sua API
  const { data } = await api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// Listar mídias de um objeto
export async function listMediaByObject(
  objetoUri: string,
  repository: string
): Promise<any[]> {
  const { data } = await api.post('/media/list_by_object', {
    objetoUri,
    repository,
  });
  return data.results?.bindings || [];
}

// Associar mídia a objeto
export async function associateMediaToObject(
  mediaUri: string,
  objetoUri: string,
  repository: string
): Promise<any> {
  const { data } = await api.post('/media/associate', {
    mediaUri,
    objetoUri,
    repository,
  });
  return data;
}
