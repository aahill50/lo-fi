import "isomorphic-fetch";
import sqip from "sqip";
import pino from "pino";
import {
  OPTION_DEFAULT_NUM_SHAPES,
  OPTION_DEFAULT_BLUR,
  TMP_FOLDER,
} from "./constants";
import { downloadImage } from "./utilities";

const logger = pino();

interface TransformOptions {
  fileName?: string;
  fileType?: string;
  numberOfShapes?: number;
  shapeType?: number;
  blurLevel?: number;
  bgColor?: string;
  workers?: number;
}

const getFileName = (url: string): string => {
  const { pathname } = new URL(url);
  const parts = pathname.split("/");
  let fileName = parts.pop();

  // Ignore trailing slashes
  while (!fileName?.length) {
    fileName = parts.pop();
  }

  return fileName;
};

export const getTmpImgPath = (url: string) =>
  `${TMP_FOLDER}/${getFileName(url)}`;

type Transformation =
  | (ReturnType<typeof sqip> & {
      fileName: string;
      fileSize: number;
      fileType: string;
    })
  | undefined;

export const transformImage = async (
  url: string,
  {
    numberOfShapes = OPTION_DEFAULT_NUM_SHAPES,
    blurLevel = OPTION_DEFAULT_BLUR,
  }: TransformOptions,
): Promise<Transformation> => {
  const child = logger.child({ url, process: "transformImage" });
  let errorMessage: string | undefined;
  const tmpPath = getTmpImgPath(url);
  const { error, fileType, fileSize } = await downloadImage(url, tmpPath);
  let result;

  if (error) {
    return Promise.reject(error);
  }

  try {
    result = sqip({
      filename: tmpPath,
      numberOfPrimitives: numberOfShapes,
      blur: blurLevel,
    });
  } catch (error) {
    errorMessage = `Unable to transform image`;
    child.error({ error }, errorMessage);
    return undefined;
  }

  return {
    ...result,
    fileName: getFileName(url),
    fileSize,
    fileType,
  };
};
