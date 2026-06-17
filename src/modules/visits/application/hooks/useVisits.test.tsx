import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { visitsHttpAdapter } from "../../infra/visits.http-adapter";
import { useVisitsList, useAvailableSlots, useVisitsMutations } from "./useVisits";

vi.mock("../../infra/visits.http-adapter", () => ({
  visitsHttpAdapter: {
    list: vi.fn(),
    getAvailableSlots: vi.fn(),
    schedule: vi.fn(),
    reschedule: vi.fn(),
    confirm: vi.fn(),
    complete: vi.fn(),
    cancel: vi.fn(),
  },
}));

describe("useVisits hooks", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads visits list", async () => {
    const mockVisits = [
      {
        visitUuid: "visit-1",
        propertyId: 101,
        propertyTitle: "Casa de Campo",
        agentId: 201,
        agentName: "María Agente",
        agentPhone: "555-0199",
        visitDate: "2026-06-20T10:00:00Z",
        status: "pending",
        createdAt: "2026-06-17T09:00:00Z",
        clientName: "Juan Cliente",
        clientPhone: "555-0200",
        cityName: "CDMX",
        address: "Av. Reforma 123",
      },
    ];
    vi.mocked(visitsHttpAdapter.list).mockResolvedValue(mockVisits);

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useVisitsList({ statusId: 1 }), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockVisits);
    });
    expect(visitsHttpAdapter.list).toHaveBeenCalledWith({ statusId: 1 });
  });

  it("disables getAvailableSlots when propertyId is null", () => {
    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useAvailableSlots(null, "2026-06-20"), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(visitsHttpAdapter.getAvailableSlots).not.toHaveBeenCalled();
  });

  it("loads available slots when propertyId is provided", async () => {
    const mockSlots = [{ startTime: "09:00:00", endTime: "10:00:00", available: true }];
    vi.mocked(visitsHttpAdapter.getAvailableSlots).mockResolvedValue(mockSlots);

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useAvailableSlots(101, "2026-06-20"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockSlots);
    });
    expect(visitsHttpAdapter.getAvailableSlots).toHaveBeenCalledWith(101, "2026-06-20");
  });

  it("triggers mutations and invalidates related query keys", async () => {
    vi.mocked(visitsHttpAdapter.schedule).mockResolvedValue({} as any);
    vi.mocked(visitsHttpAdapter.reschedule).mockResolvedValue({} as any);
    vi.mocked(visitsHttpAdapter.confirm).mockResolvedValue(undefined);
    vi.mocked(visitsHttpAdapter.complete).mockResolvedValue(undefined);
    vi.mocked(visitsHttpAdapter.cancel).mockResolvedValue(undefined);

    const { Wrapper, queryClient } = createQueryClientWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useVisitsMutations(), { wrapper: Wrapper });

    await result.current.scheduleVisit.mutateAsync({
      propertyId: 101,
      visitDate: "2026-06-20T10:00:00Z",
    });
    expect(visitsHttpAdapter.schedule).toHaveBeenCalledWith({
      propertyId: 101,
      visitDate: "2026-06-20T10:00:00Z",
    });

    await result.current.rescheduleVisit.mutateAsync({
      visitUuid: "visit-1",
      input: {
        propertyId: 101,
        visitDate: "2026-06-25T11:00:00Z",
      },
    });
    expect(visitsHttpAdapter.reschedule).toHaveBeenCalledWith("visit-1", {
      propertyId: 101,
      visitDate: "2026-06-25T11:00:00Z",
    });

    await result.current.confirmVisit.mutateAsync("visit-1");
    expect(visitsHttpAdapter.confirm).toHaveBeenCalledWith("visit-1");

    await result.current.completeVisit.mutateAsync("visit-1");
    expect(visitsHttpAdapter.complete).toHaveBeenCalledWith("visit-1");

    await result.current.cancelVisit.mutateAsync("visit-1");
    expect(visitsHttpAdapter.cancel).toHaveBeenCalledWith("visit-1");

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["visits"] });
  });
});
