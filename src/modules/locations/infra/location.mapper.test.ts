import {
  mapCity,
  mapCountry,
  mapListCitiesMeta,
  mapState,
} from "./location.mapper";

describe("location.mapper", () => {
  it("maps country, state, and city DTOs", () => {
    expect(
      mapCountry({ country_id: 1, iso2_code: "MX", name: "Mexico" }),
    ).toEqual({
      countryId: 1,
      iso2Code: "MX",
      name: "Mexico",
    });

    expect(
      mapState({ state_id: 2, iso_code: "CMX", name: "Ciudad de Mexico" }),
    ).toEqual({
      stateId: 2,
      isoCode: "CMX",
      name: "Ciudad de Mexico",
    });

    expect(mapCity({ city_id: 3, name: "Roma Norte" })).toEqual({
      cityId: 3,
      name: "Roma Norte",
    });
  });

  it("maps city pagination metadata", () => {
    expect(
      mapListCitiesMeta({ total: 10, page: 2, page_size: 5, total_pages: 3 }),
    ).toEqual({
      total: 10,
      page: 2,
      pageSize: 5,
      totalPages: 3,
    });
  });
});
