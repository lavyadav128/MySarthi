function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Requires admin role" });
  next();
}

export default adminMiddleware;