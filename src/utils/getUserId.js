import jwt from "jsonwebtoken";

const getUserId = (request, requireAuth = true) => {
  // console.log(
  //   `the value of request sent down to getUserID is :${request}`
  // );
  const header = request.req
    ? request.req.headers.authorization
    : request.connection.context.Authorization;

  if (header) {
    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded.userId;
  }
  if (requireAuth) {
    throw new Error("Authentication Required");
  }
  return null;
};

export { getUserId as default };
