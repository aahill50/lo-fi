import { OPTION_DEFAULT_NUM_SHAPES, OPTION_DEFAULT_MODE } from "./constants";
import { execFileSync } from "node:child_process";
import { findLargerImageDimension, getDimensions } from "./utilities";
import pino from "pino";

const logger = pino();

interface PrimitiveOptions {
  numberOfShapes: number;
  shapeType: number;
  bgColor: string;
  workers: number;
}

export const runPrimitive = (
  inputPath: string,
  outputPath: string,
  {
    numberOfShapes = OPTION_DEFAULT_NUM_SHAPES,
    shapeType = OPTION_DEFAULT_MODE,
  }: PrimitiveOptions,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const dimensions = getDimensions(inputPath);
    const child = logger.child({
      input: inputPath,
      output: outputPath,
    });

    const primitiveArgs = [
      "-i",
      inputPath,
      "-o",
      outputPath,
      "-n",
      String(numberOfShapes),
      "-m",
      String(shapeType),
      "-s",
      String(findLargerImageDimension(dimensions)),
    ];

    const magickArgs = [outputPath, "-delay", "1", outputPath];
    let primitiveStdout;
    let magickStdOut;

    try {
      primitiveStdout = execFileSync("primitive", primitiveArgs);

      try {
        magickStdOut = execFileSync("magick", magickArgs);
      } catch (err) {
        child.error(magickStdOut);
        return reject(err);
      }
    } catch (err) {
      child.error(primitiveStdout);
      return reject(err);
    }
    return resolve(outputPath);
  });
};
