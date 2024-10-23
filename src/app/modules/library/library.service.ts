import QueryBuilder from "../../builder/QueryBuilder";
import { TLibrary } from "./library.interface";
import LibraryModel from "./library.model";

const createLibraryIntoDb = async (payload: TLibrary) => {
  const result = await LibraryModel.create(payload);
  return result;
};

const getAllLibrariesFromDb = async (query: Record<string, unknown>) => {
  const result = new QueryBuilder(LibraryModel.find(), query)
    .search(["name "])
    .filter()
    .fields()
    .paginate()
    .sort();

  const meta = await result.countTotal();
  const libraries = await result.modelQuery;

  return { libraries, meta };
};

const getSingleLibraryFromDb = async (id: string) => {
  const library = await LibraryModel.findById(id);
  return library;
};

const updateLibraryIntoDb = async (id: string, payload: TLibrary) => {
  const result = await LibraryModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteLibraryFromDb = async (id: string) => {
  const result = await LibraryModel.findByIdAndDelete(id);
  return result;
};

export const LibraryServices = {
  createLibraryIntoDb,
  getAllLibrariesFromDb,
  getSingleLibraryFromDb,
  updateLibraryIntoDb,
  deleteLibraryFromDb,
};
