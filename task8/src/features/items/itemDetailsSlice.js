import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { createItem, deleteItem, fetchItemDetails, updateItem } from './itemsThunks';

// Status of the details request and of the last mutation (create, update, delete).
const initialState = {
  currentId: null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null, // { name, message }, so the page can tell NotFoundError apart
  requestId: null,
  mutationStatus: 'idle', // idle | loading | succeeded | failed
  mutationError: null,
};

const isMutationPending = isAnyOf(createItem.pending, updateItem.pending, deleteItem.pending);
const isMutationFulfilled = isAnyOf(createItem.fulfilled, updateItem.fulfilled, deleteItem.fulfilled);
const isMutationRejected = isAnyOf(createItem.rejected, updateItem.rejected, deleteItem.rejected);

const itemDetailsSlice = createSlice({
  name: 'itemDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemDetails.pending, (state, action) => {
        state.currentId = action.meta.arg.id;
        state.status = 'loading';
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchItemDetails.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestId) return; // stale response
        state.status = 'succeeded';
        state.requestId = null;
      })
      .addCase(fetchItemDetails.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestId) return; // stale response
        state.status = 'failed';
        state.error = { name: action.error.name, message: action.error.message };
        state.requestId = null;
      })
      .addMatcher(isMutationPending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addMatcher(isMutationFulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addMatcher(isMutationRejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message;
      });
  },
});

export default itemDetailsSlice.reducer;
