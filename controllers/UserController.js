const Prisma = require("../prisma/PrismaClient");
const ErrorHandler = require("../utils/ErrorHandler");
const validator = require("validator");

module.exports = {
  // / --- sign up the user
  CreateUser: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      if (!username) {
        return next(new ErrorHandler("Invalid username", 400))
      }
      if (!email) {
        return next(new ErrorHandler("Invalid email", 400))
      }
      if (!password) {
        return next(new ErrorHandler("Invalid password", 400))
      }

      // --- check is email is correct  
      if (!validator.isEmail(email)) {
        return next(new ErrorHandler("Invalid email", 400))
      }

      // ---- chack is user already in db
      const isUser = await Prisma.user.findFirst({
        where: {
          email : email,
        },
      });

      // --- if exist
      if (isUser) {
        return res.status(400).json({
          success: false,
          message: "User already exist",
        });
      }

      const user = await Prisma.user.create({
        data: {
          username,
          email,
          password,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Signup successfully",
        user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
