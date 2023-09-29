import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { transformImage } from "~/server/transform";
import { OPTION_DEFAULT_BLUR } from "~/server/constants";
import { getPrettySize } from "~/server/utilities";

type Transformation = Awaited<Promise<ReturnType<typeof transformImage>>>;

export const transformRouter = createTRPCRouter({
  transformImage: publicProcedure
    .input(
      z.object({
        url: z.string(),
        numberOfShapes: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { url, numberOfShapes } = input;
      let transformation: Transformation | undefined;
      let error = null;

      try {
        transformation = await transformImage(url, {
          numberOfShapes,
          shapeType: 0,
          blurLevel: OPTION_DEFAULT_BLUR,
        });
      } catch (err) {
        error = err?.toString();
        return { error };
      }

      if (!transformation) {
        error = "Server error: Unable to transform image";
        return { error };
      }

      return {
        fileName: transformation.fileName,
        svg: transformation.final_svg,
        origingalBytes: getPrettySize(Number(transformation.fileSize)),
        dimensions: transformation.img_dimensions ?? {
          height: null,
          width: null,
        },
      };
    }),
});
