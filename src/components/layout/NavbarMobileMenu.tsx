"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface NavbarMobileMenuProps {
  navItems: NavItem[];
}

const NavbarMobileMenu = ({ navItems }: NavbarMobileMenuProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="flex md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant={"ghost"}
            size={"icon"}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col w-full gap-2 px-4">
            {navItems.map((item, i) => (
              <Link href={item.href} key={i}>
                <Button variant="ghost" className="w-full">
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: "h-5 w-5",
                  })}
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button>
              Login
            </Button>
          </div>

          {/* <SheetFooter>
            <Button type="submit">Save changes</Button>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter> */}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NavbarMobileMenu;
