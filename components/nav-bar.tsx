"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useXRPLWallet } from "@/hooks/useXRPLWallet";
import { toast } from "sonner";

const MENU_ITEMS = [
  { label: "Explore", href: "/" },
  { label: "Create", href: "/create" },
  { label: "Admin", href: "/admin" },
] as const;

interface NavMenuItemsProps {
  className?: string;
}

const NavMenuItems = ({ className }: NavMenuItemsProps) => (
  <div className={`flex flex-col md:flex-row gap-1 ${className ?? ""}`}>
    {MENU_ITEMS.map(({ label, href }) => (
      <Link key={label} href={href}>
        <Button variant="ghost" className="w-full md:w-auto">
          {label}
        </Button>
      </Link>
    ))}
  </div>
);

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, isConnecting, accountInfo, connect, disconnect } = useXRPLWallet();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleConnection = async () => {
    if (isConnected) {
      disconnect();
      toast.success("Déconnexion réussie");
      return;
    }

    try {
      await connect();
      toast.success("Connexion réussie");
    } catch (error) {
      toast.error("Erreur de connexion");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b py-3.5 md:py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="font-medium">
          Masterclass NFT
          </Link>

        <div className="hidden md:flex items-center gap-4">
          <NavMenuItems />
          <Button 
            onClick={handleConnection}
            disabled={isConnecting}
          >
            {isConnecting ? "Connexion..." : isConnected ? (
              <>
                {accountInfo?.address.slice(0, 6)}...{accountInfo?.address.slice(-4)}
                ({accountInfo?.balance.toFixed(2)} XRP)
              </>
            ) : "Connect Wallet"}
          </Button>
        </div>

          <Button
            variant="ghost"
            className="size-9 flex items-center justify-center md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

      {isMenuOpen && (
        <div className="md:hidden container mx-auto px-4 py-4">
          <NavMenuItems className="mb-4" />
          <Button 
            onClick={handleConnection}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? "Connexion..." : isConnected ? (
              <>
                {accountInfo?.address.slice(0, 6)}...{accountInfo?.address.slice(-4)}
                ({accountInfo?.balance.toFixed(2)} XRP)
              </>
            ) : "Connect Wallet"}
          </Button>
          </div>
        )}
    </nav>
  );
}
