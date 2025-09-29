const createPaginateResponse = (
  success,
  status,
  message,
  currentPage,
  pageSize,
  totalItems,
  records
) => {
  return {
    success,
    status,
    message,
    data: {
      pagination: {
        currentPage: +currentPage,
        pageSize: +pageSize,
        totalItems: +totalItems,
        totalPages: +Math.ceil(totalItems / pageSize),
      },
      records,
    },
  };
};

module.exports = createPaginateResponse;
