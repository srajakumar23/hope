"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { QrCode, LogIn, Shield } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Header() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                scrolled
                    ? "bg-white/95 backdrop-blur-2xl py-4 border-b border-gray-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                    : "bg-transparent py-6 border-b border-transparent"
            )}
        >
            {/* Top decorative gradient edge */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-hope-purple via-hope-purple to-hope-purple" />

            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                <div className="flex justify-between items-center relative">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group relative z-10 transition-transform hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-hope-purple/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                            className="w-12 h-12 relative z-10"
                            role="img"
                            aria-label="HOPE Cafe Logo"
                        >
                            <img src="/logo.png" alt="HOPE Cafe" className="w-full h-full object-contain" />
                        </motion.div>
                        <div className="flex flex-col relative z-10">
                            <span className="font-black text-xl leading-none text-gray-900 tracking-tight">HOPE Cafe</span>
                            <span className="text-[10px] text-hope-purple uppercase tracking-[0.2em] font-black">Hospitality</span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    {!isAuthPage && (
                        <nav className="flex items-center gap-2 sm:gap-4 relative z-10">
                            <Link
                                href="/login"
                                className="hidden md:flex text-sm font-bold text-gray-600 hover:text-hope-purple transition-all items-center gap-2 px-4 py-2 rounded-full hover:bg-hope-purple/5 border border-transparent hover:border-hope-purple/10"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Partner Login</span>
                            </Link>

                            <div className="hidden md:block w-px h-5 bg-gray-200 mx-1" />

                            <Link
                                href="/admin/login"
                                className="hidden md:flex text-sm font-bold text-gray-400 hover:text-gray-900 transition-all items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200"
                            >
                                <Shield className="w-4 h-4" />
                                <span>Admin</span>
                            </Link>

                            <Link href="/scan" className="ml-2">
                                <Button size="sm" className="flex gap-2 rounded-full shadow-md shadow-hope-purple/20 hover:shadow-lg hover:shadow-hope-purple/40 transition-all hover:-translate-y-0.5 bg-gradient-to-r from-hope-purple to-hope-pink hover:from-hope-pink hover:to-hope-purple border-none h-10 px-5 ring-2 ring-transparent hover:ring-hope-purple/20" aria-label="Find your guest pass">
                                    <QrCode className="w-4 h-4" />
                                    <span className="font-bold">Guest Pass</span>
                                </Button>
                            </Link>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
}
