import { memoriaApi } from '../boot/axios';
import apiConfig from '../config/apiConfig';

export async function sendMessageToChatbot(message: string, repositoryName: string, sessionId?: string) {
  const payload = {
    message,
    repository_name: repositoryName,
    session_id: sessionId
  };

  const { data } = await memoriaApi.post(apiConfig.endpoints.memoria.chatbot, payload);
  return data;
}
