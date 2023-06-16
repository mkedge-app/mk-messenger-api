import axios, { AxiosResponse } from "axios";
import { Session, WppInitResponse, WppSessionResponse } from "../types/WhatsAppApi";

class WhatsAppApi {
  API_URL = process.env.API_URL as string;
  API_TOKEN: string = process.env.API_TOKEN as string;

  async initInstance(key: string): Promise<AxiosResponse<WppInitResponse>> {
    return axios.get(
      `${this.API_URL}/instance/init?key=${key}&token=${this.API_TOKEN}`
    );
  }

  async listAllSessions(): Promise<WppSessionResponse> {
    const response: AxiosResponse = await axios.get<any>(`${this.API_URL}/instance/listt`);
    return response.data;
  }

  async getSessionByKey(key: string): Promise<Session | undefined> {
    const response = await this.listAllSessions();
    const allSessions = response.data;
    const userSession = allSessions.find(({ instance_key }) => instance_key === key);
    return userSession;
  }
}

export default new WhatsAppApi();
