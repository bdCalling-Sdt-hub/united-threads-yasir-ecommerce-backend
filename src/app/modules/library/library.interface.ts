export type TLibrary = {
  name?: string;
  image: string;
  description?: string;
  isDeleted?: boolean;
  status: TLibraryStatus;
  tags?: string[] | string;
};

export type TLibraryStatus = "PUBLIC" | "PRIVATE";
