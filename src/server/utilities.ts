import path from "path";
import { v4 as uuidv4 } from "uuid";
import { mkdirp } from "mkdirp";
import pino from "pino";
import sizeOf from "image-size";
import { rimraf } from "rimraf";

const MAX_RETRIES = 8;

const logger = pino();

export const createTmpFolder = async (retryCount = 0): Promise<string> => {
  let folder = path.resolve("/tmp/lo-fi/", `${uuidv4()}`);
  const child = logger.child({ folder });
  child.info("Attempting to create temp folder");

  if (retryCount > MAX_RETRIES) {
    child.error("Unable to create temp folder");
    folder = path.resolve("./tmp/lo-fi/tmp");
  }

  try {
    await mkdirp(folder);
    child.info("Successfully created temp folder");
    return folder;
  } catch {
    return await createTmpFolder(retryCount++);
  }
};

export const removeTmpFolder = (tmpFolder: string) => {
  const child = logger.child({ folder: tmpFolder });
  return rimraf(tmpFolder)
    .then(() => {
      child.info("Successfully deleted folder");
    })
    .catch((err: unknown) => {
      child.error("Error removing folder");
      child.error(err);
    });
};

// Mostly ripped from sqip
export const getDimensions = (filename: string) => {
  const res = sizeOf(filename);
  return {
    height: res.height ?? 0,
    width: res.width ?? 0,
  };
};

export const findLargerImageDimension = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => (width > height ? width : height);
