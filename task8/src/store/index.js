import { configureStore } from '@reduxjs/toolkit';
import catalogReducer from '../features/catalog/catalogSlice';
import itemsListReducer from '../features/items/itemsListSlice';
import itemDetailsReducer from '../features/items/itemDetailsSlice';

// Three feature slices:
//   catalog     - every item the app has loaded, stored once by id (normalized)
//   itemsList   - which ids the current list query shows, plus pagination and facets
//   itemDetails - the status of the details request and of the last mutation
export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    itemsList: itemsListReducer,
    itemDetails: itemDetailsReducer,
  },
});
