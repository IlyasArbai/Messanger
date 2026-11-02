import { prisma } from "#src/utils/prisma.js";
import { BaseRepo } from "#src/utils/BaseRepo.js";

export class FriendRequestRepo extends BaseRepo {
  static get model() {
    return prisma.friendRequest;
  }
}
