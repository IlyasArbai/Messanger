import { prisma } from "#src/utils/prisma.js";
import { BaseRepo } from "#src/utils/BaseRepo.js";

export class ConversationRepo extends BaseRepo {
  static get model() {
    return prisma.conversation;
  }
}
