import { useEffect, useState } from "react";
import { Loader2, Search, ShieldOff, ShieldCheck } from "lucide-react";
import * as authService from "../../services/authService";

export default function AdminCustomers() {
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => authService.getAllUsers().then(setUsers);

  useEffect(() => {
    load();
  }, []);

  const handleToggleBlock = async (user) => {
    setUpdatingId(user.id);
    try {
      await authService.setUserBlocked(user.id, !user.blocked);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const customers = (users || []).filter((u) => u.role !== "admin");
  const filtered = customers.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full max-w-xs">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-sm"
        />
      </div>

      <div className="card-elevated rounded-3xl overflow-hidden">
        {!users ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="animate-spin text-basil-600" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-ink-soft text-sm py-16">No customers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-soft/60 uppercase tracking-wide border-b border-basil-50">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-basil-50 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-basil-600 text-white flex items-center justify-center text-xs font-semibold">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-ink line-clamp-1">{user.name}</p>
                          <p className="text-xs text-ink-soft/60 line-clamp-1">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{user.phone || "—"}</td>
                    <td className="px-5 py-3 text-ink-soft whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.blocked ? "bg-tomato-100 text-tomato-500" : "bg-basil-50 text-basil-700"
                        }`}
                      >
                        {user.blocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleToggleBlock(user)}
                        disabled={updatingId === user.id}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                          user.blocked
                            ? "text-basil-600 hover:bg-basil-50"
                            : "text-tomato-500 hover:bg-tomato-100/60"
                        }`}
                      >
                        {updatingId === user.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : user.blocked ? (
                          <ShieldCheck size={13} />
                        ) : (
                          <ShieldOff size={13} />
                        )}
                        {user.blocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
