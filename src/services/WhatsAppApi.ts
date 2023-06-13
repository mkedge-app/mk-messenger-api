import axios, { AxiosResponse } from "axios";
import { Instances, WppInitResponse, WppSessionResponse } from "../types/WhatsAppApi";

class WhatsAppApi {
  // API_URL: string = "http://localhost:3000";
  API_URL: string = "http://mk-edge.com.br:3334";
  TOKEN: string = "mk-messenger-api";

  initInstance(key: string): Promise<AxiosResponse<WppInitResponse>> {
    return axios.get(
      `${this.API_URL}/instance/init?key=${key}&token=${this.TOKEN}`
    );
  }

  async listAllSessions(
    key: string
  ): Promise<AxiosResponse<WppSessionResponse>> {
    const response = await axios.get(`${this.API_URL}/instance/list`);

    const userSessions = response.data.data.filter(
      ({ instance_key }: Instances) => instance_key === key
    );

    // console.log(userSessions)

    return userSessions;
  }
}

export default new WhatsAppApi();
