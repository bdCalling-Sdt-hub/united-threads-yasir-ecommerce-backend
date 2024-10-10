import moment from "moment";
import { FilterQuery, Query } from "mongoose";

//class QueryBuilder<T> {
//  public modelQuery: Query<T[], T>;
//  public query: Record<string, unknown>;

//  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
//    this.modelQuery = modelQuery;
//    this.query = query;
//  }

//  search(searchableField: string[]) {
//    const searchTerm = this.query?.searchTerm;
//    if (searchTerm) {
//      this.modelQuery = this.modelQuery.find({
//        $or: searchableField.map(
//          (field) =>
//            ({
//              [field]: { $regex: searchTerm, $options: "i" },
//            }) as FilterQuery<T>,
//        ),
//      });
//    }
//    return this;
//  }

//  filter() {
//    const queryObj = { ...this.query };
//    const excludeFields = ["searchTerm", "sort", "limit", "page", "fields"];
//    excludeFields.forEach((element) => {
//      delete queryObj[element];
//    });

//    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
//    return this;
//  }

//  sort() {
//    const sort = (this.query?.sort as string)?.split(",")?.join(" ") || "-createdAt";
//    this.modelQuery = this.modelQuery.sort(sort as string);
//    return this;
//  }

//  paginate() {
//    const limit = Number(this.query?.limit) || 10;
//    const page = Number(this.query?.page) || 1;
//    const skip = (page - 1) * limit;

//    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
//    return this;
//  }
//  fields() {
//    const fields = (this.query?.fields as string)?.split(",")?.join(" ") || "-__v";
//    this.modelQuery = this.modelQuery.select(fields);
//    return this;
//  }

//  async countTotal() {
//    //const totalQuery = this.modelQuery.getFilter();
//    const total = await this.modelQuery.model.countDocuments();
//    const limit = Number(this.query?.limit) || 10;
//    const page = Number(this.query?.page) || 1;
//    const totalPage = Math.ceil(total / limit);

//    return {
//      total,
//      limit,
//      page,
//      totalPage,
//    };
//  }
//}
//export default QueryBuilder;

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableField: string[]) {
    const searchTerm = this.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableField.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: "i" },
            }) as FilterQuery<T>,
        ),
      });
    }
    return this;
  }

  createdAtRangeFilter<K extends keyof T>(field: K, createdAt?: string | null | undefined) {
    if (createdAt) {
      const startOfDay = moment(createdAt).startOf("day").toDate();

      const endOfDay = moment(createdAt).endOf("day").toDate();

      this.modelQuery = this.modelQuery.find({
        [field]: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ["searchTerm", "sort", "limit", "page", "fields"];
    excludeFields.forEach((element) => {
      delete queryObj[element];
    });

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  sort() {
    const sort = (this.query?.sort as string)?.split(",")?.join(" ") || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort as string);
    return this;
  }

  paginate() {
    const limit = Number(this.query?.limit) || 10;
    const page = Number(this.query?.page) || 1;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }
  fields() {
    const fields = (this.query?.fields as string)?.split(",")?.join(" ") || "-__v";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQuery = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQuery);
    const limit = Number(this.query?.limit) || 10;
    const page = Number(this.query?.page) || 1;
    const totalPage = Math.ceil(total / limit);

    return {
      total,
      limit,
      page,
      totalPage,
    };
  }
}
export default QueryBuilder;
