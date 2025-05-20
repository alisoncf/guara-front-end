import axios from 'axios';
import apiConfig from '../apiConfig';
import { Notify } from 'quasar';

interface ColecaoData {
  name: string;
  value: number;
  category: string;
}

export async function buscarDadosColecoes(): Promise<ColecaoData[]> {
  try {
    const url = `${apiConfig.baseURL}/colecoes/estatisticas`;
    console.log('Buscando dados das coleções em:', url);

    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('Resposta da API:', response.data);

    if (!response.data || !Array.isArray(response.data)) {
      console.error('Formato de resposta inválido:', response.data);
      throw new Error('Formato de resposta inválido');
    }

    // Mapeia os dados da API para o formato do gráfico
    return response.data.map((item: any) => ({
      name: item.nome || 'Sem nome',
      value: item.quantidade_objetos || 0,
      category: item.categoria || 'Sem categoria',
    }));
  } catch (error) {
    console.error('Erro ao buscar dados das coleções:', error);
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar dados das coleções',
    });
    return [];
  }
}
