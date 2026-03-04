const buildQuery = (
  query,
  sortableFields,
  page,
  limit
) => {
  const { sortBy, order } = query;
  const safePage = Math.max(parseInt(page) || 1, 1);
 const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
  const  defaultSortBy = "name"
  const defaultOrder = -1
  
  
  
  const orderBy =
  order && order.toLowerCase() === "asc" ? 1 : defaultOrder;
  
  const field =
  sortBy && sortableFields[sortBy]
  ? sortableFields[sortBy]
  : sortableFields[defaultSortBy];

  return {
    sort: { [field]: orderBy },
     page: safePage,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  };
};

module.exports = buildQuery;
