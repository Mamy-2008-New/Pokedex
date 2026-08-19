import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Token manquant" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId ?? payload?.id ?? null;
    if (!req.userId) return res.status(401).json({ error: "Token invalide" });
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token invalide" });
  }
}
