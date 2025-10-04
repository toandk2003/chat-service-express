const { User } = require("../../models/User");

const syncUpdateUser = async (data) => {
  console.log("syncing user.....");
  const {
    email,
    bio,
    location,
    learningLanguageId,
    nativeLanguageId,
    avatar,
    bucket,
    rowVersion,
  } = data;

  const user = await User.findOne({
    email: data.email,
  });

  if (!user) {
    console.log("User do not exists with email: ", email);
    return;
  }

  Object.assign(user, data);

  await user.save();

  console.log("user after update: ", JSON.stringify(user, null, 2));
};

module.exports = syncUpdateUser;
