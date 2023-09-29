// Server side utilities

import pino from "pino";
import { writeFile } from "node:fs/promises";

const logger = pino();

export { getPrettySize } from "~/pages/utilities";

export const downloadImage = async (
  url: string,
  filePath: string,
): Promise<{
  error: string | null;
  fileSize: number;
  fileType: string;
  success: boolean;
}> => {
  const child = logger.child({ process: "downloadImage" });
  const chunks: Uint8Array[] = [];
  let fileSize = 0;
  let fileType = "";
  let errorMessage: string | null = null;
  let success = true;

  try {
    const res = await fetch(url);
    fileSize = Number(res.headers.get("content-length"));
    fileType = res.headers.get("content-type") ?? "";

    if (res?.body) {
      for await (const chunk of res?.body) {
        chunks.push(chunk);
      }
    }
  } catch (error) {
    errorMessage = "Unable to download image";
    child.error({ error }, errorMessage);
    success = false;
  }

  try {
    await writeFile(filePath, chunks);
  } catch (error) {
    errorMessage = "Unable to copy file";
    child.error({ error }, errorMessage);
    success = false;
  }

  return {
    error: errorMessage,
    fileSize,
    fileType,
    success,
  };
};
