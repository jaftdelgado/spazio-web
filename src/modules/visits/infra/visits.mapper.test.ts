import { mapVisit, mapTimeSlot } from "./visits.mapper";

describe("visits.mapper", () => {
  it("maps a visit response correctly", () => {
    const rawVisit = {
      visit_uuid: "visit-123",
      property_id: 101,
      property_title: "Casa de Campo",
      agent_id: 201,
      agent_name: "María Agente",
      agent_phone: "555-0199",
      visit_date: "2026-06-20T10:00:00Z",
      status: "pending",
      created_at: "2026-06-17T09:00:00Z",
      client_name: "Juan Cliente",
      client_phone: "555-0200",
      city_name: "CDMX",
      address: "Av. Reforma 123",
    };

    const expected = {
      visitUuid: "visit-123",
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
    };

    expect(mapVisit(rawVisit)).toEqual(expected);
  });

  it("maps a visit response with missing optional fields to fallbacks", () => {
    const rawVisit = {
      visit_uuid: "visit-123",
      property_id: 101,
      agent_id: 201,
      visit_date: "2026-06-20T10:00:00Z",
      status: "pending",
      created_at: "2026-06-17T09:00:00Z",
    };

    const expected = {
      visitUuid: "visit-123",
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
    };

    expect(mapVisit(rawVisit)).toEqual(expected);
  });

  it("maps a timeslot response correctly", () => {
    const rawSlot = {
      start_time: "09:00:00",
      end_time: "10:00:00",
      available: true,
    };

    const expected = {
      startTime: "09:00:00",
      endTime: "10:00:00",
      available: true,
    };

    expect(mapTimeSlot(rawSlot)).toEqual(expected);
  });
});
