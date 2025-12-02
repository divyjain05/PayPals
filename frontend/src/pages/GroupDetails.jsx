import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, User, Wallet, Trash2 } from "lucide-react";

function GroupDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newMemberName, setNewMemberName] = useState("");

    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [expenseDesc, setExpenseDesc] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseCategory, setExpenseCategory] = useState("Misc");
    const [paidBy, setPaidBy] = useState("");
    const [splitBetween, setSplitBetween] = useState([]);
    const [settlements, setSettlements] = useState([]);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteStep, setDeleteStep] = useState(1);
    const [memberToDelete, setMemberToDelete] = useState(null);

    useEffect(() => {
        fetchGroupDetails();
    }, [id]);

    const fetchGroupDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch group details");
            const data = await res.json();
            setGroup(data);
            setSettlements(calculateSettlements(data));
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups/${id}/members`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newMemberName }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to add member");
            }

            setNewMemberName("");
            setShowAddMemberModal(false);
            fetchGroupDetails(); // Refresh data
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/group/${id}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    description: expenseDesc,
                    amount: expenseAmount,
                    category: expenseCategory,
                    paidById: paidBy,
                    splitBetweenIds: splitBetween
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to add expense");
            }

            setExpenseDesc("");
            setExpenseAmount("");
            setExpenseCategory("Misc");
            setPaidBy("");
            setSplitBetween([]);
            setShowAddExpenseModal(false);
            fetchGroupDetails();
        } catch (err) {
            alert(err.message);
        }
    };

    const initiateDelete = (member) => {
        setMemberToDelete(member);
        setDeleteStep(1);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteStep1 = () => {
        setDeleteStep(2);
    };

    const confirmDeleteFinal = async () => {
        if (!memberToDelete) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups/${id}/members/${memberToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to delete member");

            setShowDeleteConfirm(false);
            setMemberToDelete(null);
            fetchGroupDetails();
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleSplitMember = (memberId) => {
        setSplitBetween(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const calculateSettlements = (groupData) => {
        if (!groupData || !groupData.members || !groupData.expenses) return [];

        const memberMap = {};
        groupData.members.forEach(member => {
            memberMap[member.id] = { ...member };
        });

        const balances = {};
        groupData.members.forEach(member => {
            balances[member.id] = 0;
        });

        groupData.expenses.forEach(expense => {
            if (!expense.paidBy || !expense.splitBetween || expense.splitBetween.length === 0) return;

            const amount = Number(expense.amount) || 0;
            const share = amount / expense.splitBetween.length;

            // Payer paid full amount
            balances[expense.paidBy.id] += amount;

            // Each member owes their share
            expense.splitBetween.forEach(member => {
                balances[member.id] -= share;
            });
        });

        const debtors = [];
        const creditors = [];

        Object.entries(balances).forEach(([memberId, balance]) => {
            const rounded = Math.round(balance * 100) / 100;
            if (rounded < -0.01) {
                debtors.push({ memberId, amount: -rounded });
            } else if (rounded > 0.01) {
                creditors.push({ memberId, amount: rounded });
            }
        });

        const result = [];
        let settlementId = 1;

        let dIndex = 0;
        let cIndex = 0;

        while (dIndex < debtors.length && cIndex < creditors.length) {
            const debtor = debtors[dIndex];
            const creditor = creditors[cIndex];

            const settleAmount = Math.min(debtor.amount, creditor.amount);

            result.push({
                id: `${settlementId++}`,
                from: memberMap[debtor.memberId]?.name || "Member",
                to: memberMap[creditor.memberId]?.name || "Member",
                amount: settleAmount,
                settled: false,
            });

            debtor.amount -= settleAmount;
            creditor.amount -= settleAmount;

            if (debtor.amount <= 0.01) dIndex += 1;
            if (creditor.amount <= 0.01) cIndex += 1;
        }

        return result;
    };

    const handleSettle = (id) => {
        setSettlements(prev => {
            const updated = prev.map(item =>
                item.id === id ? { ...item, settled: true } : item
            );

            const unsettled = updated.filter(item => !item.settled);
            const settled = updated.filter(item => item.settled);
            return [...unsettled, ...settled];
        });
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-neutral-dark">Loading...</div>;
    if (!group) return <div className="flex h-screen items-center justify-center text-red-500">Group not found</div>;

    const totalExpenses = group.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

    return (
        <div className="min-h-screen bg-neutral-light font-sans text-neutral-black">
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Group Header */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-neutral-medium text-center">
                    <h1 className="text-4xl font-bold text-neutral-black mb-2">{group.name}</h1>
                    <p className="text-neutral-dark mb-6">Created on {new Date(group.createdAt).toLocaleDateString()}</p>

                    <div className="inline-block bg-primary rounded-2xl p-6 text-white min-w-[250px] shadow-lg shadow-primary/20">
                        <p className="text-white/90 text-sm font-medium mb-1 uppercase tracking-wider">Total Expenses</p>
                        <p className="text-4xl font-bold text-white">
                            ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        {group.budget && (
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <div className="flex justify-between text-xs text-white/90 mb-2">
                                    <span>Budget: ₹{group.budget.toLocaleString('en-IN')}</span>
                                    <span className={totalExpenses > group.budget ? "text-red-300 font-bold" : ""}>
                                        {Math.round((totalExpenses / group.budget) * 100)}% Used
                                    </span>
                                </div>
                                <div className="w-full bg-white/30 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${totalExpenses > group.budget ? "bg-red-400" : "bg-white"}`}
                                        style={{ width: `${Math.min((totalExpenses / group.budget) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expenses Section */}
                <div className="mb-12">
                    <div className="flex flex-col items-center mb-6">
                        <h2 className="text-2xl font-bold text-neutral-black flex items-center mb-4">
                            <Wallet className="h-6 w-6 mr-2 text-primary" />
                            Expenses
                        </h2>
                        <button
                            onClick={() => setShowAddExpenseModal(true)}
                            className="flex items-center bg-[#FF6B6B] hover:bg-[#FF5252] text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <Plus className="h-5 w-5 mr-1" />
                            Add Expense
                        </button>
                    </div>

                    <div className="space-y-4">
                        {group.expenses?.map((expense) => (
                            <div key={expense.id} className="bg-white rounded-xl shadow-sm border border-neutral-medium p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-neutral-black">{expense.description}</h3>
                                            <span className="px-2.5 py-0.5 rounded-full bg-neutral-medium text-xs font-medium text-neutral-dark border border-neutral-medium">
                                                {expense.category || "Misc"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-dark">
                                            <span className="font-medium text-neutral-black">{expense.paidBy?.name}</span> paid for <span className="font-medium text-neutral-black">{expense.splitBetween?.map(m => m.name).join(", ")}</span>
                                        </p>
                                        <p className="text-xs text-neutral-dark mt-1">{new Date(expense.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right pl-4">
                                        <p className="text-xl font-bold text-neutral-black">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {group.expenses?.length === 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-medium p-12 text-center text-neutral-dark">
                                <Wallet className="h-12 w-12 mx-auto text-neutral-medium mb-3" />
                                <p>No expenses recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Members Section */}
                <div className="mb-12">
                    <div className="flex flex-col items-center mb-6">
                        <h2 className="text-2xl font-bold text-neutral-black flex items-center mb-4">
                            <User className="h-6 w-6 mr-2 text-primary" />
                            Members
                        </h2>
                        <button
                            onClick={() => setShowAddMemberModal(true)}
                            className="flex items-center bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <Plus className="h-5 w-5 mr-1" />
                            Add Member
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-neutral-medium overflow-hidden">
                        <ul className="divide-y divide-neutral-medium">
                            {group.members?.map((member) => (
                                <li key={member.id} className="p-4 flex items-center justify-between hover:bg-neutral-light transition-colors">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-neutral-black">{member.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => initiateDelete(member)}
                                        className="text-neutral-dark hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                        title="Delete Member"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </li>
                            ))}
                            {group.members?.length === 0 && (
                                <li className="p-12 text-center text-neutral-dark">
                                    <User className="h-12 w-12 mx-auto text-neutral-medium mb-3" />
                                    <p>No members added yet.</p>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Pending Amounts Section */}
                <div className="mb-12">
                    <div className="flex flex-col items-center mb-6">
                        <h2 className="text-2xl font-bold text-neutral-black flex items-center">
                            <Wallet className="h-6 w-6 mr-2 text-teal-dark" />
                            Pending Amounts
                        </h2>
                    </div>

                    {settlements.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-neutral-medium p-12 text-center text-neutral-dark">
                            <div className="h-12 w-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Wallet className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-medium text-neutral-black">All settled up!</p>
                            <p className="text-sm mt-1">No pending payments in this group.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-w-2xl mx-auto">
                            {settlements.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between rounded-xl border px-6 py-4 shadow-sm bg-white ${item.settled
                                        ? "border-neutral-medium bg-neutral-light text-neutral-dark line-through"
                                        : "border-accent hover:border-primary hover:shadow-md transition-all"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${item.settled ? "bg-neutral-medium" : "bg-teal-dark"}`}></div>
                                        <div>
                                            <p className="text-base font-medium">
                                                <span className="text-neutral-black">{item.from}</span>
                                                <span className="text-neutral-dark mx-2">→</span>
                                                <span className="text-neutral-black">{item.to}</span>
                                            </p>
                                            <p className="text-sm text-neutral-dark mt-0.5">
                                                ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                    {!item.settled && (
                                        <button
                                            onClick={() => handleSettle(item.id)}
                                            className="px-4 py-2 text-xs font-semibold bg-teal-dark text-white rounded-lg hover:bg-primary transition-colors shadow-sm"
                                        >
                                            Settle
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* Add Member Modal */}
                {
                    showAddMemberModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                                <h3 className="text-xl font-bold text-neutral-black mb-4">Add Member to Group</h3>
                                <form onSubmit={handleAddMember}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-neutral-dark mb-1">Member Name</label>
                                        <input
                                            type="text"
                                            value={newMemberName}
                                            onChange={(e) => setNewMemberName(e.target.value)}
                                            className="w-full p-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="Enter member name"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddMemberModal(false)}
                                            className="px-4 py-2 text-neutral-dark hover:bg-neutral-light rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-teal-dark transition-colors shadow-lg shadow-primary/30"
                                        >
                                            Add Member
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Add Expense Modal */}
                {
                    showAddExpenseModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                                <h3 className="text-xl font-bold text-neutral-black mb-4">Add New Expense</h3>
                                <form onSubmit={handleAddExpense}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-neutral-dark mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={expenseDesc}
                                            onChange={(e) => setExpenseDesc(e.target.value)}
                                            className="w-full p-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="e.g., Dinner, Taxi"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-neutral-dark mb-1">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={expenseAmount}
                                            onChange={(e) => setExpenseAmount(e.target.value)}
                                            className="w-full p-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="0.00"
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-neutral-dark mb-1">Category</label>
                                        <select
                                            value={expenseCategory}
                                            onChange={(e) => setExpenseCategory(e.target.value)}
                                            className="w-full p-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                                        >
                                            <option value="Food">Food</option>
                                            <option value="Travel">Travel</option>
                                            <option value="Stay">Stay</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Activities">Activities</option>
                                            <option value="Misc">Misc</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-neutral-dark mb-1">Paid By</label>
                                        <select
                                            value={paidBy}
                                            onChange={(e) => setPaidBy(e.target.value)}
                                            className="w-full p-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                                            required
                                        >
                                            <option value="">Select Member</option>
                                            {group.members?.map(member => (
                                                <option key={member.id} value={member.id}>{member.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-neutral-dark mb-2">Split Between</label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto border border-neutral-medium rounded-lg p-3">
                                            {group.members?.map(member => (
                                                <label key={member.id} className="flex items-center p-2 hover:bg-neutral-light rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={splitBetween.includes(member.id)}
                                                        onChange={() => toggleSplitMember(member.id)}
                                                        className="h-4 w-4 text-primary focus:ring-primary border-neutral-medium rounded"
                                                    />
                                                    <span className="ml-3 text-neutral-dark">{member.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {splitBetween.length === 0 && <p className="text-xs text-red-500 mt-1">Select at least one member</p>}
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddExpenseModal(false)}
                                            className="px-4 py-2 text-neutral-dark hover:bg-neutral-light rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-teal-dark transition-colors shadow-lg shadow-primary/30"
                                        >
                                            Add Expense
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Delete Confirmation Modal */}
                {
                    showDeleteConfirm && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                                <div className="text-center">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                        <Trash2 className="h-6 w-6 text-red-600" />
                                    </div>

                                    {deleteStep === 1 ? (
                                        <>
                                            <h3 className="text-lg font-bold text-neutral-black mb-2">Delete Member?</h3>
                                            <p className="text-sm text-neutral-dark mb-6">
                                                Are you sure you want to delete <span className="font-bold text-neutral-black">{memberToDelete?.name}</span>?
                                            </p>
                                            <div className="flex justify-center space-x-3">
                                                <button
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
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
                                                This will permanently delete <span className="font-bold text-neutral-black">{memberToDelete?.name}</span> and <span className="font-bold text-red-600">ALL related expenses and settlements</span>. This action cannot be undone.
                                            </p>
                                            <div className="flex justify-center space-x-3">
                                                <button
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
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
                    )
                }
            </div>
        </div>
    );
}

export default GroupDetails;
