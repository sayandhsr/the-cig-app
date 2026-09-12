import { ClerkProvider } from '@clerk/clerk-react';

const CLERK_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

export function withClerk(Component) {
  return function WrappedComponent(props) {
    return (
      <ClerkProvider publishableKey={CLERK_KEY}>
        <Component {...props} />
      </ClerkProvider>
    );
  };
}
