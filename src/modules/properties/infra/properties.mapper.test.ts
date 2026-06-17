import {
  mapPropertyDetail,
  mapPropertyHistoryList,
  mapPropertyList,
  mapPropertyPricesHistoryList,
} from "@properties/infra/get/property-get.mapper";
import { mapPropertyClauses } from "@properties/infra/clauses/property-clauses.mapper";
import { mapPropertyPhotos } from "@properties/infra/photos/property-photos.mapper";
import { mapPropertyPrices } from "@properties/infra/prices/property-prices.mapper";
import { mapPropertyServices } from "@properties/infra/services/property-services.mapper";

describe("property mappers", () => {
  it("maps property list responses", () => {
    const result = mapPropertyList({
      data: [
        {
          property_id: 1,
          property_uuid: "uuid-1",
          title: "Demo",
          cover_photo_url: "properties/demo/cover.webp",
          property_type: {
            property_type_id: 2,
            name: "Apartment",
            icon: null,
          },
          modality: { modality_id: 3, name: "Rent" },
          status: { status_id: 1, name: "Published" },
          price: {
            amount: 12000,
            currency: "MXN",
            price_type: "rent",
            period_name: "Monthly",
          },
          location: {
            country_id: 1,
            country_name: "Mexico",
            state_id: 2,
            state_name: "CDMX",
            city_id: 3,
            city_name: "Roma Norte",
          },
          city: null,
          neighborhood: "Roma Norte",
          address_summary: "Roma Norte, CDMX",
          bedrooms: 2,
          bathrooms: 1,
          parking_spots: 1,
          built_area: 80,
        },
      ],
      meta: {
        total_count: 1,
        total_pages: 1,
        current_page: 1,
        page_size: 10,
        has_next: false,
        has_prev: false,
      },
    });

    expect(result.meta.totalCount).toBe(1);
    expect(result.data[0].coverPhotoUrl).toContain("/properties/demo/cover.webp");
    expect(result.data[0].city).toBe("Roma Norte");
  });

  it("maps property detail responses", () => {
    const result = mapPropertyDetail({
      data: {
        property_uuid: "uuid-1",
        subtype: "residential",
        title: "Demo",
        description: "Description",
        property_type_id: 2,
        modality_id: 3,
        status_id: 1,
        lot_area: 100,
        is_featured: true,
        registered_by: "Agent",
        residential: {
          bedrooms: 2,
          bathrooms: 1,
          beds: 2,
          floors: 1,
          parking_spots: 1,
          built_area: 80,
          construction_year: 2020,
          orientation_id: 5,
          is_furnished: true,
        },
        commercial: null,
        location: {
          country_id: 1,
          country_name: "Mexico",
          state_id: 2,
          state_name: "CDMX",
          city_id: 3,
          city_name: "Roma Norte",
          neighborhood: "Roma Norte",
          street: "Street",
          exterior_number: "10",
          interior_number: null,
          postal_code: "01000",
          latitude: 19.4,
          longitude: -99.1,
          is_public_address: true,
        },
      },
    });

    expect(result.residential?.isFurnished).toBe(true);
    expect(result.location?.street).toBe("Street");
  });

  it("maps property history and price history", () => {
    expect(
      mapPropertyHistoryList({
        data: [
          {
            history_id: 9,
            property_uuid: "uuid-1",
            previous_status_name: "Draft",
            new_status_name: "Published",
            changed_by_name: "Admin",
            changed_at: "2026-01-01T00:00:00Z",
          },
        ],
      }),
    ).toEqual([
      {
        historyId: 9,
        propertyUuid: "uuid-1",
        previousStatusName: "Draft",
        newStatusName: "Published",
        changedByName: "Admin",
        changedAt: "2026-01-01T00:00:00Z",
      },
    ]);

    const priceHistory = mapPropertyPricesHistoryList({
      data: [
        {
          price_type: "rent",
          amount: 12000,
          currency: "MXN",
          period_name: "Monthly",
          is_negotiable: true,
          deposit: 5000,
          valid_from: "2026-01-01",
          valid_until: null,
          is_current: true,
        },
      ],
    });

    expect(priceHistory[0].periodName).toBe("Monthly");
  });

  it("maps clauses, prices, photos, and services", () => {
    expect(
      mapPropertyClauses({
        data: [{ clause_id: 1, boolean_value: true, integer_value: null }],
      }),
    ).toEqual({
      clauses: [
        {
          clauseId: 1,
          booleanValue: true,
          integerValue: null,
          minValue: null,
          maxValue: null,
        },
      ],
    });

    expect(
      mapPropertyPrices({
        data: {
          sale_price: {
            sale_price: 1000000,
            currency: "MXN",
            is_negotiable: false,
          },
          rent_prices: [],
        },
      }),
    ).toEqual({
      salePrice: {
        salePrice: 1000000,
        currency: "MXN",
        isNegotiable: false,
      },
      rentPrices: [],
    });

    expect(
      mapPropertyPhotos({
        data: [
          {
            photo_id: 3,
            storage_key: "properties/demo/photo.webp",
            url: null,
            mime_type: "image/webp",
            sort_order: 1,
            is_cover: true,
          },
        ],
      }),
    ).toEqual({
      photos: [
        expect.objectContaining({
          photoId: 3,
          isCover: true,
        }),
      ],
    });

    expect(
      mapPropertyServices({ data: { service_ids: [1, 2, 3] } }),
    ).toEqual({ serviceIds: [1, 2, 3] });
  });
});
