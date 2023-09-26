import "isomorphic-fetch";
import {
  createWriteStream,
  readFileSync,
  WriteStream,
  statSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import pino from "pino";

import {
  OPTION_DEFAULT_NUM_SHAPES,
  OPTION_DEFAULT_BLUR,
  OPTION_DEFAULT_MODE,
} from "./constants";
import { createTmpFolder, getDimensions, removeTmpFolder } from "./utilities";

const logger = pino();

const supportedImageTypes = ["jpg", "jpeg", "png", "gif", "tiff"];

interface TransformOptions {
  fileName?: string;
  fileType?: string;
  numberOfShapes?: number;
  shapeType?: number;
  blurLevel?: number;
  bgColor?: string;
  workers?: number;
}

const _transformToSvg = ({
  fileName,
  tmpFolder,
  url,
  numberOfShapes,
  shapeType,
  blurLevel,
}: { tmpFolder: string; url: string } & TransformOptions): Promise<{
  svg: string;
  svgBytes: number;
}> => {
  const child = logger.child({ url, process: "transformIntoSvg" });
  const outputPath = `${tmpFolder}/output.svg`;
  const origPath = `${tmpFolder}/${fileName}`;
  const sqipCliArgs = [
    "./node_modules/sqip/src/cli.js",
    "-n",
    String(numberOfShapes),
    "-m",
    String(shapeType),
    "-b",
    String(blurLevel),
    "-o",
    outputPath,
    origPath,
  ];

  return new Promise((resolve, reject) => {
    let execFileStdOut;
    let readFileStdOut;
    let svg;
    let svgBytes;

    try {
      execFileStdOut = execFileSync("node", sqipCliArgs);

      try {
        readFileStdOut = readFileSync(outputPath, "utf8");
        const stat = statSync(outputPath);
        svgBytes = stat.size;

        svg = readFileStdOut
          .replace(
            /<feGaussianBlur stdDeviation=.* \/>/,
            `<feGaussianBlur stdDeviation="${blurLevel}" />`,
          )
          .replace(/\"/g, `'`);

        child.info({ svg }, "Generated svg");
      } catch (err) {
        child.error({ error: err }, "An error occurred while reading svg");
        child.error(readFileStdOut);
        return reject(err);
      }
    } catch (err) {
      child.error({ error: err }, "An error occurred while generating svg");
      child.error(execFileStdOut);
      return reject(err);
    }
    return resolve({ svg, svgBytes });
  });
};

export const transformImage = async (
  url: string,
  {
    numberOfShapes = OPTION_DEFAULT_NUM_SHAPES,
    shapeType = OPTION_DEFAULT_MODE,
    blurLevel = OPTION_DEFAULT_BLUR,
  }: TransformOptions,
): Promise<
  | {
      svg: string;
      svgBytes: number;
      originalBytes: number;
      dimensions: { height: number; width: number };
    }
  | undefined
> => {
  const child = logger.child({ url, process: "transformImage" });
  const { pathname } = new URL(url);
  const parts = pathname.split("/");
  let fileName = parts.pop();
  let errorMessage;
  let identifyIo;

  // Ignore trailing slash
  if (!fileName?.length) {
    fileName = parts.pop();
  }

  return new Promise(async (resolve, reject) => {
    try {
      const [res, tmpFolder] = await Promise.all([
        fetch(url),
        createTmpFolder(),
      ]);

      if (res.ok) {
        child.info("Fetched image");
      } else {
        if (!!res.json) {
          const { error } = await res.json();
          errorMessage = `${error.message} - ${error.localizedMessage}`;
        } else {
          errorMessage = "Failed to fetch image";
        }
        child.error({ status: res.status }, errorMessage);
        return reject(errorMessage);
      }

      if (!tmpFolder) {
        errorMessage = "Failed to create temp folder";
        child.error(errorMessage);
        return reject(errorMessage);
      }

      const origPath = `${tmpFolder}/${fileName}`;

      child.info({ originalPath: origPath }, "Writing tmp file");

      const tmpFile = createWriteStream(origPath);

      if (res?.body) {
        res.body.pipeTo(WriteStream.toWeb(tmpFile));
      } else {
        errorMessage = "Unable to parse body from fetch response";
        child.error(errorMessage);
        return reject(errorMessage);
      }

      tmpFile.on("error", (err) => {
        errorMessage = "An error occured while writing temp file";
        child.error({ error: err }, errorMessage);
        return reject(errorMessage);
      });

      tmpFile.on("close", async () => {
        const identifyCliArgs = ["identify", origPath];

        try {
          identifyIo = execFileSync("magick", identifyCliArgs);
        } catch (e) {
          errorMessage = "Unable to identify image file type";
          return reject(errorMessage);
        }

        const fileType = identifyIo?.toString().split(" ")[1]?.toLowerCase();

        if (!fileType) {
          errorMessage = `.${fileType} files are not supported. Unable to convert image.`;
          return reject(errorMessage);
        }

        if (!supportedImageTypes.includes(fileType)) {
          errorMessage = "Unable to identify image file type";
          return reject(errorMessage);
        }

        child.info("Finished writing temp file");
        child.info("Generating svg");
        const origFileSizeBytes = tmpFile.bytesWritten;

        const svgData = await _transformToSvg({
          fileName,
          tmpFolder,
          url,
          numberOfShapes,
          shapeType,
          blurLevel,
        });
        const dimensions = getDimensions(origPath);

        removeTmpFolder(tmpFolder);

        return resolve({
          svg: svgData.svg,
          svgBytes: svgData.svgBytes,
          originalBytes: origFileSizeBytes,
          dimensions,
        });
      });
    } catch (err) {
      errorMessage = "An error occured while attempting to transform image";
      child.error({ error: err, url }, errorMessage);
      return reject(errorMessage);
    }
  });
};