const { prisma } = require("../config/prisma");

const getGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await prisma.group.findMany({
            where: { userId },
            include: {
                expenses: true,
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
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ message: "Group name is required" });
        }

        const group = await prisma.group.create({
            data: {
                name,
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

module.exports = { getGroups, createGroup, getMonthlyTotal };
