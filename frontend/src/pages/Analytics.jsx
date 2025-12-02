import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Users, BarChart2, Settings, Wallet, TrendingUp, PieChart as PieIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups/analytics`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch analytics data");
            const analyticsData = await res.json();
            setData(analyticsData);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-neutral-dark">Loading...</div>;

    const COLORS = ['#46B29D', '#FF6B6B', '#FFD93D', '#6C5CE7', '#A2DED0', '#008080'];

    return (
        <div className="min-h-screen bg-neutral-light font-sans text-neutral-black pb-32">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center cursor-pointer" onClick={() => navigate("/dashboard")}>
                            <ArrowLeft className="h-6 w-6 text-neutral-dark mr-2" />
                            <span className="text-xl font-bold text-neutral-black">Back to Dashboard</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-neutral-black mb-8">Analytics Overview</h1>

                {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-primary to-teal-dark rounded-2xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white/90 font-medium">Total Lifetime Spending</h3>
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold">
                            ₹{data?.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-medium p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-neutral-dark font-medium">Top Spending Group</h3>
                            <div className="bg-accent/20 p-2 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-neutral-black truncate">
                            {data?.groupSpending[0]?.name || "N/A"}
                        </p>
                        <p className="text-sm text-neutral-dark mt-1">
                            ₹{data?.groupSpending[0]?.value.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || "0.00"}
                        </p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Monthly Spending Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-medium">
                        <h3 className="text-lg font-bold text-neutral-black mb-6 flex items-center">
                            <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                            Monthly Spending (Last 6 Months)
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip
                                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="amount" fill="#46B29D" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Group Distribution Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-medium">
                        <h3 className="text-lg font-bold text-neutral-black mb-6 flex items-center">
                            <PieIcon className="h-5 w-5 mr-2 text-teal-dark" />
                            Spending by Group (Top 5)
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.groupSpending}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.groupSpending.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Groups List for Detailed Analytics */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-neutral-black mb-4">Group Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.groupSpending.map((group, index) => (
                            <div
                                key={group.id}
                                onClick={() => navigate(`/analytics/${group.id}`)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-medium hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 bg-accent/20 rounded-full flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-neutral-medium group-hover:text-primary transition-colors" />
                                </div>
                                <h4 className="text-lg font-bold text-neutral-black mb-1">{group.name}</h4>
                                <p className="text-neutral-dark text-sm">
                                    Total Spent: <span className="font-semibold text-neutral-black">₹{group.value.toLocaleString('en-IN')}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Expenses List */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-medium overflow-hidden">
                    <div className="p-6 border-b border-neutral-medium">
                        <h3 className="text-lg font-bold text-neutral-black">Recent Activity</h3>
                    </div>
                    <div className="divide-y divide-neutral-medium">
                        {data?.recentExpenses.map((expense) => (
                            <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-neutral-light transition-colors">
                                <div>
                                    <p className="font-medium text-neutral-black">{expense.description}</p>
                                    <p className="text-xs text-neutral-dark">
                                        {new Date(expense.date).toLocaleDateString()} • {expense.group.name}
                                    </p>
                                </div>
                                <p className="font-bold text-neutral-black">
                                    ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        ))}
                        {data?.recentExpenses.length === 0 && (
                            <div className="p-8 text-center text-neutral-dark">No recent activity found.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Navigation Bar */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md border border-neutral-medium shadow-2xl rounded-full px-8 py-4 flex items-center space-x-12 z-50">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex flex-col items-center text-neutral-dark hover:text-primary transition-colors"
                >
                    <Home className="h-6 w-6" />
                </button>
                <button
                    onClick={() => navigate("/groups")}
                    className="flex flex-col items-center text-neutral-dark hover:text-primary transition-colors"
                >
                    <Users className="h-6 w-6" />
                </button>
                <button
                    className="flex flex-col items-center text-primary hover:text-teal-dark transition-colors"
                >
                    <BarChart2 className="h-6 w-6" />
                </button>
                <button
                    onClick={() => navigate("/settings")}
                    className="flex flex-col items-center text-neutral-dark hover:text-primary transition-colors"
                >
                    <Settings className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}

export default Analytics;
