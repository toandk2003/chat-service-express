const queryDocument = async (model, pipeline, pageSize, currentPage) => {
  return await model.aggregate([
    ...pipeline,
    { $skip: +currentPage * +pageSize },
    { $limit: +pageSize },
  ]);
};

module.exports = queryDocument;
