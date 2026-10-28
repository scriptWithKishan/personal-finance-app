import AddTransactionButton from "#/components/add-transaction-button";
import TransactionTable from "#/components/transaction-table";
import { getTransactionOfAccountFn } from "#/server/transaction";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/a/$accId/")({
	loader: async ({ params }) => {
		const accId = params.accId;

		const response = await getTransactionOfAccountFn({ data: { accId } });

		const { accountData, transactionData } = response;
		return { accountData, transactionData };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { accountData, transactionData } = Route.useLoaderData();

	return (
		<div className="p-8">
			<div className="flex flex-col items-center w-full">
				<h2 className="text-xl font-bold">
					{accountData?.name} :{" "}
					<span className="font-semibold">{accountData?.type}</span>
				</h2>
				<p className="font-semibold">Balance</p>
				<h2 className="text-4xl font-extrabold">{accountData?.balance}</h2>
			</div>
			<div className="mt-4 px-20">
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-bold">Transactions</h2>
					<AddTransactionButton accountId={accountData?.id} />
				</div>
				<TransactionTable
					transactionData={transactionData}
					accId={accountData?.id}
				/>
			</div>
		</div>
	);
}
