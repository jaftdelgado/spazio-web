import { mapClause, mapListClausesMeta } from "./clause.mapper";

describe("clause.mapper", () => {
  it("maps clause DTOs and normalizes the value type code", () => {
    expect(
      mapClause({
        clause_id: 11,
        code: "MIN_STAY",
        value_type: { code: "INTEGER" },
        sort_order: 4,
      }),
    ).toEqual({
      clauseId: 11,
      code: "MIN_STAY",
      valueType: { code: "integer" },
      sortOrder: 4,
    });
  });

  it("maps clause list metadata", () => {
    expect(
      mapListClausesMeta({
        total: 5,
        page: 2,
        page_size: 10,
        total_pages: 1,
        query: null,
      }),
    ).toEqual({
      total: 5,
      page: 2,
      pageSize: 10,
      totalPages: 1,
      query: null,
    });
  });
});
