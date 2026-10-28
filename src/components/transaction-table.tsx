import { rankItem } from "@tanstack/match-sorter-utils";
import {
	columnFilteringFeature,
	createColumnHelper,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	type FilterFn,
	filterFn_includesString,
	globalFilteringFeature,
	type PaginationState,
	rowPaginationFeature,
	rowSortingFeature,
	type SortingState,
	sortFn_alphanumeric,
	sortFn_basic,
	type TableFeatures,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { cn } from "cn";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Receipt,
	RotateCcw,
	Search,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Link } from "@tanstack/react-router";
import { EditTransaction } from "./edit-transaction";
import { DeleteTransaction } from "./delete-transaction";

export interface TransactionItem {
	id: string;
	name: string;
	amount: number;
	type: string;
	category: string;
	description?: string | null;
	accountId?: string;
	createdAt?: Date | string;
	date?: string;
	updatedAt?: Date | string;
}

export type TransactionTableProps = TransactionItem;

export interface TransactionTableComponentProps {
	transactionData?: TransactionItem[];
	accId?: string;
}

const EMPTY_DATA: TransactionItem[] = [];

// Custom fuzzy filter function leveraging @tanstack/match-sorter-utils
const fuzzyFilter: FilterFn<TableFeatures, TransactionItem> = (
	row,
	columnId,
	value,
	addMeta,
) => {
	const rawValue = row.getValue(columnId);
	if (rawValue == null) return false;

	const filterString = String(value).trim();
	if (!filterString) return true;

	let itemRank = rankItem(String(rawValue), filterString);

	// If testing amount, also match formatted currency string ($1,234.56)
	if (
		!itemRank.passed &&
		columnId === "amount" &&
		typeof rawValue === "number"
	) {
		const formatted = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(rawValue);
		itemRank = rankItem(formatted, filterString);
	}

	addMeta?.({ itemRank });
	return itemRank.passed;
};

// V9 explicit features registry
const features = tableFeatures({
	columnFilteringFeature,
	globalFilteringFeature,
	filteredRowModel: createFilteredRowModel(),
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	rowPaginationFeature,
	paginatedRowModel: createPaginatedRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		basic: sortFn_basic,
	},
	filterFns: {
		fuzzy: fuzzyFilter,
		includesString: filterFn_includesString,
	},
});

const columnHelper = createColumnHelper<typeof features, TransactionItem>();

export const TransactionTable = ({
	transactionData = EMPTY_DATA,
	accId,
}: TransactionTableComponentProps) => {
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const columns = useMemo(
		() =>
			columnHelper.columns([
				columnHelper.accessor(
					(row) => {
						const rawDate = row.createdAt ?? row.date;
						if (!rawDate) return "";
						const d = new Date(rawDate);
						return Number.isNaN(d.getTime())
							? String(rawDate)
							: d.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								});
					},
					{
						id: "date",
						header: "Date",
						sortFn: (rowA, rowB) => {
							const timeA = new Date(
								rowA.original.createdAt ?? rowA.original.date ?? 0,
							).getTime();
							const timeB = new Date(
								rowB.original.createdAt ?? rowB.original.date ?? 0,
							).getTime();
							return timeA - timeB;
						},
						cell: (info) => (
							<span className="font-medium text-xs text-muted-foreground whitespace-nowrap">
								{info.getValue() || "—"}
							</span>
						),
					},
				),
				columnHelper.accessor("name", {
					header: "Transaction",
					sortFn: "alphanumeric",
					cell: (info) => {
						const targetAccId = info.row.original.accountId ?? accId;
						return (
							<div className="flex flex-col">
								{targetAccId ? (
									<Link
										to="/a/$accId/t/$transactionId"
										params={{
											accId: targetAccId,
											transactionId: info.row.original.id,
										}}
										className="hover:underline"
									>
										<span className="font-semibold text-foreground text-sm">
											{info.getValue()}
										</span>
									</Link>
								) : (
									<span className="font-semibold text-foreground text-sm">
										{info.getValue()}
									</span>
								)}
							</div>
						);
					},
				}),
				columnHelper.accessor("category", {
					header: "Category",
					sortFn: "alphanumeric",
					cell: (info) => (
						<span className="inline-flex items-center rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground">
							{info.getValue()}
						</span>
					),
				}),
				columnHelper.accessor("type", {
					header: "Type",
					sortFn: "alphanumeric",
					cell: (info) => {
						const isCredit =
							info.getValue()?.toString().toLowerCase() === "credit";
						return (
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
									isCredit
										? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
										: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
								)}
							>
								{info.getValue()}
							</span>
						);
					},
				}),
				columnHelper.accessor("amount", {
					header: "Amount",
					sortFn: "basic",
					cell: (info) => {
						const amount = info.getValue();
						const isCredit =
							info.row.original.type?.toString().toLowerCase() === "credit";
						const formatted = new Intl.NumberFormat("en-US", {
							style: "currency",
							currency: "USD",
						}).format(amount);

						return (
							<span
								className={cn(
									"font-mono font-semibold text-sm",
									isCredit
										? "text-emerald-600 dark:text-emerald-400"
										: "text-foreground",
								)}
							>
								{isCredit ? `+${formatted}` : `-${formatted}`}
							</span>
						);
					},
				}),
				columnHelper.display({
					id: "actions",
					header: () => <span className="sr-only">Actions</span>,
					cell: (info) => (
						<div className="flex items-center justify-end gap-1">
							<EditTransaction transaction={info.row.original} />
							<DeleteTransaction transaction={info.row.original} />
						</div>
					),
					enableSorting: false,
					enableGlobalFilter: false,
				}),
			]),
		[accId],
	);

	const table = useTable({
		features,
		columns,
		data: transactionData ?? EMPTY_DATA,
		state: {
			sorting,
			globalFilter,
			pagination,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		globalFilterFn: "fuzzy",
	});

	const totalRows = transactionData?.length ?? 0;
	const filteredRows = table.getFilteredRowModel().rows.length;
	const isFiltered = globalFilter.trim().length > 0;
	const hasSorting = sorting.length > 0;

	const handleClearFilters = () => {
		setGlobalFilter("");
		setSorting([]);
	};

	return (
		<div className="w-full space-y-4">
			{/* Table Toolbar: Global search & filter controls */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
					<Input
						placeholder="Search all transactions..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-9 pr-9"
					/>
					{globalFilter ? (
						<button
							type="button"
							onClick={() => setGlobalFilter("")}
							className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Clear search"
						>
							<X className="size-4" />
						</button>
					) : null}
				</div>

				<div className="flex items-center gap-2 self-end sm:self-auto">
					{(isFiltered || hasSorting) && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleClearFilters}
							className="text-xs text-muted-foreground hover:text-foreground h-9 gap-1.5"
						>
							<RotateCcw className="size-3.5" />
							Reset filters
						</Button>
					)}

					<span className="text-xs text-muted-foreground">
						{isFiltered
							? `Showing ${filteredRows} of ${totalRows} results`
							: `${totalRows} ${totalRows === 1 ? "transaction" : "transactions"}`}
					</span>
				</div>
			</div>

			{/* Table Container */}
			<div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left text-sm">
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr
									key={headerGroup.id}
									className="border-b border-border bg-muted/40 transition-colors"
								>
									{headerGroup.headers.map((header) => {
										const isSorted = header.column.getIsSorted();
										const canSort = header.column.getCanSort();

										return (
											<th
												key={header.id}
												scope="col"
												className="py-3 px-4 font-semibold text-xs tracking-wider uppercase text-muted-foreground"
											>
												{header.isPlaceholder ? null : canSort ? (
													<button
														type="button"
														onClick={header.column.getToggleSortingHandler()}
														className={cn(
															"group flex items-center gap-1.5 transition-colors focus-visible:outline-none cursor-pointer select-none hover:text-foreground",
															isSorted && "text-foreground font-bold",
														)}
													>
														<span>
															<table.FlexRender header={header} />
														</span>
														<span className="shrink-0">
															{isSorted === "asc" ? (
																<ArrowUp className="size-3.5 text-primary" />
															) : isSorted === "desc" ? (
																<ArrowDown className="size-3.5 text-primary" />
															) : (
																<ArrowUpDown className="size-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
															)}
														</span>
													</button>
												) : (
													<div
														className={
															header.id === "actions" ? "text-right" : undefined
														}
													>
														<table.FlexRender header={header} />
													</div>
												)}
											</th>
										);
									})}
								</tr>
							))}
						</thead>

						<tbody className="divide-y divide-border">
							{table.getRowModel().rows.length === 0 ? (
								<tr>
									<td
										colSpan={columns.length}
										className="h-36 text-center text-muted-foreground"
									>
										<div className="flex flex-col items-center justify-center gap-2">
											<Receipt className="size-8 text-muted-foreground/50" />
											<p className="text-sm font-medium">
												No transactions found
											</p>
											{isFiltered ? (
												<p className="text-xs text-muted-foreground">
													No transactions match "{globalFilter}". Try a
													different keyword or{" "}
													<button
														type="button"
														onClick={() => setGlobalFilter("")}
														className="text-primary hover:underline font-medium"
													>
														clear the search
													</button>
													.
												</p>
											) : (
												<p className="text-xs text-muted-foreground">
													Add your first transaction above to populate this
													account.
												</p>
											)}
										</div>
									</td>
								</tr>
							) : (
								table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="hover:bg-muted/30 transition-colors"
									>
										{row.getAllCells().map((cell) => (
											<td key={cell.id} className="py-3 px-4 align-middle">
												<table.FlexRender cell={cell} />
											</td>
										))}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Table Footer: Pagination controls */}
				{totalRows > 0 && (
					<div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/20 text-xs text-muted-foreground">
						<div>
							Page {table.state.pagination.pageIndex + 1} of{" "}
							{Math.max(1, table.getPageCount())}
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
								className="h-8 w-8 p-0"
								aria-label="Previous page"
							>
								<ChevronLeft className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
								className="h-8 w-8 p-0"
								aria-label="Next page"
							>
								<ChevronRight className="size-4" />
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default TransactionTable;
