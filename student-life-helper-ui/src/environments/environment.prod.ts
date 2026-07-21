export const environment = {
  production: true,
  apiBaseUrl: 'https://studentlifehelper.com',
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