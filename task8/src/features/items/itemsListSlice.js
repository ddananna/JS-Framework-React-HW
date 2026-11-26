import { createSlice } from '@reduxjs/toolkit';
import { fetchItemsList } from './itemsThunks';

// State of the list for the current URL query. The items themselves live in `catalog`.
const initialState = {
  params: null, // the query that produced the current ids
  ids: [],
  total: 0,
  page: 1,
  totalPages: 1,
  facets: { categories: [], statuses: [] },
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  requestId: null, // only the latest request may write to the state (stale-request guard)
  retryCount: 0, // failed attempts in a row
};

const itemsListSlice = createSlice({
  name: 'itemsList',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemsList.pending, (state, action) => {
        state.requestId = action.meta.requestId;
        state.params = action.meta.arg.params;
        state.status = 'loading';
        state.error = null;
        // ids stay in place while loading, so the old list remains on screen ("Updating…")
      })
      .addCase(fetchItemsList.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestId) return; // stale response
        const { items, total, page, totalPages, facets } = action.payload;
        state.ids = items.map((item) => item.id);
        state.total = total;
        state.page = page;
        state.totalPages = totalPages;
        state.facets = facets;
        state.status = 'succeeded';
        state.retryCount = 0;
        state.requestId = null;
      })
      .addCase(fetchItemsList.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestId) return; // stale response
        state.status = 'failed';
        state.error = action.error.message;
        state.retryCount += 1;
        state.requestId = null;
      });
  },
});

export default itemsListSlice.reducer;
