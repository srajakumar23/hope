"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Shield,
    Users,
    BarChart3,
    Settings2,
    CreditCard,
    ChevronRight,
    LogOut,
    ExternalLink,
    ScanLine,
    UserPlus
} from "lucide-react";
import { toast } from "sonner";

const adminLinks = [
    { name: "Overview", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Live Scan", href: "/admin/scan", icon: ScanLine },
    { name: "Partners", href: "/admin/partners", icon: Users },
    { name: "Slabs & Fees", href: "/admin/slabs", icon: Settings2 },
    { name: "Payouts", href: "/admin/payouts", icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = React.useState(false);

    React.useEffect(() => {
        // Exempt login page from the guard
        if (pathname === "/admin/login") {
            setIsAuthorized(true);
            return;
        }

        const session = localStorage.getItem("divyam_admin_session");
        if (!session) {
            toast.error("Security session expired. Please re-authorize.");
            router.replace("/admin/login");
        } else {
            setIsAuthorized(true);
        }
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem("divyam_admin_session");
        toast.info("Security session terminated.");
        router.replace("/admin/login");
    };

    const isAuthPage = pathname === "/admin/login";

    if (!isAuthorized) return <div className="min-h-screen bg-surface-light" />;

    return (
        <div className="flex min-h-screen bg-surface-light text-gray-900">
            {/* Sidebar - Desktop (Only on dashboard pages) */}
            {!isAuthPage && (
                <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed h-screen z-40">
                    <div className="p-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-divyam-orange rounded-xl flex items-center justify-center shadow-lg shadow-divyam-orange/20">
                                <Shield className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <span className="font-bold text-lg text-gray-900 block leading-none tracking-tight">Admin Console</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-black">Divyam Management</span>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex-1 px-6 space-y-2 mt-6">
                        {adminLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group",
                                    pathname === link.href
                                        ? "bg-divyam-orange/5 text-divyam-orange"
                                        : "text-gray-600 hover:text-divyam-orange hover:bg-divyam-orange/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className="w-5 h-5 text-inherit shrink-0" />
                                    <span className="translate-y-[0.5px]">{link.name}</span>
                                </div>
                                {pathname === link.href && (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="px-6 pb-10 mt-auto">
                        <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 mb-6 font-medium">
                            <p className="text-[10px] text-gray-500 mb-2 font-black uppercase tracking-widest">System Status</p>
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" />
                                <span className="text-gray-900">All Systems Active</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <main className={cn("flex-1 transition-all", !isAuthPage && "lg:ml-72")}>
                <div className={cn("min-h-screen", isAuthPage ? "flex items-center justify-center bg-admin-navy" : "p-8 lg:p-12")}>
                    {children}
                </div>
            </main>
        </div>
    );
}
