 const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ApiResponse = require("../utils/apiResponse");
const { getIO } = require("../sockets");
 
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(ApiResponse.success("Users fetched successfully", users));
  } catch (err) {
    next(err);
  }
};
  
 const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString("en-IN", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json(ApiResponse.error("User not found", 404));

    const updated = await prisma.user.update({ where: { id }, data: { role } });
   const time= formatTimestamp(Date.now());
    const io = getIO();
    console.log("🔔 Emitting roleUpdated to", updated.id);

    io.emit("roleUpdated", {
         message: `${user.name} (${user.email})'s role has been updated to ${role} `,role, time, 
    });
    // io.to(updated.id).emit("roleUpdated", {
    //      message: `Your role has been updated to ${role}`,role,
    // });

    res.json(ApiResponse.success("User role updated successfully", updated));
  } catch (err) {
    next(err);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json(ApiResponse.error("User not found", 404));
    if (user.role === "ADMIN") return res.status(403).json(ApiResponse.error("Admin cannot be deleted", 403));

    await prisma.user.delete({ where: { id } });
    const time= formatTimestamp(Date.now());
    const io = getIO();
    console.log("🔔 Emitting userDeleted to all clients");
    io.emit("userDeleted", { message: `User ${user.name} (${user.email}) has been deleted`, userId: id,  time,  });

    res.json(ApiResponse.success("User deleted successfully", null, 200));
  } catch (err) {
    next(err);
  }
};


// Create user
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const profilePicture = req.file ? req.file.filename : null;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role || "USER",
        profilePicture,
      },
    });
    const time= Date.now() ;
     const io = getIO();
    console.log("🔔 Emitting user registered");

    io.emit("userRegistered", {
         message: `${name} (${email})'s role has been registered.`, time , 
    });
    res.json(ApiResponse.success("User created successfully", newUser, 201));
  } catch (err) {
    next(err);
  }
};
 
