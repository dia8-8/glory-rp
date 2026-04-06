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
    async signIn({ account, profile }) {
      if (account?.provider === "discord") {
        const GUILD_ID = process.env.DISCORD_GUILD_ID!;
        const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

        type DiscordProfile = {
          id: string;
          username: string;
          avatar: string;
        };

        const p = profile as DiscordProfile;
        const discordId = p.id;

        try {
          const res = await fetch(
            `https://discord.com/api/guilds/${GUILD_ID}/members/${discordId}`,
            {
              headers: {
                Authorization: `Bot ${BOT_TOKEN}`,
              },
            }
          );

          if (res.status !== 200) {
            return "/invite";
          }
        } catch (err) {
          console.error("[AUTH ERROR]", err);
          return false;
        }
      }

      return true;
    },

    // ✅ NOW CORRECTLY PLACED
    async jwt({ token, account, profile }) {
      if (account?.provider === "discord" && profile) {
        const p = profile as any;

        token.id = p.id;
        token.name = p.username;
        token.image = p.avatar
          ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png`
          : undefined;
      }

      return token;
    },

    // ✅ NOW CORRECTLY PLACED
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.image = token.image;
      }

      return session;
    },
  },
  
};
