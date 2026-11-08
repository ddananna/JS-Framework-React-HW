// All API requests go through this module. Components and hooks never call the backend directly.
// Swap the import below for a real HTTP client (fetch/axios) when a real backend exists.
import * as backend from './fakeServer';

export { NotFoundError } from './fakeServer';

export const queryItems = (params, options) => backend.queryItems(params, options);
export const fetchAllItems = (options) => backend.getAllItems(options);
export const fetchItemById = (id, options) => backend.getItemById(id, options);
export const createItem = (values) => backend.createItem(values);
export const updateItem = (id, patch) => backend.updateItem(id, patch);
export const deleteItem = (id) => backend.deleteItem(id);
