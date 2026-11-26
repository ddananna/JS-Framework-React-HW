// The only module the Redux thunks import for data.
// It re-exports the simulated backend. To use a real API later, change this file only.
export {
  queryItems,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  NotFoundError,
} from './fakeServer';
