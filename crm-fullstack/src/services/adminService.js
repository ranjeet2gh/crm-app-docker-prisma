
exports.updateUserRole = async (userId, role) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true },
  });
};
