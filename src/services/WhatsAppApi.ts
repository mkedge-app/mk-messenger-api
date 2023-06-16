import axios, { AxiosResponse } from "axios";
import {
  Instances,
  WppInitResponse,
  WppSessionResponse,
} from "../types/WhatsAppApi";

class WhatsAppApi {
  API_URL = process.env.API_URL as string;
  TOKEN: string = process.env.API_URL_TOKEN as string;

  async initInstance(key: string): Promise<AxiosResponse<WppInitResponse>> {
    return axios.get(
      `${this.API_URL}/instance/init?key=${key}&token=${this.TOKEN}`
    );
  }

  async listAllSessions(
    key: string
  ): Promise<AxiosResponse<WppSessionResponse> | null | Instances[]> {
    const response = await axios.get<WppSessionResponse>(
      `${this.API_URL}/instance/list`
    );

    const userSessions = response.data.data.filter(
      ({ instance_key }) => instance_key === key
    );

    if (
      userSessions.some((user) => user.phone_connected === false) ||
      userSessions.length === 0
    ) {
      return null;
    }

    return userSessions;
  }

  async verifyIfUserHasSession(key: string): Promise<boolean> {
    const userAlreadyInitializedInstance = await this.listAllSessions(key);

    if (userAlreadyInitializedInstance) {
      return true;
    }

    return false;
  }
}

export default new WhatsAppApi();
