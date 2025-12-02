import { Request, Response, NextFunction } from "express";

export const checkLogin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.isLoggedIn) {
    return res.status(401).json({
      message: "You are not allowed to access this!",
    });
  }
  next();
};

export const checkLogout = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session && req.session.isLoggedIn) {
    return res.status(400).json({
      message: "You are already logged in!",
    });
  }
  next();
};
