"use client";

import { useState, useEffect, useCallback } from "react";

type ApiFn = (url: string, options?: RequestInit) => Promise<Record<string, unknown> | null>;
type ApptFilter = "today" | "upcoming" | "past";

interface Appointment {
  id: string;
  service_id: string;
  customer_name: string;
  customer_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${(h % 12) || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-green-500/20 text-green-400",
    completed: "bg-blue-500/20 text-blue-400",
    cancelled: "bg-red-500/20 text-red-400",
    no_show: "bg-gray-500/20 text-gray-400",
  };
  return (
    <span className={`px-2 py-0.5 text-xs uppercase tracking-wider ${colors[status] || "bg-brand-gray text-brand-muted"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function AppointmentsManager({ api }: { api: ApiFn }) {
  const [apptFilter, setApptFilter] = useState<ApptFilter>("today");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api(`/api/admin/appointments?filter=${apptFilter}`);
    if (data) setAppointments((data.appointments as Appointment[]) || []);
    setLoading(false);
  }, [api, apptFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await api("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  const chargeLateFee = async (id: string) => {
    setActionLoading(id + "-late");
    setActionMsg(null);
    const res = await api("/api/admin/charge-late-fee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id }),
    });
    setActionLoading(null);
    setActionMsg({ id, msg: res ? "$10 late fee charged." : "Charge failed — no card on file.", ok: !!res });
  };

  const chargeCancelFee = async (id: string) => {
    setActionLoading(id + "-cancel");
    setActionMsg(null);
    const res = await api("/api/admin/charge-cancel-fee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id }),
    });
    setActionLoading(null);
    setActionMsg({ id, msg: res ? "$5 cancel fee charged." : "Charge failed — no card on file.", ok: !!res });
  };

  const refundPayment = async (id: string) => {
    setActionLoading(id + "-refund");
    setActionMsg(null);
    const res = await api("/api/admin/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id }),
    });
    setActionLoading(null);
    setActionMsg({ id, msg: res ? "Refund issued." : "Refund failed.", ok: !!res });
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(["today", "upcoming", "past"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setApptFilter(f)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
              apptFilter === f ? "bg-brand-gray text-brand-white" : "text-brand-muted hover:text-brand-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-brand-muted py-8 text-center">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="text-brand-muted py-8 text-center">No {apptFilter} appointments.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="bg-brand-charcoal border border-white/5 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-brand-white font-semibold">{a.customer_name}</span>
                  <StatusBadge status={a.status} />
                  {a.stripe_payment_method_id && (
                    <span className="px-2 py-0.5 text-xs bg-brand-gold/20 text-brand-gold">Card on file</span>
                  )}
                </div>
                <span className="text-brand-muted text-sm">
                  {new Date(a.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} &middot; {formatTime(a.start_time)} — {formatTime(a.end_time)}
                </span>
              </div>

              <div className="text-sm text-brand-muted space-y-0.5">
                {a.customer_phone && <p>Phone: {a.customer_phone}</p>}
                {a.notes && <p>Notes: {a.notes}</p>}
              </div>

              {/* Status actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {a.status === "pending" && (
                  <>
                    <button onClick={() => updateStatus(a.id, "confirmed")} className="px-3 py-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">Confirm</button>
                    <button onClick={() => updateStatus(a.id, "cancelled")} className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Cancel</button>
                  </>
                )}
                {a.status === "confirmed" && (
                  <>
                    <button onClick={() => updateStatus(a.id, "completed")} className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">Complete</button>
                    <button onClick={() => updateStatus(a.id, "no_show")} className="px-3 py-1 text-xs bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors">No Show</button>
                    <button onClick={() => updateStatus(a.id, "cancelled")} className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Cancel</button>
                  </>
                )}
              </div>

              {/* Charge actions — always show, disabled if no card */}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => chargeLateFee(a.id)}
                  disabled={!a.stripe_payment_method_id || actionLoading === a.id + "-late"}
                  className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {actionLoading === a.id + "-late" ? "Charging..." : "Charge $10 Late Fee"}
                </button>
                <button
                  onClick={() => chargeCancelFee(a.id)}
                  disabled={!a.stripe_payment_method_id || actionLoading === a.id + "-cancel"}
                  className="px-3 py-1 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {actionLoading === a.id + "-cancel" ? "Charging..." : "Charge $5 Cancel Fee"}
                </button>
                {a.stripe_payment_intent_id && (
                  <button
                    onClick={() => refundPayment(a.id)}
                    disabled={actionLoading === a.id + "-refund"}
                    className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-30"
                  >
                    {actionLoading === a.id + "-refund" ? "Refunding..." : "Refund Deposit"}
                  </button>
                )}
              </div>

              {actionMsg?.id === a.id && (
                <p className={`mt-2 text-xs ${actionMsg.ok ? "text-green-400" : "text-red-400"}`}>{actionMsg.msg}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
