import { Home, LayoutDashboard, Phone, ShoppingCart, Star } from "lucide-react";
import { Button } from "../ui/button";
import NavbarMobileMenu, { NavItem } from "./NavbarMobileMenu";
import Link from "next/link";
import React from "react";

const navItems: NavItem[] = [
  {
    label: "Home",
    icon: <Home />,
    href: "/",
  },
  {
    label: "Store",
    icon: <ShoppingCart />,
    href: "/features",
  },
  {
    label: "Reviews",
    icon: <Star />,
    href: "/pricing",
  },
  {
    label: "Contact",
    icon: <Phone />,
    href: "/settings",
  },
];

const loginPath = "/login";

const Navbar = () => {
  return (
    <div className="bg-secondary border-b py-4 px-4 w-full flex items-center justify-center fixed">
      <nav className="w-full container flex justify-between items-center">
        <div className="flex items-center text-lg justify-between">
          <div className="flex items-center gap-2 font-heading">
            <LayoutDashboard />
            Zylo Labs
          </div>
        </div>

        <div>
          <div className="hidden md:flex items-center justify-center gap-4">
            {navItems.map((item) => (
              <Link href={item.href} key={item.label}>
                <Button variant={"ghost"}>
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: "h-4 w-4",
                  })}
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
          <NavbarMobileMenu navItems={navItems} />
        </div>

        <div className="hidden md:flex">
          <Link href={loginPath}>
            <Button>Login</Button>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
