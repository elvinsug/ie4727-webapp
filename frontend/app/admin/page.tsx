"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

interface User {
    id: number;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_users: number;
    users_by_role: Array<{ role: string; count: number }>;
    recent_users_7_days: number;
    latest_signups: Array<{ id: number; email: string; role: string; created_at: string }>;
}

export default function AdminPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id: number; email: string; role: string } | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${API_URL}/check_auth.php`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();

                if (!response.ok || !data.authenticated) {
                    router.push("/login");
                    return;
                }

                if (data.user.role !== "admin") {
                    router.push("/login?error=admin_required");
                    return;
                }

                setCurrentUser(data.user);
                setIsAuthorized(true);

                await Promise.all([fetchUsers(), fetchStats()]);
            } catch (err) {
                console.error("Auth check failed:", err);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users.php`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            const data = await response.json();
            setUsers(data.users || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Failed to load users");
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/stats.php`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch stats");
            }

            const data = await response.json();
            setStats(data.stats);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
            setError("Failed to load statistics");
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/admin/users.php?id=${userId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete user");
            }

            await fetchUsers();
            await fetchStats();
        } catch (err: any) {
            alert(err.message || "Failed to delete user");
        }
    };

    const handleToggleRole = async (userId: number, currentRole: string) => {
        const newRole = currentRole === "admin" ? "user" : "admin";

        if (!confirm(`Change user role to ${newRole}?`)) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append("user_id", userId.toString());
            formData.append("role", newRole);

            const response = await fetch(`${API_URL}/admin/users.php`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update role");
            }

            await fetchUsers();
            await fetchStats();
        } catch (err: any) {
            alert(err.message || "Failed to update role");
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_URL}/logout.php`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                router.push("/login");
            } else {
                throw new Error("Logout failed");
            }
        } catch (err) {
            console.error("Logout error:", err);
            router.push("/login");
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                            Welcome, {currentUser?.email}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => router.push("/")}
                            variant="outline"
                        >
                            Back to Home
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="destructive"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Users</h3>
                            <p className="text-3xl font-bold mt-2">{stats.total_users}</p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Recent Signups (7 days)</h3>
                            <p className="text-3xl font-bold mt-2">{stats.recent_users_7_days}</p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Users by Role</h3>
                            <div className="mt-2 space-y-1">
                                {stats.users_by_role.map((item) => (
                                    <p key={item.role} className="text-sm">
                                        <span className="font-medium capitalize">{item.role}:</span> {item.count}
                                    </p>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Users Table */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">User Management</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="text-left py-3 px-4">ID</th>
                                    <th className="text-left py-3 px-4">Email</th>
                                    <th className="text-left py-3 px-4">Role</th>
                                    <th className="text-left py-3 px-4">Created At</th>
                                    <th className="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                    >
                                        <td className="py-3 px-4">{user.id}</td>
                                        <td className="py-3 px-4">{user.email}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex px-2 py-1 rounded text-xs font-medium ${user.role === "admin"
                                                        ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleToggleRole(user.id, user.role)}
                                                    disabled={user.id === currentUser?.id}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    Toggle Role
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={user.id === currentUser?.id}
                                                    size="sm"
                                                    variant="destructive"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
