const { prisma } = require("../config/prisma");

const getGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await prisma.group.findMany({
            where: { userId },
            include: {
                expenses: true,
                members: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const groupsWithTotal = groups.map(group => {
            const total = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);
            return {
                ...group,
                totalExpenses: total
            };
        });

        res.json(groupsWithTotal);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const createGroup = async (req, res) => {
    try {
        const { name, budget } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ message: "Group name is required" });
        }

        const group = await prisma.group.create({
            data: {
                name,
                budget: budget ? parseFloat(budget) : null,
                userId
            }
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getMonthlyTotal = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const expenses = await prisma.expense.findMany({
            where: {
                group: {
                    userId: userId
                },
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        res.json({ total });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

const getGroupDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                members: true,
                expenses: {
                    orderBy: { date: 'desc' },
                    include: {
                        paidBy: true,
                        splitBetween: true
                    }
                },
                settlements: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        from: true,
                        to: true
                    }
                }
            }
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Member name is required" });
        }

        const member = await prisma.member.create({
            data: {
                name,
                groupId: id
            }
        });

        const group = await prisma.group.findUnique({
            where: { id },
            include: { members: true }
        });

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const createExpense = async (req, res) => {
    try {
        const { id } = req.params; // group id
        const { description, amount, paidById, splitBetweenIds, category } = req.body;

        if (!description || !amount || !paidById || !splitBetweenIds || splitBetweenIds.length === 0) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                category: category || "Misc",
                groupId: id,
                paidById,
                splitBetweenIds
            },
            include: {
                paidBy: true,
                splitBetween: true
            }
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const createSettlement = async (req, res) => {
    try {
        const { id } = req.params; // group id
        const { fromId, toId, amount } = req.body;

        if (!fromId || !toId || !amount) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const settlement = await prisma.settlement.create({
            data: {
                fromId,
                toId,
                amount: parseFloat(amount),
                groupId: id
            },
            include: {
                from: true,
                to: true
            }
        });

        res.status(201).json(settlement);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const deleteMember = async (req, res) => {
    try {
        const { id, memberId } = req.params;

        // 1. Delete all settlements involving this member
        await prisma.settlement.deleteMany({
            where: {
                OR: [
                    { fromId: memberId },
                    { toId: memberId }
                ]
            }
        });

        // 2. Delete all expenses paid by this member
        await prisma.expense.deleteMany({
            where: {
                paidById: memberId
            }
        });

        // 3. Remove member from splitBetweenIds in other expenses
        const expensesWithMember = await prisma.expense.findMany({
            where: {
                splitBetweenIds: {
                    has: memberId
                }
            }
        });

        for (const expense of expensesWithMember) {
            const newSplit = expense.splitBetweenIds.filter(mid => mid !== memberId);
            if (newSplit.length === 0) {
                await prisma.expense.delete({ where: { id: expense.id } });
            } else {
                await prisma.expense.update({
                    where: { id: expense.id },
                    data: { splitBetweenIds: newSplit }
                });
            }
        }

        // 4. Delete the member
        await prisma.member.delete({
            where: { id: memberId }
        });

        res.json({ message: "Member deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify group ownership
        const group = await prisma.group.findUnique({
            where: { id }
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.userId !== userId) {
            return res.status(403).json({ message: "Not authorized to delete this group" });
        }

        // 1. Delete all settlements
        await prisma.settlement.deleteMany({
            where: { groupId: id }
        });

        // 2. Delete all expenses
        await prisma.expense.deleteMany({
            where: { groupId: id }
        });

        // 3. Delete all members
        await prisma.member.deleteMany({
            where: { groupId: id }
        });

        // 4. Delete the group
        await prisma.group.delete({
            where: { id }
        });

        res.json({ message: "Group deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // 1. Total Spent (Lifetime)
        // Find all expenses where paidBy is the user, OR split includes the user
        // For simplicity in this "individual use" app where user owns groups, 
        // we'll sum up expenses in groups owned by the user.
        // A more complex app would check individual splits.
        // Let's stick to "Total Expenses in User's Groups" for now as per previous logic.

        const userGroups = await prisma.group.findMany({
            where: { userId },
            include: { expenses: true }
        });

        let totalSpent = 0;
        userGroups.forEach(group => {
            group.expenses.forEach(expense => {
                totalSpent += expense.amount;
            });
        });

        // 2. Monthly Spending (Last 6 Months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const monthlyExpenses = await prisma.expense.aggregate({
                _sum: { amount: true },
                where: {
                    group: { userId },
                    date: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            });

            monthlyData.push({
                name: monthName,
                amount: monthlyExpenses._sum.amount || 0
            });
        }

        // 3. Spending per Group (Top 5)
        const groupSpending = userGroups.map(group => ({
            id: group.id,
            name: group.name,
            value: group.expenses.reduce((sum, exp) => sum + exp.amount, 0)
        }));

        // Sort by value desc and take top 5
        groupSpending.sort((a, b) => b.value - a.value);
        const topGroups = groupSpending.slice(0, 5);

        // 4. Recent Expenses (Last 5)
        const recentExpenses = await prisma.expense.findMany({
            where: {
                group: { userId }
            },
            orderBy: { date: 'desc' },
            take: 5,
            include: {
                group: {
                    select: { name: true }
                }
            }
        });

        res.json({
            totalSpent,
            monthlyData,
            groupSpending: topGroups,
            recentExpenses
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getGroupAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                expenses: {
                    include: { paidBy: true, splitBetween: true }
                },
                members: true
            }
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const expenses = group.expenses;
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const expenseCount = expenses.length;

        // Average Spend per Day
        let avgDailySpend = 0;
        if (expenses.length > 0) {
            const dates = expenses.map(e => new Date(e.date).toDateString());
            const uniqueDates = new Set(dates).size;
            avgDailySpend = uniqueDates > 0 ? totalSpent / uniqueDates : totalSpent;
        }

        // Highest Spending Day
        const dailyTotals = {};
        expenses.forEach(exp => {
            const date = new Date(exp.date).toDateString();
            dailyTotals[date] = (dailyTotals[date] || 0) + exp.amount;
        });
        let highestSpendingDay = { date: "N/A", amount: 0 };
        Object.entries(dailyTotals).forEach(([date, amount]) => {
            if (amount > highestSpendingDay.amount) {
                highestSpendingDay = { date, amount };
            }
        });

        // Category Breakdown
        const categoryTotals = {};
        expenses.forEach(exp => {
            const cat = exp.category || "Misc";
            categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
        });
        const categoryBreakdown = Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);

        // Member Balances (Paid vs Share)
        const memberStats = group.members.map(member => {
            let paid = 0;
            let share = 0;

            expenses.forEach(exp => {
                if (exp.paidById === member.id) {
                    paid += exp.amount;
                }
                if (exp.splitBetweenIds.includes(member.id)) {
                    share += exp.amount / exp.splitBetweenIds.length;
                }
            });

            return {
                name: member.name,
                paid,
                share,
                balance: paid - share
            };
        });

        res.json({
            groupName: group.name,
            budget: group.budget,
            totalSpent,
            expenseCount,
            avgDailySpend,
            highestSpendingDay,
            categoryBreakdown,
            memberStats,
            totalMembers: group.members.length
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { getGroups, createGroup, getMonthlyTotal, getGroupDetails, addMember, createExpense, createSettlement, deleteMember, deleteGroup, getAnalytics, getGroupAnalytics };
