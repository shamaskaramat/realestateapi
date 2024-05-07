const Prisma = require("../prisma/PrismaClient");
const ErrorHanlder = require("../utils/ErrorHandler");
const Path = require("path");
const fs = require("fs");

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
        addtitionalFeatures,
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

      // =============== media
      if (req.files && req.files.length > 0) {
        const mediaArray = [];
        for (const file of req.files) {
          const media = await Prisma.media.create({
            data: {
              images: file.filename,
              property: createdProperty.id,
            },
          });
          mediaArray.push(media);
        }

        await Prisma.property.update({
          where: {
            id: createdProperty.id,
          },
          data: {
            // Assuming 'images' is a relation field in your property model
            images: {
              connect: mediaArray.map((media) => ({ id: media.id })),
            },
          },
        });
      }

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

      console.log(req.body);

      // ----- add additionalfeatures
      if (addtitionalFeatures?.length > 0) {
        for (const feature of addtitionalFeatures) {
          const featureData = await Prisma.additionalfeatures.create({
            data: {
              name: feature,
              property_id: createdProperty.id,
            },
          });
          await Prisma.property.update({
            where: {
              id: createdProperty.id,
            },
            data: {
              additionalfeatures: {
                connect: { id: featureData.id },
              },
            },
          });
        }
      }

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
          additionalfeatures: true,
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

  // --- delete property
  deleteProperty: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        return next(new ErrorHanlder("Invalid Id", 400));
      }
      const property = await Prisma.property.findUnique({
        where: {
          id: parseInt(id),
        },
      });
      if (!property) {
        return next(new ErrorHanlder("Property not found", 400));
      }
      if (property.owner !== req.user.id) {
        return next(
          new ErrorHanlder(
            "You are not authorized to delete this property",
            400
          )
        );
      }
      // Find all media associated with the property
      const media = await Prisma.media.findMany({
        where: {
          property: parseInt(id),
        },
      });
      // Delete each media entry
      for (const mediaItem of media) {
        const filepath = Path.join(__dirname, "../uploads", mediaItem.images);
        fs.unlink(filepath, (err) => {
          if (err) {
            console.log(
              `Could not delete ${mediaItem.images} because ${err.message}`
            );
          } else {
            console.log(`Deleted ${mediaItem.images} successfully`);
          }
        });
        await Prisma.media.delete({
          where: {
            id: mediaItem.id,
          },
        });
      }


      // ---- delete the additionalfeatures 
      const Features = await Prisma.additionalfeatures.findMany({
        where :{
          property_id : parseInt(id)
        }
      });

      for (const feature of Features) {
        await Prisma.additionalfeatures.delete({
          where :{
            id : feature.id
          }
        })
      }





      // Delete the property
      await Prisma.property.delete({
        where: {
          id: parseInt(id),
        },
      });
      res.status(200).json({
        success: true,
        message: "Property and associated media deleted successfully",
      });
    } catch (error) {
      next(new ErrorHanlder(error.message, 400));
    }
  },

  // ---- get property by id
  GetPropertybyId: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        return next(new ErrorHanlder("Invalid property Id", 400));
      }
      const property = await Prisma.property.findFirst({
        where: {
          id: parseInt(id),
        },
        include: {
          User: true,
          images: true,
        },
      });
      if (!property) {
        return next(new ErrorHanlder("Property not found", 400));
      }

      res.status(200).json({
        success: true,
        property,
      });
    } catch (error) {
      next(new ErrorHanlder(error.message, 400));
    }
  },

  // --- add filtration
  FilterProperty: async (req, res, next) => {
    try {
      const {
        type,
        status,
        room,
        bed,
        bath,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
      } = req.body;
      if (!type) {
        return next(new ErrorHanlder("type is missing", 400));
      }
      if (!status) {
        return next(new ErrorHanlder("status is missing", 400));
      }
      if (!room) {
        return next(new ErrorHanlder("room is missing", 400));
      }
      if (!bed) {
        return next(new ErrorHanlder("bed is missing", 400));
      }
      if (!bath) {
        return next(new ErrorHanlder("bath is missing", 400));
      }
      if (!minPrice) {
        return next(new ErrorHanlder("minPrice is missing", 400));
      }
      if (!maxPrice) {
        return next(new ErrorHanlder("maxPrice is missing", 400));
      }
      if (!minArea) {
        return next(new ErrorHanlder("minArea is missing", 400));
      }
      if (!maxArea) {
        return next(new ErrorHanlder("maxArea is missing", 400));
      }

      const properties = await Prisma.property.findMany({
        where: {
          status: status,
          type: type,
          rooms: parseInt(room),
          beds: parseInt(bed),
          baths: parseInt(bath),
          area: {
            gte: parseInt(minArea),
            lte: parseInt(maxArea),
          },
          price: {
            gte: parseInt(minPrice),
            lte: parseInt(maxPrice),
          },
        },
      });

      res.status(200).json({
        success: true,
        properties,
      });
    } catch (error) {
      next(new ErrorHanlder(error.message, 400));
    }
  },
};
