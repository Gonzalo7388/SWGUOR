"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TalleresSkeleton() {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="w-[250px]"><div className="h-4 w-20 bg-gray-200 animate-pulse rounded" /></TableHead>
            <TableHead><div className="h-4 w-24 bg-gray-200 animate-pulse rounded" /></TableHead>
            <TableHead><div className="h-4 w-24 bg-gray-200 animate-pulse rounded" /></TableHead>
            <TableHead><div className="h-4 w-16 bg-gray-200 animate-pulse rounded" /></TableHead>
            <TableHead className="text-right"><div className="h-4 w-10 bg-gray-200 animate-pulse rounded ml-auto" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i} className="hover:none">
              <TableCell>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-100 animate-pulse rounded" />
                  <div className="h-3 w-20 bg-gray-50 animate-pulse rounded" />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-gray-100 animate-pulse rounded" />
                  <div className="h-3 w-32 bg-gray-50 animate-pulse rounded" />
                </div>
              </TableCell>
              <TableCell><div className="h-6 w-20 bg-pink-50 animate-pulse rounded-full" /></TableCell>
              <TableCell><div className="h-6 w-16 bg-gray-100 animate-pulse rounded-full" /></TableCell>
              <TableCell className="text-right">
                <div className="h-8 w-8 bg-gray-100 animate-pulse rounded ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}