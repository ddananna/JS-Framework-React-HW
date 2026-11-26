import { createAsyncThunk } from '@reduxjs/toolkit';
import * as itemsApi from '../../services/itemsApi';

// Every thunk is one async operation. createAsyncThunk dispatches
// <type>/pending, <type>/fulfilled and <type>/rejected. The slices handle them in extraReducers.

const sameParams = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 1. List fetching. Skips the request when the same query is already loaded or loading.
export const fetchItemsList = createAsyncThunk(
  'items/fetchList',
  ({ params }, { signal }) => itemsApi.queryItems(params, { signal }),
  {
    condition: ({ params, force }, { getState }) => {
      if (force) return true;
      const { itemsList } = getState();
      const reusable =
        sameParams(itemsList.params, params) &&
        (itemsList.status === 'succeeded' || itemsList.status === 'loading');
      return !reusable;
    },
  }
);

// 2. Details fetching. Skips the request when the full item is already in the store.
export const fetchItemDetails = createAsyncThunk(
  'items/fetchDetails',
  ({ id }, { signal }) => itemsApi.getItemById(id, { signal }),
  {
    condition: ({ id, force }, { getState }) =>
      Boolean(force) || !getState().catalog.byId[id]?.detailsLoaded,
  }
);

// Used by the dashboard. Runs only when the data is missing, failed or forced.
export const fetchAllItems = createAsyncThunk(
  'catalog/fetchAll',
  (_arg, { signal }) => itemsApi.getAllItems({ signal }),
  {
    condition: (arg, { getState }) =>
      Boolean(arg?.force) || ['idle', 'failed'].includes(getState().catalog.status),
  }
);

// Re-runs the current list query after a change, so the list shows the new data.
function refreshList(dispatch, getState) {
  const { params } = getState().itemsList;
  if (params) dispatch(fetchItemsList({ params, force: true }));
}

// 3. Mutations. Each one refreshes the list after the server confirms the change.
export const createItem = createAsyncThunk('items/create', async (values, { dispatch, getState }) => {
  const item = await itemsApi.createItem(values);
  refreshList(dispatch, getState);
  return item;
});

export const updateItem = createAsyncThunk(
  'items/update',
  async ({ id, patch }, { dispatch, getState }) => {
    const item = await itemsApi.updateItem(id, patch);
    refreshList(dispatch, getState);
    return item;
  }
);

export const deleteItem = createAsyncThunk('items/delete', async (id, { dispatch, getState }) => {
  await itemsApi.deleteItem(id);
  refreshList(dispatch, getState);
  return id;
});
