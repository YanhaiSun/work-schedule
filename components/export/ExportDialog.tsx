"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportExcel: () => void;
  onExportPDF?: () => void;
}

export function ExportDialog({
  open,
  onOpenChange,
  onExportExcel,
  onExportPDF
}: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>导出排班表</DialogTitle>
          <DialogDescription>
            选择导出格式
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <button
            onClick={() => {
              onExportExcel();
              onOpenChange(false);
            }}
            className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet className="h-12 w-12 text-green-600 mb-2" />
            <span className="font-medium">Excel (.xlsx)</span>
            <span className="text-sm text-gray-500">适合打印和编辑</span>
          </button>

          {onExportPDF && (
            <button
              onClick={() => {
                onExportPDF();
                onOpenChange(false);
              }}
              className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-12 w-12 text-red-600 mb-2" />
              <span className="font-medium">PDF (.pdf)</span>
              <span className="text-sm text-gray-500">适合正式存档</span>
            </button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
