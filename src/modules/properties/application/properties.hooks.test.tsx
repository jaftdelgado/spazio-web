import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { propertyGetHttpAdapter } from "@properties/infra/get/property-get.http-adapter";
import { propertyPostHttpAdapter } from "@properties/infra/post/property-post.http-adapter";
import { propertyPatchHttpAdapter } from "@properties/infra/patch/property-patch.http-adapter";
import { propertyDeleteHttpAdapter } from "@properties/infra/delete/property-delete.http-adapter";
import { propertyPricesHttpAdapter } from "@properties/infra/prices/property-prices.http-adapter";
import { propertyPhotosHttpAdapter } from "@properties/infra/photos/property-photos.http-adapter";
import { propertyClausesHttpAdapter } from "@properties/infra/clauses/property-clauses.http-adapter";
import { propertyServicesHttpAdapter } from "@properties/infra/services/property-services.http-adapter";
import {
  clearEditingPropertyUuid,
  readEditingPropertyUuid,
  saveEditingPropertyUuid,
} from "@properties/application/edit/property-edit-session";

import {
  useProperty,
  usePropertyHistory,
  usePropertyList,
  usePropertyPricesHistory,
} from "./get/hooks/useProperty";
import { useCreateProperty } from "./post/hooks/useCreateProperty";
import { useUpdateProperty } from "./patch/hooks/useUpdateProperty";
import { useDeleteProperty } from "./delete/hooks/useDeleteProperty";
import { usePropertyPrices, useUpdatePropertyPrices } from "./prices/hooks/usePropertyPrices";
import { usePropertyPhotos, useUpdatePropertyPhotos } from "./photos/hooks/usePropertyPhotos";
import { usePropertyClauses, useUpdatePropertyClauses } from "./clauses/hooks/usePropertyClauses";
import { usePropertyServices, useUpdatePropertyServices } from "./services/hooks/usePropertyServices";

vi.mock("@properties/infra/get/property-get.http-adapter", () => ({
  propertyGetHttpAdapter: {
    listProperties: vi.fn(),
    getProperty: vi.fn(),
    getPropertyHistory: vi.fn(),
    getPropertyPricesHistory: vi.fn(),
  },
}));

vi.mock("@properties/infra/post/property-post.http-adapter", () => ({
  propertyPostHttpAdapter: {
    createProperty: vi.fn(),
  },
}));

vi.mock("@properties/infra/patch/property-patch.http-adapter", () => ({
  propertyPatchHttpAdapter: {
    updateProperty: vi.fn(),
  },
}));

vi.mock("@properties/infra/delete/property-delete.http-adapter", () => ({
  propertyDeleteHttpAdapter: {
    deleteProperty: vi.fn(),
  },
}));

vi.mock("@properties/infra/prices/property-prices.http-adapter", () => ({
  propertyPricesHttpAdapter: {
    getPropertyPrices: vi.fn(),
    updatePropertyPrices: vi.fn(),
  },
}));

vi.mock("@properties/infra/photos/property-photos.http-adapter", () => ({
  propertyPhotosHttpAdapter: {
    getPropertyPhotos: vi.fn(),
    updatePropertyPhotos: vi.fn(),
  },
}));

vi.mock("@properties/infra/clauses/property-clauses.http-adapter", () => ({
  propertyClausesHttpAdapter: {
    getPropertyClauses: vi.fn(),
    updatePropertyClauses: vi.fn(),
  },
}));

vi.mock("@properties/infra/services/property-services.http-adapter", () => ({
  propertyServicesHttpAdapter: {
    getPropertyServices: vi.fn(),
    updatePropertyServices: vi.fn(),
  },
}));

describe("property application hooks and session helpers", () => {
  it("loads property resources through queries", async () => {
    vi.mocked(propertyGetHttpAdapter.listProperties).mockResolvedValue({
      data: [],
      meta: {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrev: false,
      },
    });
    vi.mocked(propertyGetHttpAdapter.getProperty).mockResolvedValue({
      propertyUuid: "uuid-1",
      subtype: "residential",
      title: "Demo",
      description: "Description",
      propertyTypeId: 1,
      modalityId: 2,
      statusId: 1,
      lotArea: 100,
      isFeatured: false,
      registeredBy: "",
      residential: null,
      commercial: null,
      location: null,
    });
    vi.mocked(propertyGetHttpAdapter.getPropertyHistory).mockResolvedValue([]);
    vi.mocked(propertyGetHttpAdapter.getPropertyPricesHistory).mockResolvedValue([]);
    vi.mocked(propertyPricesHttpAdapter.getPropertyPrices).mockResolvedValue({
      salePrice: null,
      rentPrices: [],
    });
    vi.mocked(propertyPhotosHttpAdapter.getPropertyPhotos).mockResolvedValue({
      photos: [],
    });
    vi.mocked(propertyClausesHttpAdapter.getPropertyClauses).mockResolvedValue({
      clauses: [],
    });
    vi.mocked(propertyServicesHttpAdapter.getPropertyServices).mockResolvedValue({
      serviceIds: [],
    });

    const { Wrapper } = createQueryClientWrapper();
    const listHook = renderHook(() => usePropertyList(), { wrapper: Wrapper });
    const detailHook = renderHook(() => useProperty("uuid-1"), { wrapper: Wrapper });
    const historyHook = renderHook(() => usePropertyHistory("uuid-1"), {
      wrapper: Wrapper,
    });
    const pricesHistoryHook = renderHook(
      () => usePropertyPricesHistory("uuid-1"),
      { wrapper: Wrapper },
    );
    const pricesHook = renderHook(() => usePropertyPrices("uuid-1"), {
      wrapper: Wrapper,
    });
    const photosHook = renderHook(() => usePropertyPhotos("uuid-1"), {
      wrapper: Wrapper,
    });
    const clausesHook = renderHook(() => usePropertyClauses("uuid-1"), {
      wrapper: Wrapper,
    });
    const servicesHook = renderHook(() => usePropertyServices("uuid-1"), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(listHook.result.current.data?.meta.currentPage).toBe(1);
      expect(detailHook.result.current.data?.propertyUuid).toBe("uuid-1");
      expect(historyHook.result.current.data).toEqual([]);
      expect(pricesHistoryHook.result.current.data).toEqual([]);
      expect(pricesHook.result.current.data?.rentPrices).toEqual([]);
      expect(photosHook.result.current.data?.photos).toEqual([]);
      expect(clausesHook.result.current.data?.clauses).toEqual([]);
      expect(servicesHook.result.current.data?.serviceIds).toEqual([]);
    });
  });

  it("disables property detail queries without a uuid", () => {
    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useProperty(""), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(propertyGetHttpAdapter.getProperty).not.toHaveBeenCalled();
  });

  it("invalidates related queries after successful mutations", async () => {
    vi.mocked(propertyPostHttpAdapter.createProperty).mockResolvedValue({
      propertyUuid: "uuid-2",
    });
    vi.mocked(propertyPatchHttpAdapter.updateProperty).mockResolvedValue({
      updated: true,
    });
    vi.mocked(propertyDeleteHttpAdapter.deleteProperty).mockResolvedValue(undefined);
    vi.mocked(propertyPricesHttpAdapter.updatePropertyPrices).mockResolvedValue(
      undefined,
    );
    vi.mocked(propertyPhotosHttpAdapter.updatePropertyPhotos).mockResolvedValue(
      undefined,
    );
    vi.mocked(propertyClausesHttpAdapter.updatePropertyClauses).mockResolvedValue(
      undefined,
    );
    vi.mocked(propertyServicesHttpAdapter.updatePropertyServices).mockResolvedValue(
      undefined,
    );

    const { Wrapper, queryClient } = createQueryClientWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const createHook = renderHook(() => useCreateProperty(), { wrapper: Wrapper });
    const updateHook = renderHook(() => useUpdateProperty("uuid-1"), {
      wrapper: Wrapper,
    });
    const deleteHook = renderHook(() => useDeleteProperty(), { wrapper: Wrapper });
    const updatePricesHook = renderHook(() => useUpdatePropertyPrices("uuid-1"), {
      wrapper: Wrapper,
    });
    const updatePhotosHook = renderHook(() => useUpdatePropertyPhotos("uuid-1"), {
      wrapper: Wrapper,
    });
    const updateClausesHook = renderHook(
      () => useUpdatePropertyClauses("uuid-1"),
      { wrapper: Wrapper },
    );
    const updateServicesHook = renderHook(
      () => useUpdatePropertyServices("uuid-1"),
      { wrapper: Wrapper },
    );

    await createHook.result.current.mutateAsync({} as never);
    await updateHook.result.current.mutateAsync({} as never);
    await deleteHook.result.current.mutateAsync({
      uuid: "uuid-1",
      input: { confirm: true },
    });
    await updatePricesHook.result.current.mutateAsync({ rentPrices: [] });
    await updatePhotosHook.result.current.mutateAsync({ photos: [] });
    await updateClausesHook.result.current.mutateAsync({ clauses: [] });
    await updateServicesHook.result.current.mutateAsync({ serviceIds: [] });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["properties", "list"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["properties", "detail", "uuid-1"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["properties"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["properties", "prices-history", "uuid-1"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["properties", "photos", "uuid-1"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["properties", "clauses", "uuid-1"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["properties", "services", "uuid-1"],
    });
  });

  it("stores and clears the editing property uuid in session storage", () => {
    saveEditingPropertyUuid("uuid-1");
    expect(readEditingPropertyUuid()).toBe("uuid-1");

    clearEditingPropertyUuid();
    expect(readEditingPropertyUuid()).toBeNull();
  });
});
