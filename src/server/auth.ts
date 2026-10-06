import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";

import bcrypt from "bcryptjs";
import { useAppSession } from "#/utils/session";

export const signupFn = createServerFn({ method: "POST" })
  .validator((data: { name: string, email: string, password: string }) => data)
  .handler(async ({ data }) => {
    const { name, email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      return { error: "User already exist!" }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })

    return { message: "User created successfully!"}
  })

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { email: string, password: string }) => data)
  .handler(async ({ data }) => {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      }
    })

    if (!user) {
      return { error: "Invalid credentials" }
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return { error: "Invalid credentials" }
    }

    const session = await useAppSession();
    await session.update({
      userId: user.id,
      email,
    })
  })

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession();
    const email = session.data.email;

    if (!email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })
    return user ? { id: user.id, email: user.email } : null
  },
)

export const logoutFn = createServerFn({ method: 'POST' }).handler(async() => {
  const session = await useAppSession();
  session.clear();
})