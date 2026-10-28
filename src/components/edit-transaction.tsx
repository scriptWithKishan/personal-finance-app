import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import z from "zod";
import Modal from "./modal";
import { Button } from "./ui/button";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { editTransactionFn } from "#/server/transaction";
import { Pencil } from "lucide-react";
import { cn } from "#/lib/utils";

const TRANSACTION_TYPES = ["Credit", "Debit"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

const editTransactionSchema = z.object({
	name: z.string().min(1, { message: "Enter valid name" }),
	description: z.string().optional(),
	category: z.string().min(1, { message: "Enter valid category" }),
	amount: z.number().positive({ message: "Enter positive value" }),
	type: z.enum(TRANSACTION_TYPES),
});

type EditTransactionFormValues = z.input<typeof editTransactionSchema>;

export interface EditTransactionItem {
	id: string;
	name: string;
	amount: number;
	type: string;
	category: string;
	description?: string | null;
	accountId?: string;
}

export interface EditTransactionProps {
	transaction: EditTransactionItem;
	className?: string;
	children?: React.ReactNode;
	onSuccess?: () => void;
}

interface EditTransactionFormProps {
	transaction: EditTransactionItem;
	onClose: () => void;
	onSuccess?: () => void;
}

function EditTransactionForm({
	transaction,
	onClose,
	onSuccess,
}: EditTransactionFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const initialType: TransactionType =
		transaction.type?.toLowerCase() === "debit" ? "Debit" : "Credit";

	const defaultValues: EditTransactionFormValues = {
		name: transaction.name ?? "",
		description: transaction.description ?? "",
		category: transaction.category ?? "",
		amount: Number(transaction.amount) || 0,
		type: initialType,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: editTransactionSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				setIsSubmitting(true);
				await editTransactionFn({
					data: {
						id: transaction.id,
						name: value.name,
						amount: Number(value.amount),
						description: value.description ?? "",
						category: value.category,
						type: value.type as TransactionType,
					},
				});
				onClose();
				onSuccess?.();
				await router.invalidate();
			} catch (error) {
				console.error("Failed to edit transaction:", error);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<form
			className="flex flex-col gap-4 mt-4"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<div className="flex items-center gap-2">
				<form.Field
					name="name"
					children={(field) => (
						<Field>
							<FieldLabel>Name</FieldLabel>
							<Input
								type="text"
								name={field.name}
								value={field.state.value}
								onChange={(e) => field.setValue(e.target.value)}
								placeholder="Enter transaction name"
							/>
							{field.state.meta.errors.length > 0 && (
								<FieldError>
									{field.state.meta.errors
										.map((e: unknown) =>
											typeof e === "object" && e && "message" in e
												? String((e as { message: unknown }).message)
												: String(e),
										)
										.join(", ")}
								</FieldError>
							)}
						</Field>
					)}
				/>
				<form.Field
					name="type"
					children={(field) => (
						<Field>
							<FieldLabel>Type</FieldLabel>
							<Select
								value={field.state.value}
								onValueChange={(val) =>
									field.handleChange(val as TransactionType)
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select transaction type" />
								</SelectTrigger>
								<SelectContent>
									{TRANSACTION_TYPES.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					)}
				/>
			</div>
			<form.Field
				name="description"
				children={(field) => (
					<Field>
						<FieldLabel>Description</FieldLabel>
						<Textarea
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.setValue(e.target.value)}
							placeholder="Enter transaction description"
						/>
						{field.state.meta.errors.length > 0 && (
							<FieldError>
								{field.state.meta.errors
									.map((e: unknown) =>
										typeof e === "object" && e && "message" in e
											? String((e as { message: unknown }).message)
											: String(e),
									)
									.join(", ")}
							</FieldError>
						)}
					</Field>
				)}
			/>
			<form.Field
				name="category"
				children={(field) => (
					<Field>
						<FieldLabel>Category</FieldLabel>
						<Input
							type="text"
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Enter transaction category"
						/>
						{field.state.meta.errors.length > 0 && (
							<FieldError>
								{field.state.meta.errors
									.map((e: unknown) =>
										typeof e === "object" && e && "message" in e
											? String((e as { message: unknown }).message)
											: String(e),
									)
									.join(", ")}
							</FieldError>
						)}
					</Field>
				)}
			/>
			<form.Field
				name="amount"
				children={(field) => (
					<Field>
						<FieldLabel>Amount</FieldLabel>
						<Input
							type="number"
							step="any"
							name={field.name}
							value={field.state.value}
							onChange={(e) =>
								field.handleChange(
									e.target.value === "" ? 0 : Number(e.target.value),
								)
							}
							placeholder="Enter transaction amount"
						/>
						{field.state.meta.errors.length > 0 && (
							<FieldError>
								{field.state.meta.errors
									.map((e: unknown) =>
										typeof e === "object" && e && "message" in e
											? String((e as { message: unknown }).message)
											: String(e),
									)
									.join(", ")}
							</FieldError>
						)}
					</Field>
				)}
			/>
			<div className="flex items-center justify-end gap-2 mt-4">
				<Button
					type="button"
					variant="outline"
					onClick={onClose}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : "Save Transaction"}
				</Button>
			</div>
		</form>
	);
}

export function EditTransaction({
	transaction,
	className,
	children,
	onSuccess,
}: EditTransactionProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{children ? (
				<span
					onClick={() => setIsOpen(true)}
					className="cursor-pointer inline-flex"
				>
					{children}
				</span>
			) : (
				<Button
					variant="ghost"
					size="icon-sm"
					type="button"
					onClick={() => setIsOpen(true)}
					aria-label="Edit transaction"
					className={cn("text-muted-foreground hover:text-foreground", className)}
				>
					<Pencil className="size-4" />
				</Button>
			)}

			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				title="Edit Transaction"
				className="w-200"
			>
				<EditTransactionForm
					transaction={transaction}
					onClose={() => setIsOpen(false)}
					onSuccess={onSuccess}
				/>
			</Modal>
		</>
	);
}

export default EditTransaction;
