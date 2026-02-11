import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import type { User, UserRole } from '@/types/settings';
import {
  fetchUsersListing,
  type UsersListingPayload,
  type UsersListingMeta,
  createUserApi,
  updateUserApi,
  type CreateOrUpdateUserPayload,
} from '@/pages/settings/settingsApiCalls';

export type UsersQuery = {
  page: number;
  pageSize: number;
  search: string;
  role: UserRole | 'all';
};

export type UsersListingEntry = {
  query: UsersQuery;
  ids: number[];
  meta: UsersListingMeta;
  fetchedAt: number;
};

interface UsersState {
  entities: Record<number, User>;
  listingsByKey: Record<string, UsersListingEntry | undefined>;
  listingLoadingByKey: Record<string, boolean | undefined>;
  listingErrorByKey: Record<string, string | undefined>;
  createLoading: boolean;
  updateLoadingById: Record<number, boolean | undefined>;
}

const initialState: UsersState = {
  entities: {},
  listingsByKey: {},
  listingLoadingByKey: {},
  listingErrorByKey: {},
  createLoading: false,
  updateLoadingById: {},
};

export const makeUsersQueryKey = (query: UsersQuery) =>
  JSON.stringify({
    page: query.page,
    pageSize: query.pageSize,
    search: query.search?.trim() || '',
    role: query.role,
  });

const userMatchesQuery = (user: User, query: UsersQuery) => {
  if (query.role !== 'all' && user.type !== query.role) return false;
  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    const hay = `${user.fullName} ${user.email}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
};

const buildFiltersPayload = (query: UsersQuery): UsersListingPayload => {
  const filters: UsersListingPayload['filters'] = [];

  if (query.role !== 'all') {
    filters.push({ columnName: 'type', type: 'exact', value: query.role });
  }

  if (query.search?.trim()) {
    filters.push({ columnName: 'search', type: 'like', value: query.search.trim() });
  }

  return { page: query.page, pageSize: query.pageSize, filters };
};

export const fetchUsersListingThunk = createAsyncThunk(
  'users/fetchListing',
  async (query: UsersQuery, { rejectWithValue }) => {
    try {
      const payload = buildFiltersPayload(query);
      const res = await fetchUsersListing(payload);
      return { key: makeUsersQueryKey(query), query, users: res.users, meta: res.meta };
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to fetch users listing');
    }
  },
  {
    condition: (query, { getState }) => {
      const state = getState() as RootState;
      const key = makeUsersQueryKey(query);
      if (state.users?.listingsByKey?.[key]) return false;
      if (state.users?.listingLoadingByKey?.[key]) return false;
      return true;
    },
  },
);

export const createUserThunk = createAsyncThunk('users/create', async (payload: CreateOrUpdateUserPayload, { rejectWithValue }) => {
  try {
    const created = await createUserApi(payload);
    if (!created) return rejectWithValue('Failed to create user');
    return created;
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to create user');
  }
});

export const updateUserThunk = createAsyncThunk(
  'users/update',
  async ({ id, payload }: { id: number; payload: Partial<CreateOrUpdateUserPayload> }, { rejectWithValue }) => {
    try {
      const updated = await updateUserApi(id, payload);
      if (!updated) return rejectWithValue('Failed to update user');
      return updated;
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to update user');
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersCache: state => {
      state.listingsByKey = {};
      state.listingLoadingByKey = {};
      state.listingErrorByKey = {};
    },
    // Allows UI to optimistically update listing pages AFTER a successful API call (create/update thunks already upsert entity)
    touchListingAfterMutation: (state, action: PayloadAction<{ userId: number }>) => {
      const user = state.entities[action.payload.userId];
      if (!user) return;

      Object.values(state.listingsByKey).forEach(entry => {
        if (!entry) return;

        const matches = userMatchesQuery(user, entry.query);
        const idx = entry.ids.indexOf(user.id);

        // If it no longer matches, remove from that cached listing page.
        if (!matches && idx !== -1) {
          entry.ids.splice(idx, 1);
          return;
        }

        // If it matches and isn't present, only inject into page 1 cache.
        if (matches && idx === -1 && entry.query.page === 1) {
          entry.ids.unshift(user.id);
          entry.ids = entry.ids.slice(0, entry.query.pageSize);
        }
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUsersListingThunk.pending, (state, action) => {
        const key = makeUsersQueryKey(action.meta.arg);
        state.listingLoadingByKey[key] = true;
        state.listingErrorByKey[key] = undefined;
      })
      .addCase(fetchUsersListingThunk.fulfilled, (state, action) => {
        const { key, query, users, meta } = action.payload;
        users.forEach(u => {
          state.entities[u.id] = u;
        });
        state.listingsByKey[key] = {
          query,
          ids: users.map(u => u.id),
          meta,
          fetchedAt: Date.now(),
        };
        state.listingLoadingByKey[key] = false;
      })
      .addCase(fetchUsersListingThunk.rejected, (state, action) => {
        const key = makeUsersQueryKey(action.meta.arg);
        state.listingLoadingByKey[key] = false;
        state.listingErrorByKey[key] = (action.payload as string) || action.error.message || 'Failed to fetch users';
      })
      .addCase(createUserThunk.pending, state => {
        state.createLoading = true;
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.createLoading = false;
        state.entities[action.payload.id] = action.payload;
      })
      .addCase(createUserThunk.rejected, state => {
        state.createLoading = false;
      })
      .addCase(updateUserThunk.pending, (state, action) => {
        state.updateLoadingById[action.meta.arg.id] = true;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.updateLoadingById[action.payload.id] = false;
        state.entities[action.payload.id] = action.payload;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.updateLoadingById[action.meta.arg.id] = false;
      });
  },
});

export const { clearUsersCache, touchListingAfterMutation } = usersSlice.actions;
export default usersSlice.reducer;

export const selectUsersListingEntry = (state: RootState, query: UsersQuery) => {
  const key = makeUsersQueryKey(query);
  return state.users.listingsByKey[key];
};

export const selectUsersForQuery = (state: RootState, query: UsersQuery) => {
  const entry = selectUsersListingEntry(state, query);
  if (!entry) return [];
  return entry.ids.map(id => state.users.entities[id]).filter(Boolean);
};

export const selectUsersListingLoading = (state: RootState, query: UsersQuery) => {
  const key = makeUsersQueryKey(query);
  return Boolean(state.users.listingLoadingByKey[key]);
};

export const selectUsersUpdateLoading = (state: RootState, userId: number) => Boolean(state.users.updateLoadingById[userId]);
