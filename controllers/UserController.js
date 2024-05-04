const Prisma = require("../prisma/PrismaClient");
const ErrorHandler = require("../utils/ErrorHandler");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

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

      // --- check the email is correct  
      if (!validator.isEmail(email)) {
        return next(new ErrorHandler("Invalid email", 400))
      }

      // ---- chack is user already in db
      const isUser = await Prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      // --- if exist
      if (isUser) {
       if(req.file){
        const file = req.file.filename;
        const filepath = path.join(__dirname, "../uploads", file);
        fs.unlink(filepath , (err)=>{
          if (err) {
            console.log(`Error in file deleting ${err}`);
          } else {
            console.log("file deleted successfuly");
          }
        })
       }
        return next(new ErrorHandler("User already exist", 400))
      }

      // -- check is profileimage in req 
      if(req.file){
        var profileImage = req.file.filename;
      }

      // -- hash password 
      const hashPassword = await bcrypt.hash(password, 10)

      const user = await Prisma.user.create({
        data: {
          username,
          email,
          password: hashPassword,
          profileImage
        },
      });

      return res.status(200).json({
        success: true,
        message: "Signup successfully",
        user,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 400))
    }
  },

  // ----  login user 
  LoginUser: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email) {
        return next(new ErrorHandler("Invalid email", 400))
      }
      if (!password) {
        return next(new ErrorHandler("Invalid password", 400))
      }

      // check user exist or not
      const isUser = await Prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      // if not exist
      if (!isUser) {
        return next(new ErrorHandler("Invalid Credentials", 400))
      }

      // check password
      const isPassword = await bcrypt.compare(password, isUser.password);

      // if not match
      if (!isPassword) {
        return next(new ErrorHandler("Invalid Credentials", 400))
      }

      // generate token
      const token = jwt.sign(
        {
          id: isUser.id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE,
        }
      );

      // return token
      return res.status(200).json({
        success: true,
        message: "Login successfully",
        isUser,
        token,
      });

    } catch (error) {
        next(new ErrorHandler(error.message, 400))
    }
  }
};
