const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    res.status(200).json({ message: "Get user successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: "Error getting user", error: error.message });
  }
}

module.exports = {
  getUserById,
};