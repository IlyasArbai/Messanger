import { getUserSession } from "#src/utils/redis.js";
import { UserRepo } from "#src/user/repo.js";

export async function authenticate(req, res, next) {
  try {
    const sid = req.cookies?.sid;
    if (!sid)
      return res.json({
        success: false,
        error: "Authentication required",
      });

    const session = await getUserSession(sid);
    if (!session?.id) {
      res.clearCookie("sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.json({
        success: false,
        error: "Session expired or invalid",
      });
    }

    const user = await UserRepo.find(
      { id: session.id },
      { id: true, username: true },
    );

    if (!user)
      return res.json({
        success: false,
        error: "User not found",
      });

    req.user = user;
    req.sessionId = sid;

    next();
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
}
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success)
    return res.json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

  req.validated = {
    ...req.validated,
    ...result.data,
  };

  next();
};
