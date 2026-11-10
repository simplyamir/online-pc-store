
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Boxes,
  Monitor,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Search,
  RefreshCw,
  Database,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  Save,
  ArrowUpRight,
  Activity,
  ShieldCheck,
  ChevronRight,
  LogIn,
  LogOut,
  LockKeyhole,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? ""
    : "http://localhost:3001");

// ==================================================
// DATABASE SECTIONS
// ==================================================

const sections = [
  {
    id: "categories",
    title: "Categories",
    icon: Boxes,
    columns: [
      ["category_id", "ID"],
      ["category_name", "Category"],
      ["description", "Description"],
    ],
  },
  {
    id: "products",
    title: "Products",
    icon: Monitor,
    columns: [
      ["product_id", "ID"],
      ["category_id", "Category ID"],
      ["product_name", "Product"],
      ["brand", "Brand"],
      ["price", "Price"],
      ["stock_quantity", "Stock"],
      ["warranty_months", "Warranty"],
    ],
  },
  {
    id: "customers",
    title: "Customers",
    icon: Users,
    columns: [
      ["customer_id", "ID"],
      ["first_name", "First Name"],
      ["last_name", "Last Name"],
      ["email", "Email"],
      ["phone", "Phone"],
      ["address", "Address"],
    ],
  },
  {
    id: "orders",
    title: "Orders",
    icon: ShoppingCart,
    columns: [
      ["order_id", "ID"],
      ["customer_id", "Customer ID"],
      ["order_date", "Date"],
      ["status", "Status"],
    ],
  },
  {
    id: "order_items",
    title: "Order Items",
    icon: Package,
    columns: [
      ["order_item_id", "ID"],
      ["order_id", "Order ID"],
      ["product_id", "Product ID"],
      ["quantity", "Quantity"],
      ["unit_price", "Unit Price"],
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    columns: [
      ["payment_id", "ID"],
      ["order_id", "Order ID"],
      ["payment_date", "Date"],
      ["amount", "Amount"],
      ["payment_method", "Method"],
      ["payment_status", "Status"],
    ],
  },
];

const editableFields = {
  categories: ["category_name", "description"],
  products: [
    "category_id",
    "product_name",
    "brand",
    "price",
    "stock_quantity",
    "warranty_months",
  ],
  customers: [
    "first_name",
    "last_name",
    "email",
    "phone",
    "address",
  ],
  orders: ["customer_id", "order_date", "status"],
  order_items: [
    "order_id",
    "product_id",
    "quantity",
    "unit_price",
  ],
  payments: [
    "order_id",
    "payment_date",
    "amount",
    "payment_method",
    "payment_status",
  ],
};

const requiredFields = {
  categories: ["category_name"],
  products: ["category_id", "product_name", "price"],
  customers: ["first_name", "last_name", "email"],
  orders: ["customer_id"],
  order_items: [
    "order_id",
    "product_id",
    "quantity",
    "unit_price",
  ],
  payments: ["order_id", "amount"],
};

const numericFields = new Set([
  "category_id",
  "customer_id",
  "order_id",
  "product_id",
  "price",
  "stock_quantity",
  "warranty_months",
  "quantity",
  "unit_price",
  "amount",
]);

const moneyFields = new Set([
  "price",
  "unit_price",
  "amount",
]);

const dateFields = new Set([
  "order_date",
  "payment_date",
]);

// ==================================================
// HELPERS
// ==================================================

function formatCell(key, value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (moneyFields.has(key)) {
    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (dateFields.has(key)) {
    return String(value).slice(0, 10);
  }

  return String(value);
}

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      result.error ||
      `Request failed (${response.status})`
    );

    error.status = response.status;
    throw error;
  }

  return result;
}

// ==================================================
// LOGIN PAGE
// ==================================================

function LoginPage({ onLogin, theme, onToggleTheme }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const result = await readResponse(response);

      setPassword("");
      onLogin(result.user);
    } catch (err) {
      setError(
        err.message || "Unable to connect to the backend"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 text-white">
      <AmbientBackground />
      <button
        type="button"
        onClick={onToggleTheme}
        className="theme-toggle absolute right-5 top-5 z-20"
        aria-label={
          theme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        title={
          theme === "dark"
            ? "Light mode"
            : "Dark mode"
        }
      >
        {theme === "dark" ? (
          <Sun size={20} />
        ) : (
          <Moon size={20} />
        )}
      </button>

      <div className="relative w-full max-w-md">
        <div className="mb-9 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/30 bg-cyan-400/10 text-[#00F5FF] shadow-[0_0_45px_rgba(0,245,255,0.16)]">
            <Database size={36} />
          </div>

          <h1 className="text-4xl font-black tracking-tight">
            PC<span className="text-cyan-glow">STORE</span>
          </h1>

          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#779FA5]">
            Admin Control Center
          </p>
        </div>

        <div className="liquid-glass relative overflow-hidden rounded-3xl p-7 sm:p-9">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-36 w-2/3 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs text-[#00F5FF]">
              <LockKeyhole size={13} />
              Restricted Access
            </div>

            <h2 className="text-2xl font-bold">
              Admin Login
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#8BA9AE]">
              Sign in to manage your store database.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="relative mb-6 rounded-xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-300"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="relative space-y-5"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#B8D4D8]">
                Username
              </span>

              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Enter admin username"
                required
                maxLength={100}
                className="glass-input w-full rounded-xl px-4 py-3.5"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#B8D4D8]">
                Password
              </span>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter admin password"
                  required
                  className="glass-input w-full rounded-xl py-3.5 pl-4 pr-12"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#86AEB4] transition-colors hover:text-[#00F5FF]"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-cyan mt-3 flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                  <ArrowUpRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="relative mt-8 flex items-center justify-center gap-2 border-t border-cyan-400/10 pt-6 text-xs text-[#789CA2]">
            <ShieldCheck
              size={15}
              className="text-[#00F5FF]"
            />
            Protected admin workspace
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-[#557D83]">
          Online PC Store • Amaliyot №15
        </p>
      </div>
    </div>
  );
}

// ==================================================
// STATUS BADGE
// ==================================================

function StatusBadge({ value }) {
  const text = String(value || "Unknown");
  const normalized = text.toLowerCase();

  const isPositive = [
    "completed",
    "paid",
    "delivered",
    "success",
  ].includes(normalized);

  const isNegative = [
    "failed",
    "cancelled",
    "canceled",
    "refunded",
  ].includes(normalized);

  const colors = isPositive
    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
    : isNegative
      ? "border-rose-400/25 bg-rose-400/10 text-rose-300"
      : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${colors}`}
    >
      {text}
    </span>
  );
}

// ==================================================
// SIDEBAR BUTTON
// ==================================================

function NavButton({
  icon: Icon,
  title,
  active,
  count,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition-all duration-200 ${active
        ? "border-cyan-400/30 bg-cyan-400/10 text-[#00F5FF] shadow-[0_0_25px_rgba(0,245,255,0.08)]"
        : "border-transparent text-[#8AA5AA] hover:border-cyan-400/10 hover:bg-cyan-400/5 hover:text-white"
        }`}
    >
      <span className="flex items-center gap-3">
        <Icon
          size={18}
          className={
            active
              ? "text-[#00F5FF]"
              : "text-[#6D9298] group-hover:text-[#00F5FF]"
          }
        />
        {title}
      </span>

      {count !== undefined && (
        <span
          className={`rounded-md px-2 py-0.5 text-xs ${active
            ? "bg-cyan-400/10 text-[#00F5FF]"
            : "bg-white/5 text-[#78969B]"
            }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ==================================================
// STATISTICS CARD
// ==================================================

function StatCard({
  label,
  value,
  icon: Icon,
  subtitle,
}) {
  return (
    <div className="liquid-glass group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_0_35px_rgba(0,245,255,0.12)]">
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl transition-all group-hover:bg-cyan-400/20" />

      <div className="relative flex items-center justify-between">
        <p className="text-sm text-[#89A9AE]">
          {label}
        </p>

        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-[#00F5FF]">
          <Icon size={21} />
        </div>
      </div>

      <p className="relative mt-5 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="relative mt-2 text-xs text-[#6F9399]">
        {subtitle}
      </p>
    </div>
  );
}

// ==================================================
// CREATE / EDIT MODAL
// ==================================================

function RecordModal({
  table,
  record,
  onClose,
  onSaved,
  onUnauthorized,
}) {
  const section = sections.find(
    (item) => item.id === table
  );

  const fields = editableFields[table];
  const isEditing = record !== null;

  const [form, setForm] = useState(() =>
    Object.fromEntries(
      fields.map((field) => [
        field,
        record?.[field] == null
          ? ""
          : dateFields.has(field)
            ? String(record[field]).slice(0, 10)
            : String(record[field]),
      ])
    )
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const idField = section.columns[0][0];

    const url = isEditing
      ? `${API_URL}/api/${table}/${record[idField]}`
      : `${API_URL}/api/${table}`;

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      await readResponse(response);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-modal-title"
        className="liquid-glass relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl p-6 shadow-[0_0_80px_rgba(0,245,255,0.08)] sm:p-8"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-2/3 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#00F5FF]">
              Database Editor
            </p>

            <h3
              id="record-modal-title"
              className="text-2xl font-bold text-white"
            >
              {isEditing ? "Edit" : "Add New"}{" "}
              {section.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close form"
            className="btn-glass rounded-xl p-2.5 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300"
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="relative space-y-5"
        >
          {fields.map((field) => {
            const isDate = dateFields.has(field);
            const isNumber = numericFields.has(field);
            const isRequired =
              requiredFields[table].includes(field);

            const label = field.replaceAll("_", " ");

            return (
              <label key={field} className="block">
                <span className="mb-2 block text-sm font-medium capitalize text-[#B5D0D4]">
                  {label}
                  {isRequired && (
                    <span className="ml-1 text-[#00F5FF]">
                      *
                    </span>
                  )}
                </span>

                {field === "description" ||
                  field === "address" ? (
                  <textarea
                    value={form[field]}
                    required={isRequired}
                    rows={3}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        [field]: event.target.value,
                      }))
                    }
                    className="glass-input w-full rounded-xl px-4 py-3"
                  />
                ) : (
                  <input
                    type={
                      isDate
                        ? "date"
                        : isNumber
                          ? "number"
                          : field === "email"
                            ? "email"
                            : "text"
                    }
                    step={
                      moneyFields.has(field)
                        ? "0.01"
                        : undefined
                    }
                    min={
                      isNumber
                        ? [
                          "category_id",
                          "customer_id",
                          "order_id",
                          "product_id",
                          "quantity",
                        ].includes(field)
                          ? 1
                          : 0
                        : undefined
                    }
                    required={isRequired}
                    value={form[field]}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        [field]: event.target.value,
                      }))
                    }
                    className="glass-input w-full rounded-xl px-4 py-3 schema-dark"
                  />
                )}
              </label>
            );
          })}

          <div className="flex flex-wrap justify-end gap-3 border-t border-cyan-400/10 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-glass rounded-xl px-5 py-3 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-cyan flex items-center gap-2 rounded-xl px-5 py-3 disabled:opacity-50"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================================================
// BACKROUND
// ==================================================

function AmbientBackground() {
  return (
    <div className="pcstore-ambient" aria-hidden="true">
      <div className="pcstore-ambient-grid" />
      <div className="pcstore-orb pcstore-orb-one" />
      <div className="pcstore-orb pcstore-orb-two" />
      <div className="pcstore-ambient-ring" />
    </div>
  );
}

// ==================================================
// MAIN APPLICATION
// ==================================================

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("pcstore-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    document.documentElement.classList.toggle(
      "light",
      theme === "light"
    );

    try {
      localStorage.setItem("pcstore-theme", theme);
    } catch {
      // Continue even if browser storage is unavailable.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((previous) =>
      previous === "dark" ? "light" : "dark"
    );
  }
  // Authentication
  const [admin, setAdmin] = useState(null);
  const [checkingSession, setCheckingSession] =
    useState(true);

  // Dashboard
  const [active, setActive] = useState("overview");
  const [data, setData] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // --------------------------------------------------
  // CHECK EXISTING LOGIN SESSION
  // --------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          setAdmin(null);
          return;
        }

        const result = await response.json();
        setAdmin(result.user);
      } catch (err) {
        if (err.name !== "AbortError") {
          setAdmin(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => controller.abort();
  }, []);

  // --------------------------------------------------
  // RESET SESSION STATE
  // --------------------------------------------------

  function handleUnauthorized() {
    setAdmin(null);
    setData({});
    setActive("overview");
    setSearch("");
    setError("");
    setActionError("");
    setModal(null);
    setMobileMenu(false);
  }

  // --------------------------------------------------
  // LOAD DATABASE DATA AFTER LOGIN
  // --------------------------------------------------

  useEffect(() => {
    if (!admin) {
      return;
    }

    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.all(
          sections.map(async (section) => {
            const response = await fetch(
              `${API_URL}/api/${section.id}`,
              {
                signal: controller.signal,
                credentials: "include",
              }
            );

            if (response.status === 401) {
              const authError = new Error(
                "Session expired"
              );
              authError.status = 401;
              throw authError;
            }

            const rows = await readResponse(response);

            return [section.id, rows];
          })
        );

        if (!controller.signal.aborted) {
          setData(Object.fromEntries(results));
        }
      } catch (err) {
        if (
          err.name === "AbortError" ||
          controller.signal.aborted
        ) {
          return;
        }

        if (err.status === 401) {
          handleUnauthorized();
        } else {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, [admin, refreshKey]);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  async function handleLogout() {
    setLoggingOut(true);
    setActionError("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      await readResponse(response);
      handleUnauthorized();
    } catch (err) {
      setActionError(
        err.message || "Failed to log out"
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // --------------------------------------------------
  // DASHBOARD CALCULATIONS
  // --------------------------------------------------

  const currentSection = sections.find(
    (section) => section.id === active
  );

  const rows = data[active] || [];

  const filteredRows = rows.filter((row) =>
    Object.values(row).some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  const totalRecords = sections.reduce(
    (total, section) =>
      total + (data[section.id]?.length || 0),
    0
  );

  const totalStock = (data.products || []).reduce(
    (total, product) =>
      total + Number(product.stock_quantity || 0),
    0
  );

  const totalRevenue = (data.payments || [])
    .filter(
      (payment) =>
        String(
          payment.payment_status
        ).toLowerCase() === "paid"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  function navigate(section) {
    setActive(section);
    setSearch("");
    setActionError("");
    setMobileMenu(false);
  }

  function refreshData() {
    setRefreshKey((key) => key + 1);
  }

  // --------------------------------------------------
  // DELETE RECORD
  // --------------------------------------------------

  async function deleteRecord(row) {
    if (!currentSection) return;

    const idField =
      currentSection.columns[0][0];

    const id = row[idField];

    const confirmed = window.confirm(
      `Delete record #${id} from ${currentSection.title}? This cannot be undone.`
    );

    if (!confirmed) return;

    setActionError("");
    setDeletingId(id);

    try {
      const response = await fetch(
        `${API_URL}/api/${active}/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      await readResponse(response);
      refreshData();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // --------------------------------------------------
  // AUTHENTICATION SCREENS
  // --------------------------------------------------

  if (checkingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-black text-[#00F5FF]">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 shadow-[0_0_40px_rgba(0,245,255,0.12)]">
          <Database size={34} />
        </div>

        <RefreshCw
          size={25}
          className="animate-spin"
        />

        <p className="text-sm text-[#8AB3B9]">
          Checking admin session...
        </p>
      </div>
    );
  }

  if (!admin) {
    return (
      <LoginPage
        onLogin={setAdmin}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // ==================================================
  // AUTHENTICATED DASHBOARD
  // ==================================================

  return (
    <div className="relative flex min-h-screen text-white">
      <AmbientBackground />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-cyan-400/10 bg-black/90 backdrop-blur-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileMenu
          ? "translate-x-0"
          : "-translate-x-full"
          }`}
      >
        <div className="flex h-24 shrink-0 items-center justify-between border-b border-cyan-400/10 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-300/40 bg-cyan-400/10 p-3 text-[#00F5FF] shadow-[0_0_25px_rgba(0,245,255,0.18)]">
              <Database size={23} />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-wide">
                PC<span className="text-cyan-glow">STORE</span>
              </h1>

              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#73979D]">
                Admin Control
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu(false)}
            className="btn-glass rounded-lg p-2 lg:hidden"
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#547A80]">
            Workspace
          </p>

          <NavButton
            icon={LayoutDashboard}
            title="Overview"
            active={active === "overview"}
            onClick={() => navigate("overview")}
          />

          <p className="px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.25em] text-[#547A80]">
            Database Management
          </p>

          {sections.map((section) => (
            <NavButton
              key={section.id}
              icon={section.icon}
              title={section.title}
              active={active === section.id}
              count={data[section.id]?.length}
              onClick={() => navigate(section.id)}
            />
          ))}
        </nav>

        <div className="shrink-0 border-t border-cyan-400/10 p-5">
          <div className="liquid-glass rounded-xl p-4">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${error
                  ? "bg-rose-400"
                  : "bg-[#00F5FF] shadow-[0_0_12px_#00F5FF]"
                  }`}
              />

              <span className="text-xs font-semibold text-[#C1E4E8]">
                {error
                  ? "API Connection Error"
                  : "Admin Session Active"}
              </span>
            </div>

            <p className="mt-2 text-[11px] text-[#65888E]">
              Signed in as {admin.username}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative z-10 min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-cyan-400/10 bg-black/75 px-5 backdrop-blur-xl lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenu(true)}
              className="btn-glass rounded-xl p-2.5 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                {active === "overview"
                  ? "Dashboard Overview"
                  : currentSection?.title}
              </h2>

              <p className="mt-1 hidden text-xs text-[#6F959B] sm:block">
                Online PC Store / Admin Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                theme === "dark"
                  ? "Light mode"
                  : "Dark mode"
              }
              aria-pressed={theme === "light"}
            >
              {theme === "dark" ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            <div className="hidden items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-2 text-xs text-[#9ED3D8] md:flex">
              <Activity
                size={14}
                className="text-[#00F5FF]"
              />
              System Dashboard
            </div>

            <button
              type="button"
              onClick={refreshData}
              disabled={loading}
              className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
              title="Logout"
            >
              <LogOut size={16} />

              <span className="hidden sm:inline">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-5 lg:p-10">
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-300"
            >
              {error}
            </div>
          )}

          {actionError && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-300"
            >
              {actionError}
            </div>
          )}

          {active === "overview" ? (
            <>
              {/* Overview Heading */}
              <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#00F5FF]">
                    <span className="h-px w-6 bg-[#00F5FF]" />
                    Control Center
                  </div>

                  <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
                    Welcome to{" "}
                    <span className="text-cyan-glow">
                      PC Store
                    </span>
                  </h3>

                  <p className="mt-3 text-sm text-[#85A6AC]">
                    Manage your inventory, customers,
                    orders, and payments in one place.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs text-[#A6D8DD]">
                  <ShieldCheck
                    size={15}
                    className="text-[#00F5FF]"
                  />
                  Authenticated Admin
                </div>
              </div>

              {/* Statistics */}
              <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total Products"
                  value={data.products?.length || 0}
                  icon={Monitor}
                  subtitle="Products in catalog"
                />

                <StatCard
                  label="Customers"
                  value={data.customers?.length || 0}
                  icon={Users}
                  subtitle="Registered customers"
                />

                <StatCard
                  label="Orders"
                  value={data.orders?.length || 0}
                  icon={ShoppingCart}
                  subtitle="Orders in database"
                />

                <StatCard
                  label="Total Stock"
                  value={totalStock.toLocaleString()}
                  icon={Package}
                  subtitle="Units available"
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
                {/* Tables */}
                <div className="liquid-glass rounded-3xl p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#00F5FF]">
                        Quick Access
                      </p>

                      <h4 className="text-xl font-bold">
                        Database Tables
                      </h4>
                    </div>

                    <Database
                      size={21}
                      className="text-[#00F5FF]"
                    />
                  </div>

                  <div className="space-y-3">
                    {sections.map((section) => (
                      <button
                        type="button"
                        key={section.id}
                        onClick={() =>
                          navigate(section.id)
                        }
                        className="pcstore-glass-row group flex w-full items-center justify-between rounded-2xl p-4 text-left"
                      >
                        <span className="flex items-center gap-3">
                          <span className="rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-2.5 text-[#00F5FF]">
                            <section.icon size={18} />
                          </span>

                          <span>
                            <span className="block text-sm font-semibold text-white">
                              {section.title}
                            </span>

                            <span className="mt-1 block text-xs text-[#72949A]">
                              {data[section.id]?.length || 0}{" "}
                              records
                            </span>
                          </span>
                        </span>

                        <ChevronRight
                          size={18}
                          className="text-[#62888E] transition-transform group-hover:translate-x-1 group-hover:text-[#00F5FF]"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Revenue & Records */}
                <div className="space-y-6">
                  <div className="liquid-glass relative overflow-hidden rounded-3xl p-7">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-sm text-[#8FB3B8]">
                          Completed Payment Revenue
                        </p>

                        <p className="mt-5 break-all text-3xl font-black tracking-tight text-white sm:text-4xl">
                          $
                          {totalRevenue.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-[#00F5FF]">
                        <ArrowUpRight size={22} />
                      </div>
                    </div>

                    <div className="relative mt-7 flex items-center gap-2 border-t border-cyan-400/10 pt-5 text-xs text-[#84A9AE]">
                      <Activity
                        size={15}
                        className="text-[#00F5FF]"
                      />
                      Payments marked as completed
                    </div>
                  </div>

                  <div className="liquid-glass rounded-3xl p-7">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#8FB3B8]">
                        Total Database Records
                      </p>

                      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-[#00F5FF]">
                        <Database size={21} />
                      </div>
                    </div>

                    <p className="mt-5 text-4xl font-black text-cyan-glow">
                      {totalRecords.toLocaleString()}
                    </p>

                    <p className="mt-3 text-xs text-[#73979D]">
                      Across all six core tables
                    </p>
                  </div>

                  <div className="liquid-glass rounded-3xl p-7">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00F5FF]">
                      System
                    </p>

                    <h4 className="mt-3 text-lg font-bold">
                      Full Database Control
                    </h4>

                    <p className="mt-3 text-sm leading-6 text-[#86A9AE]">
                      Browse records, search data, and
                      perform create, update, and delete
                      operations directly from your
                      dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Table Page Heading */}
              <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#00F5FF]">
                    Database / {currentSection?.id}
                  </p>

                  <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
                    {currentSection?.title}
                  </h3>

                  <p className="mt-3 text-sm text-[#85A6AC]">
                    Browse, search, add, edit, and
                    delete database records.
                  </p>
                </div>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-[#00F5FF]">
                  {rows.length} records
                </span>
              </div>

              {/* Data Table */}
              <div className="liquid-glass overflow-hidden rounded-3xl">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-400/10 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <h4 className="text-lg font-bold">
                      {currentSection?.title} Table
                    </h4>

                    <button
                      type="button"
                      onClick={() => {
                        setActionError("");
                        setModal({
                          table: active,
                          record: null,
                        });
                      }}
                      className="btn-cyan flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
                    >
                      <Plus size={17} />
                      Add New
                    </button>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7EA9AF]"
                    />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search records..."
                      className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                    />
                  </div>
                </div>

                {loading && !rows.length ? (
                  <div className="flex items-center gap-3 p-8 text-[#8EB4BA]">
                    <RefreshCw
                      size={18}
                      className="animate-spin text-[#00F5FF]"
                    />
                    Loading records...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-cyan-400/5.5 text-[#8EB6BB]">
                        <tr>
                          {currentSection?.columns.map(
                            ([key, label]) => (
                              <th
                                key={key}
                                className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider"
                              >
                                {label}
                              </th>
                            )
                          )}

                          <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredRows.map((row, index) => {
                          const idField =
                            currentSection.columns[0][0];

                          return (
                            <tr
                              key={row[idField] ?? index}
                              className="border-t border-cyan-400/[0.07] transition-colors hover:bg-cyan-400/5.5"
                            >
                              {currentSection.columns.map(
                                ([key]) => (
                                  <td
                                    key={key}
                                    className="max-w-xs whitespace-nowrap px-5 py-4 text-[#C3D7DA]"
                                  >
                                    {key === "status" ||
                                      key ===
                                      "payment_status" ? (
                                      <StatusBadge
                                        value={row[key]}
                                      />
                                    ) : (
                                      formatCell(
                                        key,
                                        row[key]
                                      )
                                    )}
                                  </td>
                                )
                              )}

                              <td className="whitespace-nowrap px-5 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionError("");
                                      setModal({
                                        table: active,
                                        record: row,
                                      });
                                    }}
                                    className="btn-glass rounded-lg p-2.5"
                                    title="Edit record"
                                    aria-label="Edit record"
                                  >
                                    <Pencil size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteRecord(row)
                                    }
                                    disabled={
                                      deletingId ===
                                      row[idField]
                                    }
                                    className="rounded-lg border border-rose-400/15 bg-rose-400/5 p-2.5 text-rose-300 transition-all hover:border-rose-400/40 hover:bg-rose-400/15 hover:shadow-[0_0_18px_rgba(251,113,133,0.15)] disabled:opacity-50"
                                    title="Delete record"
                                    aria-label="Delete record"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {filteredRows.length === 0 && (
                      <div className="p-12 text-center">
                        <Search
                          size={30}
                          className="mx-auto mb-4 text-[#4E8189]"
                        />

                        <p className="text-[#A0C0C5]">
                          No records found.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenu && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <RecordModal
          key={`${modal.table}-${modal.record
            ? modal.record[
            sections.find(
              (section) =>
                section.id === modal.table
            ).columns[0][0]
            ]
            : "new"
            }`}
          table={modal.table}
          record={modal.record}
          onClose={() => setModal(null)}
          onUnauthorized={handleUnauthorized}
          onSaved={() => {
            setModal(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
}

export default App;
