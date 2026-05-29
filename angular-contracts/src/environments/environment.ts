export const environment = {
  production: false,

  // Root API host, without trailing slash.
  apiBaseUrl: 'https://localhost:5001',

  // Backend route segments from your ASP.NET controllers.
  publicApiPath: 'api/public',
  adminApiPath: 'api/admin',

  get publicApiBaseUrl(): string {
    return `${this.apiBaseUrl}/${this.publicApiPath}`;
  },

  get adminApiBaseUrl(): string {
    return `${this.apiBaseUrl}/${this.adminApiPath}`;
  },
};
