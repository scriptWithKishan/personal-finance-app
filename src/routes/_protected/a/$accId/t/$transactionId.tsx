import { createFileRoute, Link } from "@tanstack/react-router";
import { getTransactionByIdFn } from "#/server/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Button } from "#/components/ui/button";
import { ArrowLeft, Calendar, Tag, Wallet } from "lucide-react";
import { cn } from "cn";

export const Route = createFileRoute("/_protected/a/$accId/t/$transactionId")({
	loader: async ({ params }) => {
		const { transactionId } = params;
		return await getTransactionByIdFn({ data: { transactionId } });
	},
	component: TransactionDetailComponent,
});

function TransactionDetailComponent() {
	const transaction = Route.useLoaderData();
	const { accId } = Route.useParams();

	const isCredit = transaction.type === "Credit";
	const formattedAmount = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(transaction.amount);

	const formattedDate = transaction.createdAt
		? new Date(transaction.createdAt).toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			})
		: "—";

	return (
		<div className="p-8 max-w-3xl mx-auto space-y-6">
			<div>
				<Button
					variant="ghost"
					size="sm"
					asChild
					className="gap-2 text-muted-foreground hover:text-foreground"
				>
					<Link to="/a/$accId" params={{ accId }}>
						<ArrowLeft className="size-4" />
						Back to {transaction.account?.name || "Account"}
					</Link>
				</Button>
			</div>

			<Card className="border border-border bg-card shadow-sm">
				<CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
					<div>
						<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Transaction Details
						</span>
						<CardTitle className="text-2xl font-bold mt-1">
							{transaction.name}
						</CardTitle>
					</div>
					<span
						className={cn(
							"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
							isCredit
								? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
								: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
						)}
					>
						{transaction.type}
					</span>
				</CardHeader>

				<CardContent className="pt-6 space-y-6">
					<div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl border border-border/50">
						<span className="text-sm font-medium text-muted-foreground">
							Amount
						</span>
						<span
							className={cn(
								"text-4xl font-extrabold font-mono mt-1",
								isCredit
									? "text-emerald-600 dark:text-emerald-400"
									: "text-foreground",
							)}
						>
							{isCredit ? `+${formattedAmount}` : `-${formattedAmount}`}
						</span>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-border/50">
							<Wallet className="size-5 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Account</p>
								<p className="text-sm font-semibold">
									{transaction.account?.name}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-border/50">
							<Tag className="size-5 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Category</p>
								<p className="text-sm font-semibold">{transaction.category}</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-border/50 md:col-span-2">
							<Calendar className="size-5 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Date & Time</p>
								<p className="text-sm font-semibold">{formattedDate}</p>
							</div>
						</div>
					</div>

					{transaction.description && (
						<div className="space-y-1.5 pt-2">
							<h4 className="text-sm font-semibold text-muted-foreground">
								Description
							</h4>
							<p className="text-sm bg-muted/20 p-3 rounded-lg border border-border/50">
								{transaction.description}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
