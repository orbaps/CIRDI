"use client";

import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <div className="flex items-center p-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-slate-900 border-r-slate-800">
          <Sidebar />
        </SheetContent>
      </Sheet>
      <div className="flex w-full justify-end">
        {/* User Button Placeholder */}
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
          <span className="text-sm font-semibold text-slate-600">JD</span>
        </div>
      </div>
    </div>
  );
}
