const Prisma = require("../prisma/PrismaClient");

module.exports = {
  // / --- sign up the user
  CreateUser: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Plaese enter all field",
        });
      }

      // ---- chack is user already in db
      const isUser = await Prisma.user.findFirst({
        where: {
          email,
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
