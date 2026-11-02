export class BaseRepo {
  static get model() {
    throw new Error("You must define a Prisma model in your repository");
  }

  static all(args = {}) {
    return this.model.findMany(args);
  }

  static find(where, select) {
    return this.model.findUnique({
      where,
      select,
    });
  }

  static create(data, select = null) {
    return this.model.create({
      data,
      select,
    });
  }

  static update(id, data, select = null) {
    return this.model.update({
      where: { id },
      data,
      select,
    });
  }

  static updateMany(where, data) {
    return this.model.updateMany({
      where,
      data,
    });
  }

  static delete(id) {
    return this.model.delete({
      where: { id },
    });
  }
}
