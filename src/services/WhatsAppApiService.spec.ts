import axios from "axios";
import WhatsAppApi from "./WhatsAppApi";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("WhatsAppApi", () => {
  let instance: typeof WhatsAppApi;

  beforeEach(() => {
    instance = WhatsAppApi;
    process.env.API_URL = "http://test-api.com";
    process.env.API_URL_TOKEN = "test-token";
    instance.API_URL = process.env.API_URL;
    instance.TOKEN = process.env.API_URL_TOKEN;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("initInstance", () => {
    it("should make a get request with correct url and params", async () => {
      const response = { data: {} };
      mockedAxios.get.mockResolvedValue(response);

      const result = await instance.initInstance("test-key");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://test-api.com/instance/init?key=test-key&token=test-token"
      );
      expect(result).toEqual(response);
    });
  });

  describe("listAllSessions", () => {
    it("should return null when user sessions are empty", async () => {
      mockedAxios.get.mockResolvedValue({ data: { data: [] } });

      const result = await instance.listAllSessions("test-key");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://test-api.com/instance/list"
      );
      expect(result).toBe(null);
    });

    it("should return null when some user's phone is not connected", async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: [{ instance_key: "test-key", phone_connected: false }],
        },
      });

      const result = await instance.listAllSessions("test-key");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://test-api.com/instance/list"
      );
      expect(result).toBe(null);
    });

    it("should return user sessions when all user's phones are connected", async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: [{ instance_key: "test-key", phone_connected: true }],
        },
      });

      const result = await instance.listAllSessions("test-key");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://test-api.com/instance/list"
      );
      expect(result).toEqual([
        { instance_key: "test-key", phone_connected: true },
      ]);
    });
  });

  describe("verifyIfUserHasSession", () => {
    it("should return true if user has a session", async () => {
      instance.listAllSessions = jest
        .fn()
        .mockResolvedValue([
          { instance_key: "test-key", phone_connected: true },
        ]);

      const result = await instance.verifyIfUserHasSession("test-key");

      expect(result).toEqual(true);
    });

    it("should return false if user does not have a session", async () => {
      instance.listAllSessions = jest.fn().mockResolvedValue(null);

      const result = await instance.verifyIfUserHasSession("test-key");

      expect(result).toEqual(false);
    });
  });
});
