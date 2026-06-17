import { httpClient } from "@lib/http/http-client";
import { visitsHttpAdapter } from "./visits.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("visitsHttpAdapter", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("fetches visits list without parameters", async () => {
      vi.mocked(httpClient.get).mockResolvedValue([]);

      const result = await visitsHttpAdapter.list();

      expect(httpClient.get).toHaveBeenCalledWith("/api/v1/visits");
      expect(result).toEqual([]);
    });

    it("fetches visits list with parameters", async () => {
      vi.mocked(httpClient.get).mockResolvedValue([
        {
          visit_uuid: "visit-1",
          property_id: 101,
          agent_id: 201,
          visit_date: "2026-06-20T10:00:00Z",
          status: "pending",
          created_at: "2026-06-17T09:00:00Z",
        },
      ]);

      const result = await visitsHttpAdapter.list({
        date: "2026-06-20",
        statusId: 2,
        propertyId: 101,
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        "/api/v1/visits?date=2026-06-20&status_id=2&property_id=101",
      );
      expect(result).toEqual([
        {
          visitUuid: "visit-1",
          propertyId: 101,
          propertyTitle: "",
          agentId: 201,
          agentName: "",
          agentPhone: "",
          visitDate: "2026-06-20T10:00:00Z",
          status: "pending",
          createdAt: "2026-06-17T09:00:00Z",
          clientName: "",
          clientPhone: "",
          cityName: "",
          address: "",
        },
      ]);
    });
  });

  describe("getAvailableSlots", () => {
    it("fetches available timeslots", async () => {
      vi.mocked(httpClient.get).mockResolvedValue([
        { start_time: "09:00:00", end_time: "10:00:00", available: true },
      ]);

      const result = await visitsHttpAdapter.getAvailableSlots(101, "2026-06-20");

      expect(httpClient.get).toHaveBeenCalledWith(
        "/api/v1/properties/101/availability?date=2026-06-20",
      );
      expect(result).toEqual([
        { startTime: "09:00:00", endTime: "10:00:00", available: true },
      ]);
    });
  });

  describe("schedule", () => {
    it("schedules a new visit", async () => {
      const mockResponse = {
        visit_uuid: "visit-created",
        property_id: 101,
        visit_date: "2026-06-20T10:00:00Z",
        status: "pending",
        created_at: "2026-06-17T09:00:00Z",
      };
      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await visitsHttpAdapter.schedule({
        propertyId: 101,
        visitDate: "2026-06-20T10:00:00Z",
      });

      expect(httpClient.post).toHaveBeenCalledWith("/api/v1/visits", {
        property_id: 101,
        visit_date: "2026-06-20T10:00:00Z",
      });
      expect(result.visitUuid).toBe("visit-created");
    });
  });

  describe("reschedule", () => {
    it("reschedules an existing visit", async () => {
      const mockResponse = {
        visit_uuid: "visit-1",
        property_id: 101,
        visit_date: "2026-06-25T11:00:00Z",
        status: "pending",
        created_at: "2026-06-17T09:00:00Z",
      };
      vi.mocked(httpClient.patch).mockResolvedValue(mockResponse);

      const result = await visitsHttpAdapter.reschedule("visit-1", {
        propertyId: 101,
        visitDate: "2026-06-25T11:00:00Z",
      });

      expect(httpClient.patch).toHaveBeenCalledWith(
        "/api/v1/visits/visit-1/reschedule",
        {
          property_id: 101,
          visit_date: "2026-06-25T11:00:00Z",
        },
      );
      expect(result.visitDate).toBe("2026-06-25T11:00:00Z");
    });
  });

  describe("actions", () => {
    it("confirms a visit", async () => {
      vi.mocked(httpClient.patch).mockResolvedValue(undefined);

      await visitsHttpAdapter.confirm("visit-1");

      expect(httpClient.patch).toHaveBeenCalledWith(
        "/api/v1/visits/visit-1/confirm",
        {},
      );
    });

    it("completes a visit", async () => {
      vi.mocked(httpClient.patch).mockResolvedValue(undefined);

      await visitsHttpAdapter.complete("visit-1");

      expect(httpClient.patch).toHaveBeenCalledWith(
        "/api/v1/visits/visit-1/complete",
        {},
      );
    });

    it("cancels a visit", async () => {
      vi.mocked(httpClient.patch).mockResolvedValue(undefined);

      await visitsHttpAdapter.cancel("visit-1");

      expect(httpClient.patch).toHaveBeenCalledWith(
        "/api/v1/visits/visit-1/cancel",
        {},
      );
    });
  });
});
