"use client";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";

import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "../../components/ui/input";
import { listPaymentsFn } from "../../store/slices/payments/listPayments";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";

import clsx from "clsx";
import type { Payment } from "../../types/payment";

export const Payments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentsState = useSelector(
    (state: RootState) => state.listPaymentsSlice
  );
  const payments = paymentsState.data?.payments ?? [];

  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    dispatch(listPaymentsFn());
  }, [dispatch]);

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: (info) => <span>{info.getValue() as string}</span>,
    },
    {
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center gap-3">
            <img
              src={`${user.profilePhoto ?? ""}`}
              alt={user.full_name}
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
            <div>
              <p className="font-medium">{user.full_name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "user.role",
      header: "Role",
      cell: (info) => {
        const role = info.getValue() as string;
        return (
          <span
            className={clsx(
              "text-xs font-semibold px-2 py-1 rounded",
              role === "ADMIN"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            )}
          >
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "phone_Number",
      header: "Phone Number",
    },
    {
      accessorKey: "course.title",
      header: "Course",
      cell: (info) => (
        <span className="line-clamp-1 max-w-xs">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (info) => `$${info.getValue()}`,
    },
    {
      accessorKey: "currency",
      header: "Currency",
    },
    {
      accessorKey: "payment_method",
      header: "Method",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <span
            className={clsx(
              "text-xs font-semibold px-2 py-1 rounded",
              status === "PAID"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            )}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "transaction_date",
      header: "Date",
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      accessorKey: "isEnrolled",
      header: "Enroll Status",
      cell: (info) => {
        const isEnrolled = info.getValue() as boolean;
        return (
          <span
            className={clsx(
              "text-xs font-semibold px-2 py-1 rounded",
              isEnrolled === true
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            )}
          >
            {isEnrolled ? "Enrolled" : "Not_Enrolled"}
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data: payments,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-6 dark:bg-[#091025] min-h-screen w-full">
      <div className="flex items-center justify-between mb-6">
        <Input
          placeholder="Search payments..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full max-w-lg px-4 py-2 rounded-md border dark:border-gray-700 dark:bg-[#0f172a] dark:text-white shadow-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-[#0f172a]">
        <table className="min-w-full text-sm text-left text-gray-800 dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={clsx(
                      "px-4 py-3 font-semibold whitespace-nowrap border-b border-gray-200 dark:border-gray-700",
                      header.column.getCanSort() && "cursor-pointer select-none"
                    )}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() &&
                        ({
                          asc: <ChevronUp className="h-4 w-4" />,
                          desc: <ChevronDown className="h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ??
                          null)}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className={clsx(
                  "border-b dark:border-gray-700 transition-colors",
                  idx % 2 === 0
                    ? "bg-white dark:bg-[#0f172a]"
                    : "bg-gray-50 dark:bg-[#132033]",
                  "hover:bg-gray-100 dark:hover:bg-[#1a2b45]"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No payments found.
          </div>
        )}
      </div>
    </div>
  );
};
