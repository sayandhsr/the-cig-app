import { clerkMiddleware } from '@clerk/astro/server';

const protectedRoutes = ['/community', '/debates', '/global-chat', '/spot-chat'];

export const onRequest = clerkMiddleware((auth, context) => {
  const url = new URL(context.request.url);
  const isProtected = protectedRoutes.some(route => url.pathname.startsWith(route));
  
  if (isProtected) {
    auth().protect();
  }
});
