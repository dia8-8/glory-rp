import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware() {},
  { pages: { signIn: '/signin' } }
);

export const config = {
  matcher: ['/jobs/:path*', '/apply/:path*'],
};
