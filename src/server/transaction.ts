import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth";
import { prisma } from "#/db";
import z from "zod";
import type { TransactionType } from "#/generated/prisma/enums";

export const getTransactionOfAccountFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({
    accId: z.string()
  }))
  .handler(async ({ data, context }) => {
    const { accId } = data
    const { user } = context

    const accountData = await prisma.account.findFirst({
      where: {
        id: accId,
        userId: user.id
      }
    })

    const transactionData = await prisma.transaction.findMany({
      where: {
        accountId: accId
      }
    })

    return {
      accountData: accountData
        ? {
            ...accountData,
            balance: accountData.balance.toNumber(),
          }
        : null,
      transactionData: transactionData.map((t) => ({
        ...t,
        amount: t.amount.toNumber(),
      })),
    }
  })

export const addTransactionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: { name: string, amount: number, description: string, accountId: string, category: string, type: TransactionType }) => data)
  .handler()