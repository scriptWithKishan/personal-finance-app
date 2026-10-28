import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth";
import { prisma } from "#/db";
import z from "zod";
import type { TransactionType } from "#/generated/prisma/enums";

export const getTransactionOfAccountFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(
		z.object({
			accId: z.string(),
		}),
	)
	.handler(async ({ data, context }) => {
		const { accId } = data;
		const { user } = context;

		const accountData = await prisma.account.findFirst({
			where: {
				id: accId,
				userId: user.id,
			},
		});

		const transactionData = await prisma.transaction.findMany({
			where: {
				accountId: accId,
			},
		});

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
		};
	});

export const addTransactionFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(
		(data: {
			name: string;
			amount: number;
			description: string;
			accountId: string;
			category: string;
			type: TransactionType;
		}) => data,
	)
	.handler(async ({ data, context }) => {
		const { name, amount, description, accountId, category, type } = data;
		const { user } = context;

		const accountData = await prisma.account.findFirst({
			where: {
				id: accountId,
				userId: user.id,
			},
		});

		if (!accountData) {
			throw new Error("Account not found");
		}

		const accountBalance = accountData?.balance.toNumber() || 0;
		const newBalance =
			type === "Credit" ? accountBalance + amount : accountBalance - amount;

		const transactionData = await prisma.transaction.create({
			data: {
				name,
				amount,
				description,
				accountId,
				category,
				type,
			},
		});

		await prisma.account.update({
			where: {
				id: accountId,
			},
			data: {
				balance: newBalance,
			},
		});

		return {
			transactionData: {
				...transactionData,
				amount: transactionData.amount.toNumber(),
			},
			newBalance,
		};
	});

export const getTransactionByIdFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(
		z.object({
			transactionId: z.string(),
		}),
	)
	.handler(async ({ data, context }) => {
		const { transactionId } = data;
		const { user } = context;

		const transaction = await prisma.transaction.findFirst({
			where: {
				id: transactionId,
				account: {
					userId: user.id,
				},
			},
			include: {
				account: true,
			},
		});

		if (!transaction) {
			throw new Error("Transaction not found");
		}

		return {
			...transaction,
			amount: transaction.amount.toNumber(),
			account: {
				...transaction.account,
				balance: transaction.account.balance.toNumber(),
			},
		};
	});

export const editTransactionFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(
		(data: {
			id: string;
			name: string;
			amount: number;
			description?: string;
			category: string;
			type: TransactionType;
		}) => data,
	)
	.handler(async ({ data, context }) => {
		const { id, name, amount, description, category, type } = data;
		const { user } = context;

		const existingTransaction = await prisma.transaction.findFirst({
			where: {
				id,
				account: {
					userId: user.id,
				},
			},
			include: {
				account: true,
			},
		});

		if (!existingTransaction) {
			throw new Error("Transaction not found");
		}

		const currentBalance = existingTransaction.account.balance.toNumber();
		const oldAmount = existingTransaction.amount.toNumber();
		const oldEffect =
			existingTransaction.type === "Credit" ? oldAmount : -oldAmount;
		const newEffect = type === "Credit" ? amount : -amount;
		const newBalance = currentBalance - oldEffect + newEffect;

		const [updatedTransaction] = await prisma.$transaction([
			prisma.transaction.update({
				where: { id },
				data: {
					name,
					amount,
					description: description ?? "",
					category,
					type,
				},
			}),
			prisma.account.update({
				where: { id: existingTransaction.accountId },
				data: {
					balance: newBalance,
				},
			}),
		]);

		return {
			transactionData: {
				...updatedTransaction,
				amount: updatedTransaction.amount.toNumber(),
			},
			newBalance,
		};
	});

export const deleteTransactionFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator((data: { id: string }) => data)
	.handler(async ({ data, context }) => {
		const { id } = data;
		const { user } = context;

		const existingTransaction = await prisma.transaction.findFirst({
			where: {
				id,
				account: {
					userId: user.id,
				},
			},
			include: {
				account: true,
			},
		});

		if (!existingTransaction) {
			throw new Error("Transaction not found");
		}

		const currentBalance = existingTransaction.account.balance.toNumber();
		const oldAmount = existingTransaction.amount.toNumber();
		const newBalance =
			existingTransaction.type === "Credit"
				? currentBalance - oldAmount
				: currentBalance + oldAmount;

		await prisma.$transaction([
			prisma.transaction.delete({
				where: { id },
			}),
			prisma.account.update({
				where: { id: existingTransaction.accountId },
				data: {
					balance: newBalance,
				},
			}),
		]);

		return {
			success: true,
			deletedId: id,
			newBalance,
		};
	});

