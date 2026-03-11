import axios from 'axios';
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  total_count?: number;
  page?: number;
  page_size?: number;
  errors?: any;
}

interface FilterItem {
  columnName: string;
  type: 'exact' | 'like' | 'date_range';
  value?: any;
  startDate?: string;
  endDate?: string;
}

export interface ClientsPayload {
  page: number;
  pageSize: number;
  filters: FilterItem[];
  sorts?: {
    columnName: string;
    orderBy: 'asc' | 'desc';
  }[];
}

export interface ClientSession {
  id: string;
  noteId: string;
}

export interface Client {
  id: number;
  clientId: string;
  notesCount: number;
  sessions: ClientSession[];
}

export interface ClientsResponse {
  data: Client[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const formatClients = (items: any[]): Client[] => {
  return items.map((item: any, index: number) => {
    const id = item.id ?? item.clientId ?? item.client_id ?? index + 1;
    const clientId = item.clientId ?? item.client_id ?? id.toString();
    const rawSessions = Array.isArray(item.sessions) ? item.sessions : [];

    const sessions: ClientSession[] = (rawSessions as any[])
      .map((session, sessionIndex: number) => {
        const sessionId = session.id ?? session.sessionId ?? session.noteId ?? `${clientId}-${sessionIndex}`;
        const noteId = session.noteId ?? session.note_id ?? session.sessionId ?? session.id;

        if (!noteId) {
          return null;
        }

        return {
          id: String(sessionId),
          noteId: String(noteId),
        };
      })
      .filter((session): session is ClientSession => session !== null);

    const notesCount = sessions.length;

    return {
      id: Number(id),
      clientId: String(clientId),
      notesCount: Number(notesCount),
      sessions,
    };
  });
};

export const fetchClients = async (payload: ClientsPayload): Promise<ClientsResponse> => {
  try {
    const response = await axios.post<ApiResponse<any[]>>('/patients/listing', payload);

    if (response?.status && Array.isArray(response.data?.data)) {
      const clientsArray = response.data.data || [];
      const formatted = formatClients(clientsArray);
      const totalCount = response.data?.total_count ?? formatted.length;
      const page = response.data?.page ?? payload.page;
      const pageSize = response.data?.page_size ?? payload.pageSize;

      return {
        data: formatted,
        totalCount,
        page,
        pageSize,
      };
    }

    handleErrorMessages(response);
    return { data: [], totalCount: 0, page: payload.page, pageSize: payload.pageSize };
  } catch (error: any) {
    handleCatchMessages(error);
    return { data: [], totalCount: 0, page: payload.page, pageSize: payload.pageSize };
  }
};
