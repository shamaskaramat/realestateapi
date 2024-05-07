const Prisma = require("../prisma/PrismaClient");
const ErrorHandler = require("../utils/ErrorHandler");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const sendMail = require("../utils/SendEmail");

module.exports = {
  // / --- sign up the user
  CreateUser: async (req, res, next) => {
    try {
      const { username, email, password, isSocialLogin } = req.body;
      if (!isSocialLogin) {
        return next(new ErrorHandler("isSocialLogin is required", 400));
      }
      // console.log(req.body)
      if (isSocialLogin == false || isSocialLogin === "false") {
        if (!username) {
          return next(new ErrorHandler("Invalid username", 400));
        }
        if (!email) {
          return next(new ErrorHandler("Invalid email", 400));
        }
        if (!password) {
          return next(new ErrorHandler("Invalid password", 400));
        }

        // --- check the email is correct
        if (!validator.isEmail(email)) {
          return next(new ErrorHandler("Invalid email", 400));
        }

        // ---- chack is user already in db
        const isUser = await Prisma.user.findFirst({
          where: {
            email: email,
          },
        });

        // --- if exist
        if (isUser) {
          if (req.file) {
            const file = req.file.filename;
            const filepath = path.join(__dirname, "../uploads", file);
            fs.unlink(filepath, (err) => {
              if (err) {
                console.log(`Error in file deleting ${err}`);
              } else {
                console.log("file deleted successfuly");
              }
            });
          }
          return next(new ErrorHandler("User already exist", 400));
        }

        // -- check is profileimage in req
        if (req.file) {
          var profileImage = req.file.filename;
        }

        // -- hash password
        const hashPassword = await bcrypt.hash(password, 10);

        const user = await Prisma.user.create({
          data: {
            username,
            email,
            password: hashPassword,
            profileImage,
          },
        });

        return res.status(200).json({
          success: true,
          message: "Signup successfully",
          user,
        });
      } else {
        if (!username) {
          return next(new ErrorHandler("Invalid username", 400));
        }
        if (!email) {
          return next(new ErrorHandler("Invalid email", 400));
        }

        // --- check the email is correct
        if (!validator.isEmail(email)) {
          return next(new ErrorHandler("Invalid email", 400));
        }

        // ---- chack is user already in db
        const isUser = await Prisma.user.findFirst({
          where: {
            email: email,
          },
        });

        // --- if exist
        if (isUser) {
          if (req.file) {
            const file = req.file.filename;
            const filepath = path.join(__dirname, "../uploads", file);
            fs.unlink(filepath, (err) => {
              if (err) {
                console.log(`Error in file deleting ${err}`);
              } else {
                console.log("file deleted successfuly");
              }
            });
          }
          return next(new ErrorHandler("User already exist", 400));
        }

        // -- check is profileimage in req
        if (req.file) {
          var profileImage = req.file.filename;
        }

        const user = await Prisma.user.create({
          data: {
            username,
            email,
            profileImage,
            isSocialLogin: true,
          },
        });

        // generate token
        const token = jwt.sign(
          {
            id: user.id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRE,
          }
        );

        return res.status(200).json({
          success: true,
          message: "Signup successfully",
          user,
          token,
          isSocialLogin: true,
        });
      }
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  },

  // ----  login user
  LoginUser: async (req, res, next) => {
    try {
      const { email, password, isSocialLogin } = req.body;
      if (isSocialLogin === false || isSocialLogin === "false") {
        if (!email) {
          return next(new ErrorHandler("Invalid email", 400));
        }
        if (!password) {
          return next(new ErrorHandler("Invalid password", 400));
        }

        // check user exist or not
        const isUser = await Prisma.user.findFirst({
          where: {
            email: email,
          },
        });

        // if not exist
        if (!isUser) {
          return next(new ErrorHandler("Invalid Credentials", 400));
        }
        if (isUser.isSocialLogin == true) {
          return next(
            new ErrorHandler("Plaese login with your socials acconts", 400)
          );
        }

        // check password
        const isPassword = await bcrypt.compare(password, isUser.password);

        // if not match
        if (!isPassword) {
          return next(new ErrorHandler("Invalid Credentials", 400));
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
      } else {
        if (!email) {
          return next(new ErrorHandler("Invalid email", 400));
        }

        // check user exist or not
        const isUser = await Prisma.user.findFirst({
          where: {
            email: email,
          },
        });

        // if not exist
        if (!isUser) {
          return next(new ErrorHandler("Invalid Credentials", 400));
        }

        if (isUser.isSocialLogin == false) {
          return next(
            new ErrorHandler("Plaese login with your email or password", 400)
          );
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
      }
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  },

  // -- verify user
  TokenVerify: async (req, res, next) => {
    try {
      const user = await Prisma.user.findFirst({
        where: {
          id: req.user.id,
        },
        include: {
          properties: true,
        },
      });

      // --- not of user
      if (!user) {
        return next(new ErrorHandler("Token is invalid", 400));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  },

  // --- update user profile
  updateProfile: async (req, res, next) => {
    try {
      const user = await Prisma.user.findFirst({
        where: {
          id: req.user.id,
        },
      });

      // --- not of user
      if (!user) {
        return next(new ErrorHandler("Token is invalid", 400));
      }

      if (req.body.username) {
        user.username = req.body.username;
      }

      if (req.body.email) {
        user.email = req.body.email;
      }

      if (req.file) {
        if (user?.profileImage) {
          const filepath = path.join(
            __dirname,
            "../uploads",
            user.profileImage
          );
          fs.unlink(filepath, async (err) => {
            if (err) {
              console.log(`Error in file deleting ${err}`);
            }
            console.log("File deleted successfully");
            const file = req.file.filename;
            const fileUrl = path.join(file);
            user.profileImage = fileUrl;
            const updatedUser = await Prisma.user.update({
              where: { id: user.id },
              data: user,
            });

            res.status(200).json({
              success: true,
              message: "User updated successfully",
              updatedUser,
            });
          });
        } else {
          const file = req.file.filename;
          user.profileImage = file;
          // await user.save();
          const updatedUser = await Prisma.user.update({
            where: { id: user.id },
            data: user,
          });

          res.status(200).json({
            success: true,
            message: "User updated successfully",
            updatedUser,
          });
        }
      } else {
        // --- if noe file in req
        // await user.save();
        const updatedUser = await Prisma.user.update({
          where: { id: user.id },
          data: user,
        });
        res.status(200).json({
          success: true,
          message: "User updated successfully",
          updatedUser,
        });
      }
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  },

  //forget password
  ForgetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        return next(new ErrorHandler("Invalid email", 400));
      }
      const user = await Prisma.user.findFirst({
        where: {
          email: email,
        },
      });
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      const OTP = Math.floor(Math.random() * 900 + 1000);
      try {
        await sendMail({
          email: user.email,
          subject: "Password Reset",
          message: `Hello ${user?.username} Your OTP is ${OTP} Plaese Verify`,
        });
        console.log(user);
        user.OTP = OTP;
        await Prisma.user.update({
          where: {
            id: user.id,
          },
          data: user,
        });
        res.status(200).json({
          success: true,
          message: "OTP send successfully please verify ",
        });
      } catch (error) {
        next(new ErrorHandler(error.message, 400));
      }
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  },
  // New function to set a new password after OTP verification
  SetNewPassword: async (req, res, next) => {
    try {
      const { OTP, Password } = req.body;
      const otpValue = parseInt(OTP);
      if (!OTP || !Password) {
        return next(new ErrorHandler("Invalid data provided", 400));
      }
      // Check if user exists with the provided email and OTP
      const user = await Prisma.user.findFirst({
        where: {
          OTP: otpValue,
        },
      });

      if (!user) {
        return next(new ErrorHandler("Invalid OTP", 400));
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(Password, 10);

      // Update user's password and clear the OTP
      await Prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
          OTP: null,
        },
      });

      res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  },

  // -- update user role  --Admin

  updateUserRole: async (req, res, next) => {
    try {
      const { role } = req.body;
      const { id } = req.params;
      if (!id) {
        return next(new ErrorHandler(`Id is not defined`, 400));
      }
      if (!role) {
        return next(new ErrorHandler("role not found", 400));
      }

      const user = await Prisma.user.findFirst({
        where: {
          id: parseInt(id),
        },
      });

      if (!user) {
        return next(new ErrorHandler("user not found", 400));
      }

      user.role = role;

      const updatedUser = await Prisma.user.update({
        where: {
          id: parseInt(id),
        },
        data: user,
      });

      res.status(200).json({
        success: true,
        message: "Role updated successfully",
        updatedUser,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  },

  // get all rusers
  getAllUsers: async (req, res, next) => {
    try {
      const users = await Prisma.user.findMany();
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  },

  // --- find by id

  findUserById: async (req, res, next) => {
    try {
      const { userId } = req.params;
      // Check if the user exists
      const user = await Prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: {
          properties: {
            include: {
              images: true,
              additionalfeatures: true,
            },
          },
        },
      });
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  },
};
