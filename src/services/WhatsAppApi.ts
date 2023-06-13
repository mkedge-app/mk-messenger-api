import axios, { AxiosResponse } from "axios";
import { WppInitResponse } from "../types/WhatsAppApi";

class WhatsAppApi {
  API_URL: string = "http://mk-edge.com.br:3334";
  TOKEN: string = "mk-messenger-api";

  initInstance(key: string): Promise<AxiosResponse<WppInitResponse>> {
    return axios.get(
      `${this.API_URL}/instance/init?key=${key}&token=${this.TOKEN}`
    );
  }
}

export default new WhatsAppApi();
