import { createSelector } from '@reduxjs/toolkit';

// ---------- reusable base selectors (plain functions) ----------

// Item by id from the normalized catalog.
export const selectItemById = (state, id) => state.catalog.byId[id];

// Pagination, facets and request status of the current list query.
export const selectItemsListMeta = (state) => state.itemsList;

// Every item the dashboard loaded, in load order.
const selectAllIds = (state) => state.catalog.allIds;
const selectCatalogById = (state) => state.catalog.byId;

// ---------- memoized selectors (createSelector) ----------

// Memoized: rebuilds the array only when ids or byId change.
export const selectAllItems = createSelector([selectAllIds, selectCatalogById], (ids, byId) =>
  ids.map((id) => byId[id]).filter(Boolean)
);

// Memoized: the items of the current page. Deleted items drop out automatically.
export const selectListItems = createSelector(
  [(state) => state.itemsList.ids, selectCatalogById],
  (ids, byId) => ids.map((id) => byId[id]).filter(Boolean)
);

// Memoized: sorted unique categories for the dashboard filter.
export const selectCategories = createSelector([selectAllItems], (items) =>
  [...new Set(items.map((item) => item.category))].sort()
);

// Memoized: statistics for the dashboard. Filters are passed as strings so the cache hits.
const countBy = (items, key) =>
  Object.entries(
    items.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

export const selectDashboardStats = createSelector(
  [selectAllItems, (_state, category) => category, (_state, _category, status) => status],
  (items, category, status) => {
    const filtered = items.filter(
      (item) => (!category || item.category === category) && (!status || item.status === status)
    );
    const total = filtered.length;
    const totalValue = filtered.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const averagePrice = total ? filtered.reduce((sum, item) => sum + item.price, 0) / total : 0;

    return {
      total,
      totalValue,
      averagePrice,
      available: filtered.filter((item) => item.status === 'available').length,
      completed: filtered.filter((item) => item.status === 'completed').length,
      byCategory: countBy(filtered, 'category'),
      byStatus: countBy(filtered, 'status'),
      topByValue: [...filtered]
        .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
        .slice(0, 3),
    };
  }
);
