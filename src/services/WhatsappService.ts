import axios, { AxiosResponse } from "axios";
import { Session, WppInitResponse, WppSessionResponse } from "../types/WhatsAppApi";

class WhatsappService {
  API_URL = process.env.API_URL as string;
  API_TOKEN: string = process.env.API_TOKEN as string;

  async initInstance(key: string): Promise<AxiosResponse<WppInitResponse>> {
    return axios.get(
      `${this.API_URL}/instance/init?key=${key}&token=${this.API_TOKEN}`
    );
  }

  async listAllSessions(): Promise<WppSessionResponse> {
    return new Promise<WppSessionResponse>((resolve, reject) => {
      axios
        .get(`${this.API_URL}/instance/list`)
        .then((response: AxiosResponse<WppSessionResponse>) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async getSessionByKey(key: string): Promise<Session | undefined> {
    const response = await this.listAllSessions();
    const allSessions = response.data;
    const userSession = allSessions.find((session) => session.instance_key === key);
    return userSession;
  }
}

export default new WhatsappService();
