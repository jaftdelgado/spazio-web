export const httpClient = {
  get: async <T>(url: string) => {
    void url;
    return Promise.resolve({} as T);
  },
  post: async <T>(url: string, body?: unknown) => {
    void url;
    void body;
    return Promise.resolve({} as T);
  },
  put: async <T>(url: string, body?: unknown) => {
    void url;
    void body;
    return Promise.resolve({} as T);
  },
  delete: async <T>(url: string) => {
    void url;
    return Promise.resolve({} as T);
  },
};
