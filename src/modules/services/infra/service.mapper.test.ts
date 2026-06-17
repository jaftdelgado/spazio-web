import { mapListServicesMeta, mapService } from "./service.mapper";

describe("service.mapper", () => {
  it("maps a service DTO", () => {
    expect(
      mapService({
        service_id: 7,
        code: "WIFI",
        icon: "Wifi02Icon",
        category_code: "technology",
      }),
    ).toEqual({
      serviceId: 7,
      code: "WIFI",
      icon: "Wifi02Icon",
      categoryCode: "technology",
    });
  });

  it("maps service metadata", () => {
    expect(
      mapListServicesMeta({
        total: 20,
        page: 2,
        page_size: 10,
        total_pages: 2,
        query: "wifi",
      }),
    ).toEqual({
      total: 20,
      page: 2,
      pageSize: 10,
      totalPages: 2,
      query: "wifi",
    });
  });
});
