export * from './dtos';
export * from './chat-dtos';
export * from './currency-post-dtos';
export * from './entities';
export * from './api-endpoints';
export interface SqlQueryEntry {
    sql: string;
    duration: string;
  }
  
  export interface ApiResponse<T> {
    data: T;
    queries: SqlQueryEntry[];
  }