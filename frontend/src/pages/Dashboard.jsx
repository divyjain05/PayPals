import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Wallet, Calendar, ArrowUpRight, LogOut, Home, Users, BarChart2, Settings, X } from "lucide-react";

function Dashboard() {
    const [groups, setGroups] = useState([]);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupBudget, setNewGroupBudget] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };

            // Fetch Groups
            const groupsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups`, { headers });
            if (!groupsRes.ok) throw new Error("Failed to fetch groups");
            const groupsData = await groupsRes.json();
            setGroups(groupsData);

            // Fetch Monthly Total
            const totalRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups/monthly-total`, { headers });
            if (!totalRes.ok) throw new Error("Failed to fetch monthly total");
            const totalData = await totalRes.json();
            setMonthlyTotal(totalData.total);

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newGroupName,
                    budget: newGroupBudget
                }),
            });

            if (!res.ok) throw new Error("Failed to create group");

            setNewGroupName("");
            setNewGroupBudget("");
            setShowCreateModal(false);
            fetchData(); // Refresh data
        } catch (err) {
            alert(err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-neutral-dark">Loading...</div>;

    return (
        <div className="min-h-screen bg-neutral-light font-sans text-neutral-black">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Wallet className="h-8 w-8 text-primary mr-2" />
                            <span className="text-2xl font-bold text-neutral-black tracking-tight">PayPals</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-neutral-dark hover:text-red-600 transition-colors duration-200"
                        >
                            <LogOut className="h-5 w-5 mr-1" />
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
                {/* Monthly Summary */}
                <div className="bg-gradient-to-r from-primary to-teal-dark rounded-2xl shadow-xl p-8 mb-10 text-white transform hover:scale-[1.01] transition-transform duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h2 className="text-white/90 text-lg font-medium mb-1">Total Monthly Expenses</h2>
                            <div className="text-5xl font-bold tracking-tight">
                                ₹{monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <p className="text-white/90 mt-2 text-sm opacity-80">
                                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="mt-6 md:mt-0 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <Wallet className="h-12 w-12 text-white opacity-90" />
                        </div>
                    </div>
                </div>

                {/* Groups Section */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-neutral-black">My Groups</h3>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center bg-gradient-to-r from-primary to-accent hover:from-teal-dark hover:to-primary text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="h-5 w-5 mr-1" />
                        New Group
                    </button>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            onClick={() => navigate(`/group/${group.id}`)}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-neutral-medium overflow-hidden group cursor-pointer"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 bg-accent/20 rounded-full flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                        <Calendar className="h-6 w-6 text-primary" />
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-neutral-dark group-hover:text-primary transition-colors" />
                                </div>
                                <h4 className="text-lg font-bold text-neutral-black mb-1 truncate">{group.name}</h4>
                                <p className="text-neutral-dark text-xs mb-4">
                                    Created {new Date(group.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-neutral-dark uppercase font-semibold tracking-wider">Total Expenses</p>
                                        <p className="text-xl font-bold text-neutral-black">
                                            ₹{group.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-neutral-light px-6 py-3 border-t border-neutral-medium">
                                <p className="text-xs text-neutral-dark text-right">Last updated {new Date(group.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}

                    {/* Create New Group Card (Empty State) */}
                    {groups.length === 0 && (
                        <div
                            onClick={() => setShowCreateModal(true)}
                            className="border-2 border-dashed border-neutral-medium rounded-xl p-6 flex flex-col items-center justify-center text-neutral-dark hover:border-primary hover:text-primary transition-colors cursor-pointer min-h-[200px]"
                        >
                            <Plus className="h-10 w-10 mb-2" />
                            <span className="font-medium">Create your first group</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-neutral-black mb-4">Create New Group</h3>
                        <form onSubmit={handleCreateGroup}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-neutral-dark mb-2">Group Name</label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder="e.g., Summer Trip, Roommates"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-neutral-dark mb-2">Budget (Optional)</label>
                                <input
                                    type="number"
                                    value={newGroupBudget}
                                    onChange={(e) => setNewGroupBudget(e.target.value)}
                                    className="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder="e.g., 5000"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-neutral-dark hover:bg-neutral-light rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-teal-dark transition-colors shadow-lg shadow-primary/30"
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Floating Navigation Bar */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md border border-neutral-medium shadow-2xl rounded-full px-8 py-4 flex items-center space-x-12 z-50">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex flex-col items-center text-primary hover:text-teal-dark transition-colors"
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
                    onClick={() => navigate("/analytics")}
                    className="flex flex-col items-center text-neutral-dark hover:text-primary transition-colors"
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

export default Dashboard;
