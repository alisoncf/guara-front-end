import { memoriaApi } from '../boot/axios';
import apiConfig from '../config/apiConfig';
import { Notify } from 'quasar';

export async function processDocument(file: File) {
  const formData = new FormData();
  formData.append('document', file);

  try {
    // O axios detecta FormData e ajusta o Content-Type automaticamente
    const { data } = await memoriaApi.post(apiConfig.endpoints.memoria.processDocument, formData, {
      timeout: 60000 // Timeout maior para OCR
    });

    Notify.create({
      type: 'positive',
      message: 'Documento processado com sucesso!',
    });

    return data;
  } catch (error) {
    console.error('Erro no processamento de documento:', error);
    throw error;
  }
}
