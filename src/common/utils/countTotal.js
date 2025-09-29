const countTotal = async (model, pipeline) => {
  const countResult = await model.aggregate([...pipeline, { $count: "total" }]);

  return countResult.length > 0 ? +countResult[0].total : 0;
};

module.exports = countTotal;
