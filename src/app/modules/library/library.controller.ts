import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { LibraryServices } from "./library.service";

const createLibrary = catchAsync(async (req, res) => {
  const result = await LibraryServices.createLibraryIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Library created successfully",
    data: result,
  });
});

const getAllLibrary = catchAsync(async (req, res) => {
  const { libraries, meta } = await LibraryServices.getAllLibrariesFromDb(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Library fetched successfully",
    meta,
    data: libraries,
  });
});

const getSingleLibrary = catchAsync(async (req, res) => {
  const result = await LibraryServices.getSingleLibraryFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Library fetched successfully",
    data: result,
  });
});

const updateLibrary = catchAsync(async (req, res) => {
  const result = await LibraryServices.updateLibraryIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Library updated successfully",
    data: result,
  });
});

const deleteLibrary = catchAsync(async (req, res) => {
  const result = await LibraryServices.deleteLibraryFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Library deleted successfully",
    data: result,
  });
});

export const LibraryController = {
  createLibrary,
  getAllLibrary,
  getSingleLibrary,
  updateLibrary,
  deleteLibrary,
};
