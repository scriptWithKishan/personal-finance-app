import { useSession } from "@tanstack/react-start/server";

type SessionData = {
  userId?: string,
  email?: string,
}

export function useAppSession() {
  return useSession<SessionData>({
    name: "app-session",
    password: process.env.SESSION_SECRET || "Your_Session_Secret",
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    }
  })
}