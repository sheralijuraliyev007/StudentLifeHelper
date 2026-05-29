export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5178',
  publicApiPath: 'api/public',
  adminApiPath: 'api/admin',
  mainPageApiPath: 'api/main-page',
  get publicApiBaseUrl(): string {
    return `${this.apiBaseUrl}/${this.publicApiPath}`;
  },
  get adminApiBaseUrl(): string {
    return `${this.apiBaseUrl}/${this.adminApiPath}`;
  },
  get mainPageApiBaseUrl(): string {
    return `${this.apiBaseUrl}/${this.mainPageApiPath}`;
  },
};
