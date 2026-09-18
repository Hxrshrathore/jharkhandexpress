import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Admin Password",
      credentials: {
        password: { label: "Password", type: "password", placeholder: "••••••••" },
      },
      authorize: async (credentials) => {
        if (!credentials?.password) return null;
        if (credentials.password === process.env.ADMIN_PASSWORD) {
          return { id: "1", name: "Admin", email: "admin@jharkhandexpress.com" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      if (isOnAdmin) {
        if (nextUrl.pathname === '/admin/login') {
          if (isLoggedIn) return Response.redirect(new URL('/admin', nextUrl));
          return true;
        }
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
  },
});
