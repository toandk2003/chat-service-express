const Statistic = require("../../models/Statistic");
const { User } = require("../../models/User");

const syncUser = async (data) => {
  console.log("syncing user.....");

  const user = await User.findOne({
    email: data.email,
  });

  if (user) {
    console.log("User already exists:", user);
    return;
  }
  const newUser = await User.create(data);
  await Statistic.create({
    userId: newUser._id,
  });
};

module.exports = syncUser;
