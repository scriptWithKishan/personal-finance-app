import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import Modal from "./modal";
import { Button } from "./ui/button";
import { deleteTransactionFn } from "#/server/transaction";
import { Trash2 } from "lucide-react";
import { cn } from "#/lib/utils";

export interface DeleteTransactionProps {
	transaction?: {
		id: string;
		name?: string;
		amount?: number;
	};
	transactionId?: string;
	transactionName?: string;
	className?: string;
	children?: React.ReactNode;
	onDeleted?: () => void;
}

export function DeleteTransaction({
	transaction,
	transactionId,
	transactionName,
	className,
	children,
	onDeleted,
}: DeleteTransactionProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const targetId = transaction?.id ?? transactionId;
	const targetName = transaction?.name ?? transactionName ?? "this transaction";

	const handleDelete = async () => {
		if (!targetId) return;

		try {
			setIsDeleting(true);
			await deleteTransactionFn({
				data: {
					id: targetId,
				},
			});
			setIsOpen(false);
			onDeleted?.();
			await router.invalidate();
		} catch (error) {
			console.error("Failed to delete transaction:", error);
		} finally {
			setIsDeleting(false);
		}
	};

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
					aria-label="Delete transaction"
					className={cn(
						"text-muted-foreground hover:text-destructive hover:bg-destructive/10",
						className,
					)}
				>
					<Trash2 className="size-4" />
				</Button>
			)}

			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				title="Delete Transaction"
				className="w-120"
			>
				<div className="flex flex-col gap-4 mt-4">
					<p className="text-sm text-muted-foreground">
						Are you sure you want to delete{" "}
						<span className="font-semibold text-foreground">
							"{targetName}"
						</span>
						? This action cannot be undone and will update your account balance.
					</p>

					<div className="flex items-center justify-end gap-2 mt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete Transaction"}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default DeleteTransaction;
