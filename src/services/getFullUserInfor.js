const axios = require("axios");

const getFullUserInfor = async (req, email) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth)
    return res.status(401).json({ message: "Missing Authorization header" });

  const parts = auth.trim().split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({
      message: "Invalid Authorization format. Expected: Bearer <token>",
    });

  const token = parts[1];
  const targetUrl = process.env.SPRING_URL + "/api/user/detail";
  const response = await axios.get(targetUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Accept-Language": "en", // thêm dòng này
      // bạn có thể thêm header khác ở đây
    },
    params: { email }, // sẽ thành ?email=xxx
    timeout: 10_000,
  });
  return response.data.data;
};
module.exports = getFullUserInfor;
