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
  await User.create(data);
};

module.exports = syncUser;
