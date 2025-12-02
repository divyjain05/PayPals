import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, TrendingUp, Calendar, PieChart as PieIcon, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function GroupAnalytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchGroupAnalytics();
    }, [id]);

    const fetchGroupAnalytics = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups/${id}/analytics`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch group analytics");
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
        <div className="min-h-screen bg-neutral-light font-sans text-neutral-black pb-12">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center cursor-pointer" onClick={() => navigate("/analytics")}>
                            <ArrowLeft className="h-6 w-6 text-neutral-dark mr-2" />
                            <span className="text-xl font-bold text-neutral-black">Back to Analytics</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-black">{data?.groupName} Analytics</h1>
                    <p className="text-neutral-dark mt-1">Detailed breakdown of expenses and member contributions</p>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-medium">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-neutral-dark font-medium text-sm">Total Spent</h3>
                            <div className="bg-accent/20 p-2 rounded-lg">
                                <Wallet className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-neutral-black">
                            ₹{data?.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        {data?.budget && (
                            <div className="mt-2 text-xs">
                                <span className={data.totalSpent > data.budget ? "text-red-500 font-bold" : "text-primary font-medium"}>
                                    {Math.round((data.totalSpent / data.budget) * 100)}%
                                </span> of budget used
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-medium">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-neutral-dark font-medium text-sm">Avg Daily Spend</h3>
                            <div className="bg-accent/20 p-2 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-neutral-black">
                            ₹{data?.avgDailySpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-neutral-dark mt-1">Per active day</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-medium">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-neutral-dark font-medium text-sm">Highest Spending Day</h3>
                            <div className="bg-teal-dark/10 p-2 rounded-lg">
                                <Calendar className="h-5 w-5 text-teal-dark" />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-neutral-black truncate">{data?.highestSpendingDay.date}</p>
                        <p className="text-sm text-neutral-dark">
                            ₹{data?.highestSpendingDay.amount.toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-medium">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-neutral-dark font-medium text-sm">Total Expenses</h3>
                            <div className="bg-accent/20 p-2 rounded-lg">
                                <PieIcon className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-neutral-black">{data?.expenseCount}</p>
                        <p className="text-xs text-neutral-dark mt-1">Transactions logged</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Category Breakdown */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-medium">
                        <h3 className="text-lg font-bold text-neutral-black mb-6">Category Breakdown</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.categoryBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Member Balances */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-medium">
                        <h3 className="text-lg font-bold text-neutral-black mb-6">Member Balances (Paid - Share)</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.memberStats} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip
                                        formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
                                        {data?.memberStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.balance >= 0 ? '#46B29D' : '#EF4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-neutral-dark mt-4">
                            <span className="text-primary font-bold">Green</span>: Paid more than share (To receive) • <span className="text-red-500 font-bold">Red</span>: Paid less than share (To pay)
                        </p>
                    </div>
                </div>

                {/* Detailed Member Stats Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-medium overflow-hidden">
                    <div className="p-6 border-b border-neutral-medium">
                        <h3 className="text-lg font-bold text-neutral-black">Member Contributions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Member</th>
                                    <th className="px-6 py-3 font-medium">Paid Amount</th>
                                    <th className="px-6 py-3 font-medium">Share Owed</th>
                                    <th className="px-6 py-3 font-medium">Net Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-medium">
                                {data?.memberStats.map((member) => (
                                    <tr key={member.name} className="hover:bg-neutral-light transition-colors">
                                        <td className="px-6 py-4 font-medium text-neutral-black">{member.name}</td>
                                        <td className="px-6 py-4 text-neutral-dark">₹{member.paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-neutral-dark">₹{member.share.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td className={`px-6 py-4 font-bold ${member.balance >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                            {member.balance >= 0 ? '+' : ''}₹{member.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GroupAnalytics;
