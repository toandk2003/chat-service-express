const createPaginateResponseLong = (
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
      conversations: records,
      pagination: {
        currentPage: +currentPage,
        pageSize: +pageSize,
        totalItems: +totalItems,
        totalPages: +Math.ceil(totalItems / pageSize),
      },
    },
  };
};

module.exports = createPaginateResponseLong;
