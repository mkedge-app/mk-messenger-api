import axios, { AxiosResponse } from "axios";
import {
  Instances,
  WppInitResponse,
  WppSessionResponse,
} from "../types/WhatsAppApi";

class WhatsAppApi {
  // API_URL: string = "http://mk-edge.com.br:3334";
  API_URL: string = "http://localhost:3000";
  TOKEN: string = "mk-messenger-api";

  async initInstance(
    key: string
  ): Promise<AxiosResponse<WppInitResponse> | null> {
    const userAlreadyInitializedInstance = await this.listAllSessions(key);

    if (!userAlreadyInitializedInstance) {
      return axios.get(
        `${this.API_URL}/instance/init?key=${key}&token=${this.TOKEN}`
      );
    }

    return null;
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
      userSessions.map((el) => el.phone_connected === false) ||
      userSessions.length === 0
    ) {
      return null;
    }

    return userSessions;
  }
}

export default new WhatsAppApi();
