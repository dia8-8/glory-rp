import type { NextAuthOptions, DefaultSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

// --- Extend NextAuth types globally ---
declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string;
      image?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    image?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/signin', // tells NextAuth to use your app/signin/page.tsx
  },

  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email" } },

      profile(profile: any) {
        // ✅ Make sure image is undefined instead of null for type safety
        const image = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : undefined;

        return {
          id: profile.id as string,
          name: profile.username as string,
          image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const p = profile as Record<string, any>;
        token.id = p.id;
        token.name = p.username;
        token.image = p.avatar
          ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png`
          : undefined;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.image = token.image;
      }
      return session;
    },
  },
};
