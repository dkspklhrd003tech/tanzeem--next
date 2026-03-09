"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminLayout, AdminPages, AdminLogin } from "@/components/admin";

function SiteManagerContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const section = searchParams.get("section") || "dashboard";

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/auth/me");
                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch {
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const handleExitAdmin = () => router.push("/");

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin />;
    }

    return (
        <AdminLayout currentSection={section} onExitAdmin={handleExitAdmin}>
            <AdminPages section={section} />
        </AdminLayout>
    );
}

export default function SiteManager() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
            <SiteManagerContent />
        </Suspense>
    );
}
