import "dotenv/config";
import { createClient } from "redis";

const sessionTtl = 3600 * 24 * 7;
const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});
client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export async function connectRedis() {
  if (!client.isOpen) await client.connect();
}

export async function rateLimiter(req, res, next) {
  try {
    const key = `messanger:rate_limit:${req.ip}`;
    const count = await client.incr(key);

    if (count === 1) await client.expire(key, 60);
    if (count > 20)
      return res.json({
        success: false,
        message: "Too many requests",
      });

    next();
  } catch (error) {
    next(error);
  }
}

export async function createUserSession(sid, user) {
  const sessionKey = `messanger:session:${sid}`;
  await client.hSet(sessionKey, {
    id: user.id,
    username: user.username,
  });
  await client.expire(sessionKey, sessionTtl);

  return true;
}
export async function getUserSession(sid) {
  const sessionKey = `messanger:session:${sid}`;
  const data = await client.hGetAll(sessionKey);

  if (!data || Object.keys(data).length === 0) return null;
  await client.expire(sessionKey, sessionTtl);

  return {
    id: Number(data.id),
    username: data.username,
  };
}
export async function deleteUserSession(sid) {
  const deleted = await client.del(`messanger:session:${sid}`);
  return deleted > 0;
}
export async function deleteOtherUserSessions(userId, currentSid) {
  for await (const key of client.scanIterator({
    MATCH: "messanger:session:*",
  })) {
    if (key === `messanger:session:${currentSid}`) continue;

    const id = await client.hGet(key, "id");

    if (id === String(userId)) {
      await client.del(key);
    }
  }
}
