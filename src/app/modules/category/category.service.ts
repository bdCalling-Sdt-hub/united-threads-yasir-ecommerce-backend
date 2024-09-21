import { TCategory } from "./category.interface";

const createCategoryIntoDb = async (payload: TCategory) => {
  console.log(payload);
};

const getAllCategoryFromDb = async () => {};

const updateCategoryIntoDb = async (categoryId:string,payload: Partial<TCategory>) => {
  console.log(payload);
};

const deleteCategoryIntoDb = async (id: string) => {
  console.log(id);
};

export const CategoryServices = {
  createCategoryIntoDb,
  getAllCategoryFromDb,
  updateCategoryIntoDb,
  deleteCategoryIntoDb,
};
