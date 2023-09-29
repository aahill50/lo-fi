// Client side utilities

import { partial } from "filesize";

const FILE_EXTENSION_MAX_LENGTH = 5;

export const getPrettySize = partial({ base: 2, standard: "jedec" });

export const replaceExtension = (fileName: string): string => {
  const nameParts = fileName.split(".");

  if (nameParts.length <= 1) return fileName;

  const restOfName = nameParts.slice(0, -1);
  const maybeExtension = nameParts[nameParts.length - 1];
  const hasFileExtension =
    (maybeExtension?.length ?? 0) <= FILE_EXTENSION_MAX_LENGTH;
  return hasFileExtension ? restOfName.join(".") : nameParts.join(".");
};
