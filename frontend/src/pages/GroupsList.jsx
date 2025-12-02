import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Plus, Home, Users, BarChart2, Settings, Wallet, Search, Filter, SortAsc, SortDesc, Trash2 } from "lucide-react";

function GroupsList() {
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter & Sort States
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name"); // name, expense
    const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
    const [showFilters, setShowFilters] = useState(false);
    const [minExpense, setMinExpense] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteStep, setDeleteStep] = useState(1);
    const [groupToDelete, setGroupToDelete] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        filterAndSortGroups();
    }, [groups, searchQuery, sortBy, sortOrder, minExpense, dateFrom, dateTo]);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch groups");
            const data = await res.json();
            setGroups(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const filterAndSortGroups = () => {
        let result = [...groups];

        // Search
        if (searchQuery) {
            result = result.filter(group =>
                group.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by Expense
        if (minExpense) {
            result = result.filter(group =>
                (group.totalExpenses || 0) >= parseFloat(minExpense)
            );
        }

        // Filter by Date
        if (dateFrom) {
            result = result.filter(group =>
                new Date(group.createdAt) >= new Date(dateFrom)
            );
        }
        if (dateTo) {
            // Set time to end of day for inclusive comparison
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter(group =>
                new Date(group.createdAt) <= toDate
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === "name") {
                return sortOrder === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortBy === "expense") {
                const expA = a.totalExpenses || 0;
                const expB = b.totalExpenses || 0;
                return sortOrder === "asc" ? expA - expB : expB - expA;
            }
            return 0;
        });

        setFilteredGroups(result);
    };

    const initiateDelete = (e, group) => {
        e.stopPropagation(); // Prevent navigation
        setGroupToDelete(group);
        setDeleteStep(1);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteStep1 = () => {
        setDeleteStep(2);
    };

    const confirmDeleteFinal = async () => {
        if (!groupToDelete) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups/${groupToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to delete group");

            setShowDeleteConfirm(false);
            setGroupToDelete(null);
            fetchGroups(); // Refresh list
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-neutral-dark">Loading...</div>;

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
                <div className="flex flex-col space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-neutral-black">All Groups</h1>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-accent/20 text-primary' : 'bg-white text-neutral-dark hover:bg-neutral-medium'}`}
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Search and Sort Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-neutral-medium rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-neutral-medium rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                            >
                                <option value="name">Name</option>
                                <option value="expense">Expense</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                className="p-2 border border-neutral-medium rounded-xl hover:bg-neutral-light bg-white"
                            >
                                {sortOrder === "asc" ? <SortAsc className="h-5 w-5 text-neutral-dark" /> : <SortDesc className="h-5 w-5 text-neutral-dark" />}
                            </button>
                        </div>
                    </div>

                    {/* Extended Filters */}
                    {showFilters && (
                        <div className="bg-white p-4 rounded-xl border border-neutral-medium shadow-sm animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-dark mb-1">Min Expense (₹)</label>
                                    <input
                                        type="number"
                                        value={minExpense}
                                        onChange={(e) => setMinExpense(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full p-2 border border-neutral-medium rounded-lg text-sm outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-dark mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full p-2 border border-neutral-medium rounded-lg text-sm outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-dark mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full p-2 border border-neutral-medium rounded-lg text-sm outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => {
                                        setMinExpense("");
                                        setDateFrom("");
                                        setDateTo("");
                                    }}
                                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
                        <div
                            key={group.id}
                            onClick={() => navigate(`/group/${group.id}`)}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-neutral-medium overflow-hidden group cursor-pointer"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 bg-accent/20 rounded-full flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={(e) => initiateDelete(e, group)}
                                            className="p-2 text-neutral-medium hover:text-red-500 transition-colors z-10"
                                            title="Delete Group"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <ArrowUpRight className="h-5 w-5 text-neutral-medium group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-neutral-black mb-1 truncate">{group.name}</h4>
                                <p className="text-neutral-dark text-xs mb-4">
                                    Created {new Date(group.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-neutral-dark uppercase font-semibold tracking-wider">Total Expenses</p>
                                        <p className="text-xl font-bold text-neutral-black">
                                            ₹{(group.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredGroups.length === 0 && (
                        <div className="col-span-full text-center py-12 text-neutral-dark">
                            <p>No groups found.</p>
                        </div>
                    )}
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
                    className="flex flex-col items-center text-primary hover:text-teal-dark transition-colors"
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
                    className="p-3 rounded-xl text-neutral-dark hover:text-primary hover:bg-accent/20 transition-all"
                >
                    <Settings className="h-6 w-6" />
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>

                            {deleteStep === 1 ? (
                                <>
                                    <h3 className="text-lg font-bold text-neutral-black mb-2">Delete Group?</h3>
                                    <p className="text-sm text-neutral-dark mb-6">
                                        Are you sure you want to delete <span className="font-bold text-neutral-black">{groupToDelete?.name}</span>?
                                    </p>
                                    <div className="flex justify-center space-x-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 text-neutral-dark hover:bg-neutral-light rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDeleteStep1}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Yes, Delete
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-bold text-neutral-black mb-2">Are you absolutely sure?</h3>
                                    <p className="text-sm text-neutral-dark mb-6">
                                        This will permanently delete <span className="font-bold text-neutral-black">{groupToDelete?.name}</span> and <span className="font-bold text-red-600">ALL associated members, expenses, and settlements</span>. This action cannot be undone.
                                    </p>
                                    <div className="flex justify-center space-x-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 text-neutral-dark hover:bg-neutral-light rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDeleteFinal}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
                                        >
                                            Confirm Deletion
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GroupsList;
