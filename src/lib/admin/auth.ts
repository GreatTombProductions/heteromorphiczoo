import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ADMIN_EMAILS = [
  "ray.heberer@greattombproductions.com",
  "rayheb3@gmail.com",
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return user.email ? ADMIN_EMAILS.includes(user.email) : false;
    },
    async jwt({ token, account }) {
      if (account) {
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).id_token = token.id_token;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});
