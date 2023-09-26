import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { transformImage } from "~/server/transform";
import { partial } from "filesize";
import { OPTION_DEFAULT_BLUR } from "~/server/constants";
const getPrettySize = partial({ base: 2, standard: "jedec" });

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
      const urlParts = url.split("/");
      let fileType;

      if (urlParts[0] === "data:image") {
        fileType = urlParts[1]?.split(";")[0];
      } else {
        fileType = urlParts[urlParts.length - 1]?.split(".")[1];
      }

      let transformation;
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

      return {
        svg: transformation?.svg,
        svgBytes: getPrettySize(Number(transformation?.svgBytes)),
        origingalBytes: getPrettySize(Number(transformation?.originalBytes)),
        dimensions: transformation?.dimensions || { height: null, width: null },
      };
    }),
});
