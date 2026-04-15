export interface PageProps {
  params: Record<string, string>;
  searchParams: Record<string, string | string[] | undefined>;
}

export interface LayoutProps {
  children: React.ReactNode;
  params?: Record<string, string>;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SelectOption {
  label: string;
  value: string;
}
