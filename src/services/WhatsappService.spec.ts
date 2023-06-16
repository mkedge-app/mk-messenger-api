import axios, { AxiosResponse } from "axios";
import WhatsappService from "./WhatsappService";
jest.mock("axios");

describe("WhatsappService", () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const mockAxiosResponse: any = {
    data: [],
    status: 200,
    statusText: "OK",
    config: {},
    headers: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize a Whatsapp instance", async () => {
    const mockedResponse = {
      ...mockAxiosResponse,
      data: { qrcode: { url: "test_url" } },
    };
    mockAxios.get.mockResolvedValue(mockedResponse);

    const response = await WhatsappService.initInstance("test_key");

    expect(response.data).toEqual(mockedResponse.data);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${WhatsappService.API_URL}/instance/init?key=test_key&token=${WhatsappService.API_TOKEN}`
    );
  });

  it("should list all Whatsapp sessions", async () => {
    const mockedResponse = {
      ...mockAxiosResponse,
      data: ["test_key", "other_key"],
    };
    mockAxios.get.mockResolvedValue(mockedResponse);

    const response = await WhatsappService.listAllSessions();

    expect(response).toEqual(mockedResponse.data);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${WhatsappService.API_URL}/instance/list`
    );
  });

  it("should get a session by key", async () => {
    const mockedSessions = ["test_key", "other_key"];
    jest
      .spyOn(WhatsappService, "listAllSessions")
      .mockResolvedValueOnce({ ...mockAxiosResponse, data: mockedSessions });

    const response = await WhatsappService.getSessionByKey("test_key");

    expect(response).toEqual("test_key");
    expect(WhatsappService.listAllSessions).toHaveBeenCalledTimes(1);
  });

  it("should return undefined when a session key does not exist", async () => {
    const mockedSessions = ["another_key"];
    jest
      .spyOn(WhatsappService, "listAllSessions")
      .mockResolvedValueOnce({ ...mockAxiosResponse, data: mockedSessions });

    const response = await WhatsappService.getSessionByKey("test_key");

    expect(response).toBeUndefined();
    expect(WhatsappService.listAllSessions).toHaveBeenCalledTimes(1);
  });
});
