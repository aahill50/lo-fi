import { transformRouter } from "~/server/api/routers/transform";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  transform: transformRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
