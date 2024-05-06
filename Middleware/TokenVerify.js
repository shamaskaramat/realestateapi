const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const Prisma = require("../prisma/PrismaClient");

const TokenVerify = async (req, res, next) => {
  try {
    const token = req.headers["token"];
    if (!token) {
      return next(new ErrorHandler("Invalid token", 400));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new ErrorHandler("Invalid or expire token", 400));
    }
    const User = await Prisma.user.findFirst({
      where: {
        id: decoded.id,
      },
    });
    if (!User) {
      return next(new ErrorHandler("Invalid or expire token", 400));
    }
    req.user = User;
    next();
  } catch (error) {
    next(new ErrorHandler(error.message, 400));
  }
};

module.exports = TokenVerify;
