/**
 * SANO LUNA — API Types
 * Shared request/response shapes for Server Actions and Route Handlers.
 */

export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; details?: unknown }

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type SortOrder = 'asc' | 'desc'

export interface PaginationParams {
  page?: number
  perPage?: number
  sort?: string
  order?: SortOrder
}
