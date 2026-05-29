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

const MAIN_PAGE_BASE = environment.mainPageApiBaseUrl;
const CHAT_BASE = `${environment.apiBaseUrl}/api/chat`;

export const API_ENDPOINTS = {
  chat: {
    hubUrl: `${environment.apiBaseUrl}/hubs/chat`,
    getMyChats: `${CHAT_BASE}/Chat/GetMyChats`,
    getChatById: (chatId: string) => `${CHAT_BASE}/Chat/GetChatById/${chatId}`,
    getOrCreateChat: (targetUserId: string) =>
      `${CHAT_BASE}/Chat/GetOrCreateChat?targetUserId=${encodeURIComponent(targetUserId)}`,
    getMessages: (chatId: string) => `${CHAT_BASE}/Chat/GetMessages/${chatId}/messages`,
    sendMessage: (chatId: string, messageText: string, replyToMessageId?: number | null) => {
      let url = `${CHAT_BASE}/Chat/SendMessage?chatId=${encodeURIComponent(chatId)}&messageText=${encodeURIComponent(messageText)}`;
      if (replyToMessageId != null && replyToMessageId > 0) {
        url += `&replyToMessageId=${replyToMessageId}`;
      }
      return url;
    },
    editMessage: (messageId: number, newMessageText: string) =>
      `${CHAT_BASE}/Chat/EditMessage/${messageId}?newMessageText=${encodeURIComponent(newMessageText)}`,
    deleteMessage: (messageId: number) => `${CHAT_BASE}/Chat/DeleteMessage/${messageId}`,
    markAsRead: (chatId: string) => `${CHAT_BASE}/Chat/MarkAsRead/${chatId}/mark-as-read`,
    getParticipants: (chatId: string) => `${CHAT_BASE}/UserChat/GetParticipants/${chatId}`,
  },
  mainPage: {
    /**
     * Base route: `api/main-page/[controller]/[action]` (see `BaseMainPageController`).
     * With default `SuppressAsyncSuffixInActionNames` (true), actions map as `AddAsync`→`Add`, `AddContentAsync`→`AddContent`, `GetUserRoomPostsAsync`→`GetUserRoomPosts`.
     * `GetAll`, `GetUserRoomPosts`: `HttpPost` + `[FromBody]`.
     * `Update`, `Activate`, `Deactivate`, `Delete`: `PUT …/{id}` (`Update` uses JSON body).
     * If your host disables suffix suppression, `RoomPostService` retries the same request once using `…Async` action names on 404/405.
     */
    roomPosts: {
      add: `${MAIN_PAGE_BASE}/RoomPosts/Add`,
      getAll: `${MAIN_PAGE_BASE}/RoomPosts/GetAll`,
      getUserRoomPosts: `${MAIN_PAGE_BASE}/RoomPosts/GetUserRoomPosts`,
      getById: (id: number) => `${MAIN_PAGE_BASE}/RoomPosts/GetById/${id}`,
      addContent: (roomPostId: number) => `${MAIN_PAGE_BASE}/RoomPosts/AddContent/${roomPostId}`,
      update: (id: number) => `${MAIN_PAGE_BASE}/RoomPosts/Update/${id}`,
      activate: (id: number) => `${MAIN_PAGE_BASE}/RoomPosts/Activate/${id}`,
      deactivate: (id: number) => `${MAIN_PAGE_BASE}/RoomPosts/Deactivate/${id}`,
      delete: (id: number) => `${MAIN_PAGE_BASE}/RoomPosts/Delete/${id}`,
      deleteContent: (roomPostId: number, contentId: number) =>
        `${MAIN_PAGE_BASE}/RoomPosts/DeleteContentAsync/${roomPostId}/${contentId}`,
      setCover: (roomPostId: number, contentId: number) =>
        `${MAIN_PAGE_BASE}/RoomPosts/SetCoverAsync/${roomPostId}/${contentId}`,
    },
    currencyPosts: {
      add: `${MAIN_PAGE_BASE}/CurrencyPosts/Add`,
      getAll: `${MAIN_PAGE_BASE}/CurrencyPosts/GetAll`,
      getUserPosts: `${MAIN_PAGE_BASE}/CurrencyPosts/GetUserCurrencyPosts`,
      getById: (id: number) => `${MAIN_PAGE_BASE}/CurrencyPosts/GetById/${id}`,
      update: (id: number) => `${MAIN_PAGE_BASE}/CurrencyPosts/Update/${id}`,
      activate: (id: number) => `${MAIN_PAGE_BASE}/CurrencyPosts/Activate/${id}`,
      deactivate: (id: number) => `${MAIN_PAGE_BASE}/CurrencyPosts/Deactivate/${id}`,
      delete: (id: number) => `${MAIN_PAGE_BASE}/CurrencyPosts/Delete/${id}`,
    },
  },
  auth: {
    register: `${PUBLIC_BASE}/Auth/Register`,
    login: `${PUBLIC_BASE}/Auth/Login`,
    getProfile: `${PUBLIC_BASE}/Auth/GetProfile`,
    refreshToken: `${PUBLIC_BASE}/Auth/RefreshToken`,
    updateProfile: `${PUBLIC_BASE}/Auth/UpdateProfile`,
    updateUsername: `${PUBLIC_BASE}/Auth/UpdateUsername`,
    updateUserImage: `${PUBLIC_BASE}/Auth/UpdateUserImage`,
  },
  public: {
    manual: {
      getGenderSelect: `${PUBLIC_BASE}/Manual/GetGenderSelect`,
      getCountrySelect: `${PUBLIC_BASE}/Manual/GetCountrySelect`,
      getRegionSelect: `${PUBLIC_BASE}/Manual/GetRegionSelect`,
      getLanguageSelect: `${PUBLIC_BASE}/Manual/GetLanguageSelect`,
      getRoomTypeSelect: `${PUBLIC_BASE}/Manual/GetRoomTypeSelect`,
      getCurrencyTypeSelect: `${PUBLIC_BASE}/Manual/GetCurrencyTypeSelect`,
      getRoomPostTypeSelect: `${PUBLIC_BASE}/Manual/GetRoomPostTypeSelect`,
    },
  },
  admin: {
    users: {
      getAll: `${ADMIN_BASE}/Users/GetAll`,
      getByUsername: `${ADMIN_BASE}/Users/GetByUsername`,
      activate: (userId: string) => `${ADMIN_BASE}/Users/Activate/${userId}`,
      deactivate: (userId: string) => `${ADMIN_BASE}/Users/Deactivate/${userId}`,
      update: (userId: string) => `${ADMIN_BASE}/Users/Update/${userId}`,
      updateUserImage: (userId: string) => `${ADMIN_BASE}/Users/UpdateUserImage/${userId}`,
      delete: (userId: string) => `${ADMIN_BASE}/Users/Delete/${userId}`,
    },
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
      getRegionSelect: `${ADMIN_BASE}/Manual/GetRegionSelect`,
    },
  },
} as const;
