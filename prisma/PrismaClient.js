const { PrismaClient } = require("@prisma/client");

const Prisma = new PrismaClient();

Prisma.$connect()
  .then(() => {
    console.log("Connection established");
  })
  .catch((err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
  });

module.exports = Prisma;
