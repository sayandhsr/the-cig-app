import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

const isProtectedRoute = createRouteMatcher([
  '/community(.*)',
  '/debates(.*)',
  '/global-chat(.*)',
  '/spot-chat(.*)',
]);

export const onRequest = clerkMiddleware((auth, context) => {
  if (isProtectedRoute(context.request)) {
    auth().protect();
  }
});
