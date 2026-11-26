import { createSlice } from '@reduxjs/toolkit';
import {
  createItem,
  deleteItem,
  fetchAllItems,
  fetchItemDetails,
  fetchItemsList,
  updateItem,
} from '../items/itemsThunks';

// Normalized storage: byId keeps each item once, even if several lists or pages use it.
// `detailsLoaded` marks records that have the full fields, not only the list summary.
const initialState = {
  byId: {},
  allIds: [], // ids returned by fetchAllItems (used by the dashboard)
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  requestId: null, // id of the latest fetchAllItems request; older responses are ignored
};

function upsert(state, items, { full = false } = {}) {
  items.forEach((item) => {
    state.byId[item.id] = {
      ...state.byId[item.id],
      ...item,
      ...(full ? { detailsLoaded: true } : {}),
    };
  });
}

// After a change, the dashboard data is out of date. Marking it idle makes it reload.
// Clearing requestId makes any response that is still in flight count as stale.
function markStale(state) {
  state.status = 'idle';
  state.requestId = null;
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemsList.fulfilled, (state, action) => {
        upsert(state, action.payload.items);
      })
      .addCase(fetchItemDetails.fulfilled, (state, action) => {
        upsert(state, [action.payload], { full: true });
      })
      .addCase(fetchAllItems.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchAllItems.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestId) return; // stale response
        upsert(state, action.payload, { full: true });
        state.allIds = action.payload.map((item) => item.id);
        state.status = 'succeeded';
        state.requestId = null;
      })
      .addCase(fetchAllItems.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestId) return; // stale response
        state.status = 'failed';
        state.error = action.error.message;
        state.requestId = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        upsert(state, [action.payload], { full: true });
        markStale(state);
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        upsert(state, [action.payload], { full: true });
        markStale(state);
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        delete state.byId[action.payload];
        state.allIds = state.allIds.filter((id) => id !== action.payload);
        markStale(state);
      });
  },
});

export default catalogSlice.reducer;
