"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";

import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1 p-0" href="/">
            <Image src="/favicon.ico" alt="" width={40} height={40} className="rounded-full mb-1" />
            <div className="font-bold text-inherit">AI Assistant</div>
          </NextLink>
        </NavbarBrand>
        <ul className="flex gap-6 justify-start ml-4">
          {siteConfig.navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavbarItem key={item.href}>
                <NextLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "relative pb-1 transition-all duration-200 ease-in-out",
                    "hover:text-primary",
                    "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:rounded-full after:transition-all after:duration-200",
                    isActive
                      ? "text-primary font-medium after:bg-primary after:opacity-100"
                      : "after:bg-primary/500 after:opacity-0"
                  )}
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            );
          })}
        </ul>
      </NavbarContent>
    </HeroUINavbar>
  );
};
