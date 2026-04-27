import { useState, useEffect } from "react";
import Modal from "react-modal";
import { SnackbarProvider, useSnackbar } from "notistack";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaUtensils, FaFilm, FaPlane, FaShoppingBag } from "react-icons/fa";

Modal.setAppElement("#root");

const COLORS = { Food: "#8b5cf6", Entertainment: "#f97316", Travel: "#eab308" };

const getCategoryIcon = (category) => {
  if (category === "Food") return <FaUtensils />;
  if (category === "Entertainment") return <FaFilm />;
  if (category === "Travel") return <FaPlane />;
  return <FaShoppingBag />;
};

function ExpenseTracker() {
  const { enqueueSnackbar } = useSnackbar();

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem("balance");
    return saved ? Number(saved) : 5000;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [incomeModal, setIncomeModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [incomeAmount, setIncomeAmount] = useState("");

  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    date: "",
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("balance", balance);
  }, [balance]);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.price), 0);

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!incomeAmount || incomeAmount <= 0) return;
    setBalance((prev) => prev + Number(incomeAmount));
    setIncomeAmount("");
    setIncomeModal(false);
    enqueueSnackbar("Income added!", { variant: "success" });
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.category || !form.date) return;
    if (Number(form.price) > balance) {
      enqueueSnackbar("Insufficient balance!", { variant: "error" });
      return;
    }
    if (editExpense) {
      const diff = Number(form.price) - Number(editExpense.price);
      if (diff > balance) {
        enqueueSnackbar("Insufficient balance!", { variant: "error" });
        return;
      }
      setExpenses((prev) =>
        prev.map((ex) =>
          ex.id === editExpense.id ? { ...form, id: ex.id } : ex
        )
      );
      setBalance((prev) => prev - diff);
      enqueueSnackbar("Expense updated!", { variant: "success" });
    } else {
      setExpenses((prev) => [...prev, { ...form, id: Date.now() }]);
      setBalance((prev) => prev - Number(form.price));
      enqueueSnackbar("Expense added!", { variant: "success" });
    }
    setForm({ title: "", price: "", category: "", date: "" });
    setEditExpense(null);
    setExpenseModal(false);
  };

  const handleDelete = (expense) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
    setBalance((prev) => prev + Number(expense.price));
    enqueueSnackbar("Expense deleted!", { variant: "success" });
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setForm({
      title: expense.title,
      price: expense.price,
      category: expense.category,
      date: expense.date,
    });
    setBalance((prev) => prev + Number(expense.price));
    setExpenseModal(true);
  };

  const pieData = ["Food", "Entertainment", "Travel"]
    .map((cat) => ({
      name: cat,
      value: expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + Number(e.price), 0),
    }))
    .filter((d) => d.value > 0);

  const barData = ["Food", "Entertainment", "Travel"].map((cat) => ({
    name: cat,
    amount: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + Number(e.price), 0),
  }));

  const modalStyle = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      borderRadius: "12px",
      padding: "32px",
      width: "360px",
      backgroundColor: "#fff",
      border: "none",
    },
    overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000 },
  };

  return (
    <div
      style={{
        backgroundColor: "#1a1a2e",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "sans-serif",
        color: "#fff",
      }}
    >
      <h1 style={{ marginBottom: "16px" }}>Expense Tracker</h1>

      {/* Top Cards */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          backgroundColor: "#2d2d44",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          alignItems: "center",
        }}
      >
        {/* Wallet Card */}
        <div
          style={{
            flex: 1,
            minWidth: "200px",
            backgroundColor: "#3d3d56",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
            Wallet Balance:{" "}
            <span style={{ color: "#4ade80", fontWeight: "bold" }}>
              ₹{balance}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setIncomeModal(true)}
            style={{
              backgroundColor: "#4ade80",
              border: "none",
              borderRadius: "20px",
              padding: "8px 20px",
              cursor: "pointer",
              fontWeight: "bold",
              color: "#000",
            }}
          >
            + Add Income
          </button>
        </div>

        {/* Expenses Card */}
        <div
          style={{
            flex: 1,
            minWidth: "200px",
            backgroundColor: "#3d3d56",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
            Expenses:{" "}
            <span style={{ color: "#f97316", fontWeight: "bold" }}>
              ₹{totalExpenses}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              setEditExpense(null);
              setForm({ title: "", price: "", category: "", date: "" });
              setExpenseModal(true);
            }}
            style={{
              backgroundColor: "#ef4444",
              border: "none",
              borderRadius: "20px",
              padding: "8px 20px",
              cursor: "pointer",
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            + Add Expense
          </button>
        </div>

        {/* Pie Chart */}
        <div style={{ flex: 1, minWidth: "200px", textAlign: "center" }}>
          {pieData.length > 0 ? (
            <PieChart width={180} height={180}>
              <Pie
                data={pieData}
                cx={85}
                cy={85}
                outerRadius={80}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : (
            <div style={{ width: 180, height: 180, margin: "auto" }} />
          )}
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "8px",
            }}
          >
            {Object.entries(COLORS).map(([name, color]) => (
              <span
                key={name}
                style={{
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: color,
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {/* Recent Transactions */}
        <div style={{ flex: 2, minWidth: "280px" }}>
          <h2 style={{ fontStyle: "italic", marginBottom: "12px" }}>
            Recent Transactions
          </h2>
          {expenses.length === 0 ? (
            <div
              style={{
                backgroundColor: "#fff",
                color: "#333",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              No transactions!
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  style={{
                    backgroundColor: "#fff",
                    color: "#333",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        color: COLORS[expense.category],
                        fontSize: "1.4rem",
                      }}
                    >
                      {getCategoryIcon(expense.category)}
                    </span>
                    <div>
                      <div style={{ fontWeight: "bold" }}>{expense.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "#666" }}>
                        {expense.date}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "#f97316", fontWeight: "bold" }}>
                      ₹{expense.price}
                    </span>
                    <button
                      onClick={() => handleDelete(expense)}
                      style={{
                        backgroundColor: "#ef4444",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        cursor: "pointer",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => handleEdit(expense)}
                      style={{
                        backgroundColor: "#f97316",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        cursor: "pointer",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✎
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Expenses Bar Chart */}
        <div style={{ flex: 1, minWidth: "220px" }}>
          <h2 style={{ marginBottom: "12px" }}>Top Expenses</h2>
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fill: "#333", fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add Income Modal */}
      <Modal
        isOpen={incomeModal}
        onRequestClose={() => setIncomeModal(false)}
        style={modalStyle}
      >
        <h2 style={{ color: "#333", marginBottom: "16px" }}>Add Balance</h2>
        <form onSubmit={handleAddIncome}>
          <input
            type="number"
            placeholder="Income Amount"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              marginBottom: "16px",
              boxSizing: "border-box",
            }}
            required
          />
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              style={{
                flex: 1,
                backgroundColor: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Add Balance
            </button>
            <button
              type="button"
              onClick={() => setIncomeModal(false)}
              style={{
                flex: 1,
                backgroundColor: "#9ca3af",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "10px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={expenseModal}
        onRequestClose={() => {
          setExpenseModal(false);
          setEditExpense(null);
        }}
        style={modalStyle}
      >
        <h2 style={{ color: "#333", marginBottom: "16px" }}>
          {editExpense ? "Edit Expense" : "Add Expenses"}
        </h2>
        <form onSubmit={handleAddExpense}>
          <input
            name="title"
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
            required
          >
            <option value="">Select category</option>
            <option value="Food">Food</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Travel">Travel</option>
          </select>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              marginBottom: "16px",
              boxSizing: "border-box",
            }}
            required
          />
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              style={{
                flex: 1,
                backgroundColor: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {editExpense ? "Update Expense" : "Add Expense"}
            </button>
            <button
              type="button"
              onClick={() => {
                setExpenseModal(false);
                setEditExpense(null);
              }}
              style={{
                flex: 1,
                backgroundColor: "#9ca3af",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "10px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <ExpenseTracker />
    </SnackbarProvider>
  );
}
