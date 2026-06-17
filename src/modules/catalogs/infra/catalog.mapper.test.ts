import {
  mapModality,
  mapOrientation,
  mapPropertyType,
  mapRentPeriod,
} from "./catalog.mapper";

describe("catalog.mapper", () => {
  it("maps modality DTOs", () => {
    expect(mapModality({ modality_id: 3, name: "Rent" })).toEqual({
      modalityId: 3,
      name: "Rent",
    });
  });

  it("maps property type DTOs", () => {
    expect(
      mapPropertyType({
        property_type_id: 4,
        name: "House",
        icon: "house.svg",
        subtype: "residential",
      }),
    ).toEqual({
      propertyTypeId: 4,
      name: "House",
      icon: "house.svg",
      subtype: "residential",
    });
  });

  it("maps rent period and orientation DTOs", () => {
    expect(mapRentPeriod({ period_id: 2, name: "Monthly" })).toEqual({
      periodId: 2,
      name: "Monthly",
    });
    expect(mapOrientation({ orientation_id: 8, name: "North" })).toEqual({
      orientationId: 8,
      name: "North",
    });
  });
});
