import { UserRepo } from "./repo.js";

export class UserController {
  static async search(req, res) {
    try {
      const { q } = req.validated.query;
      const users = await UserRepo.all({
        where: {
          username: {
            contains: q,
            mode: "insensitive",
          },
          id: {
            not: req.user.id,
          },
        },
        select: {
          id: true,
          username: true,
        },
      });

      return res.json({ success: true, users });
    } catch (err) {
      console.error(err);
      return res.json({
        success: false,
        message: "Failed to search users",
      });
    }
  }

  static async check(req, res) {
    try {
      const { username } = req.validated.body;
      if (
        await UserRepo.find(
          {
            username,
          },
          {
            id: true,
          },
        )
      )
        return res.json({ success: true, available: false });

      return res.json({ success: true, available: true });
    } catch (err) {
      console.error(err);
      return res.json({
        success: false,
        message: "Failed to check username",
      });
    }
  }
}
