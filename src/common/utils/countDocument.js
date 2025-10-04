const countDocument = async (model, pipeline) => {
  const result = await model.aggregate([...pipeline, { $count: "total" }]);
  return result.length > 0 ? result[0].total : 0;
};
