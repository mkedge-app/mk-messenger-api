export interface WppInitResponse {
  error: boolean;
  message: string;
  key: string;
  webhook: {
    enabled: boolean;
    webhookUrl: string | null;
  };
  qrcode: {
    url: string;
  };
  browser: {
    platform: string;
    browser: string;
    version: string;
  };
}
