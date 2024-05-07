const AdminVerify = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return res.status(400).json({
        success: false,
        message: `sorry ${req.user.role} cannot access this route`,
      });
    }
    next();
  };
};

module.exports = AdminVerify;
