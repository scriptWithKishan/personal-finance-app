import { prisma } from "#/db";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "#/server/auth";
import type { AccountType } from "#/generated/prisma/enums";

export const getAccountFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user } = context;

    const accountData = await prisma.account.findMany({
      where: {
        userId: user.id
      }
    })

    return accountData.map((account) => ({
      ...account,
      balance: account.balance.toNumber(),
    }))
  })

export const addAccountFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: { name: string, type: AccountType, balance: number }) => data)
  .handler(async ({ data, context }) => {
    const { name, type, balance } = data;
    const { user } = context;

    const newAccount = await prisma.account.create({
      data: {
        name, 
        type,
        balance,
        userId: user.id,
      }
    })

    return {
      ...newAccount,
      balance: newAccount.balance.toNumber(),
    }
  })

export const deleteAccountFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const account = await prisma.account.findUnique({
      where: { id: data.id }
    })

    if (!account) return { error: "Account not found!" }

    await prisma.account.delete({
      where: { id: data.id }
    })

    return { success: "Account deleted successfully!" }
  })
