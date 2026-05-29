import { environment } from '../../environments/environment';

const PUBLIC_BASE = environment.publicApiBaseUrl;
const ADMIN_BASE = environment.adminApiBaseUrl;

const buildInfoCrudEndpoints = (controller: string) => ({
  getAll: `${ADMIN_BASE}/${controller}/GetAll`,
  getById: `${ADMIN_BASE}/${controller}/GetById`,
  create: `${ADMIN_BASE}/${controller}/Create`,
  update: `${ADMIN_BASE}/${controller}/Update`,
  delete: `${ADMIN_BASE}/${controller}/Delete`,
  makePassive: `${ADMIN_BASE}/${controller}/MakePassive`,
  makeActive: `${ADMIN_BASE}/${controller}/MakeActive`,
});

export const API_ENDPOINTS = {
  auth: {
    register: `${PUBLIC_BASE}/Auth/Register`,
    login: `${PUBLIC_BASE}/Auth/Login`,
    getProfile: `${PUBLIC_BASE}/Auth/GetProfile`,
    refreshToken: `${PUBLIC_BASE}/Auth/RefreshToken`,
  },

  admin: {
    info: {
      country: buildInfoCrudEndpoints('Country'),
      currencyType: buildInfoCrudEndpoints('CurrencyType'),
      contentType: buildInfoCrudEndpoints('ContentType'),
      gender: buildInfoCrudEndpoints('Gender'),
      infoTable: buildInfoCrudEndpoints('InfoTable'),
      language: buildInfoCrudEndpoints('Language'),
      region: buildInfoCrudEndpoints('Region'),
      role: buildInfoCrudEndpoints('Role'),
      roomPostType: buildInfoCrudEndpoints('RoomPostType'),
      roomType: buildInfoCrudEndpoints('RoomType'),
      status: buildInfoCrudEndpoints('Status'),
      translation: {
        ...buildInfoCrudEndpoints('Translation'),
        getRecordTranslations: `${ADMIN_BASE}/Translation/GetRecordTranslations`,
        getTranslation: `${ADMIN_BASE}/Translation/GetTranslation`,
      },
    },

    manual: {
      getGenderSelect: `${ADMIN_BASE}/Manual/GetGenderSelect`,
      getRoleSelect: `${ADMIN_BASE}/Manual/GetRoleSelect`,
      getCountrySelect: `${ADMIN_BASE}/Manual/GetCountrySelect`,
      getInfoTableSelect: `${ADMIN_BASE}/Manual/GetInfoTableSelect`,
      getRoomTypeSelect: `${ADMIN_BASE}/Manual/GetRoomTypeSelect`,
      getContentTypeSelect: `${ADMIN_BASE}/Manual/GetContentTypeSelect`,
      getCurrencyTypeSelect: `${ADMIN_BASE}/Manual/GetCurrencyTypeSelect`,
      getRoomPostTypeSelect: `${ADMIN_BASE}/Manual/GetRoomPostTypeSelect`,
      getStatusSelect: `${ADMIN_BASE}/Manual/GetStatusSelect`,
      getRegionSelect: `${ADMIN_BASE}/Manual/GetRegionSelect`, // ?countryCode=<code>
    },
  },
} as const;
