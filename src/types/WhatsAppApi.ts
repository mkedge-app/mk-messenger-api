export interface Session {
  instance_key: string,
  phone_connected?: boolean,
  webhookUrl: string | null,
  user: {
    id?: string,
  },
}

export interface QRCodeData {
  name: string;
  qrcode: string;
}
