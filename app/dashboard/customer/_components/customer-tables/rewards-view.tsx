// rewards-view.tsx
'use client';
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RewardsViewerCellProps {
  data: Record<string, any[]>;
}

const capitalizeHeader = (header: string) => {
  return header
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  
  if (typeof value === 'object') {
    if (Object.keys(value as object).length === 0) return '-';
    try {
      return JSON.stringify(value);
    } catch {
      return '-';
    }
  }
  
  if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  
  return String(value);
};

const DynamicTable: React.FC<{ category: string; data: any[] }> = ({ category, data }) => {
  if (!data || !data.length) return null;
  
  const allKeys = Array.from(
    new Set(
      data.flatMap(item => Object.keys(item))
    )
  ).filter(key => key !== 'id');

  // Limit to first 4 columns
  const limitedKeys = allKeys.slice(0, 4);
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">{capitalizeHeader(category)}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {limitedKeys.map((key) => (
                <TableHead key={key} className="whitespace-nowrap">
                  {capitalizeHeader(key)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {limitedKeys.map((key) => (
                  <TableCell key={`${rowIndex}-${key}`} className="max-w-[200px] truncate">
                    {formatValue(item[key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export const RewardsViewerCell: React.FC<RewardsViewerCellProps> = ({ data }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="px-2 py-1 h-7"
        >
          View Rewards
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Rewards Data</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-60 grid-cols-2">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="json">JSON View</TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-4">
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {Object.entries(data).map(([category, entries]) => (
                <DynamicTable 
                  key={category} 
                  category={category} 
                  data={entries} 
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="json" className="mt-4">
            <pre className="bg-slate-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};