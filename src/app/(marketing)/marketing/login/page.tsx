"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Briefcase, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function MarketingLoginPage() {
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("mark@hopecafe.network");
    const [password, setPassword] = React.useState("hope2026");

    const router = useRouter();
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        localStorage.setItem("hopecafe_marketing_session", "active");
        setLoading(false);
        toast.success("Marketing Executive Login Successful");
        router.push("/marketing/dashboard");
    };

    return (
        <div className="min-h-screen bg-admin-navy flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-full max-w-md"
            >
                <Card className="bg-[#1F2937] border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
                    <CardHeader className="text-center pt-12">
                        <div className="w-20 h-20 bg-gray-800 text-hope-purple rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-700 shadow-inner">
                            <Briefcase className="w-10 h-10" />
                        </div>
                        <CardTitle className="text-3xl font-black text-white">Executive Auth</CardTitle>
                        <p className="text-gray-500 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">HOPE Cafe Marketing Network</p>
                    </CardHeader>
                    <CardContent className="p-12">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        className="pl-12 bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:ring-hope-purple/20 focus:border-hope-purple"
                                        placeholder="name@hopecafe.network"
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        className="pl-12 bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:ring-hope-purple/20 focus:border-hope-purple"
                                        placeholder="••••••••"
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-15 text-lg mt-4 shadow-hope-purple/20" isLoading={loading}>
                                Authorize <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>

                            <div className="pt-8 text-center space-y-4">
                                <div className="p-4 bg-hope-purple/5 border border-hope-purple/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-hope-purple uppercase tracking-widest mb-1">Demo Credentials</p>
                                    <p className="text-xs text-gray-400 font-bold">Key: <span className="text-white">hope2026</span></p>
                                </div>
                                <Link href="/" className="inline-block text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-hope-purple transition-colors">
                                    ← Back to Public Interface
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
