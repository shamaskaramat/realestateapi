const Prisma = require("../prisma/PrismaClient");
const ErrorHanlder = require("../utils/ErrorHandler");

module.exports = {
  // ---- create property
  createProperty: async (req, res, next) => {
    try {
      const {
        type,
        status,
        price,
        rooms,
        beds,
        baths,
        area,
        description,
        address,
        zipCode,
        country,
        city,
        landmark,
      } = req.body;
      if (
        !type ||
        !status ||
        !rooms ||
        !beds ||
        !baths ||
        !price ||
        !area ||
        !description ||
        !address ||
        !zipCode ||
        !country ||
        !city ||
        !landmark
      ) {
        return res.status(400).json({
          success: false,
          message: "Plaese enter all fields",
        });
      }

      const user = await Prisma.user.findFirst({
        where: {
          id: req.user.id,
        },
      });
      // not of user if
      if (!user) {
        return next(new ErrorHanlder("Invalid token please login", 400));
      }

      const Price = parseInt(price);
      const Rooms = parseInt(rooms);
      const Beds = parseInt(beds);
      const Baths = parseInt(baths);
      const Area = parseInt(area);

      const createdProperty = await Prisma.property.create({
        data: {
          type,
          status,
          price: Price,
          rooms: Rooms,
          beds: Beds,
          baths: Baths,
          area: Area,
          description,
          address,
          zipCode,
          country,
          city,
          landmark,
          owner: req.user.id,
        },
      });
      // --- create the media array  now
      if (req.file) {
        const file = req.file.filename;
        var mediaArray = await Prisma.media.create({
          data: {
            images: file,
            property: createdProperty.id,
          },
        });
      }

      await Prisma.property.update({
        where: {
          id: createdProperty.id,
        },
        data: {
          images: {
            connect: { id: mediaArray.id },
          },
        },
      });

      await Prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          properties: {
            connect: { id: createdProperty.id },
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Property created successfully",
      });
    } catch (error) {
      next(new ErrorHanlder(error.message, 400));
    }
  },

  // --- get all properties

  GetProperties: async (req, res, next) => {
    try {
      const properties = await Prisma.property.findMany({
        include: {
          User: true,
          images: true,
        },
      });

      res.status(200).json({
        success: true,
        properties: properties,
      });
    } catch (error) {
      next(new ErrorHanlder(error.message, 400));
    }
  },
};
