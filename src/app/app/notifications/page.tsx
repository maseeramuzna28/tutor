"use client";

import { useState } from "react";
import useAsync from "@/hooks/useAsync";
import { useRole } from "@/context/RoleContext";
import { notifications } from "@/services";
import PageHeader from "@/components/ui/PageHeader";
import Tabs, { TabPanel } from "@/components/ui/Tabs";
import { Loading, ErrorState, Empty } from "@/components/ui/States";
import { timeAgo } from "@/utils/format";

const ping = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tuto:notifications-changed"));
  }
};

export default function NotificationsPage() {
  const { role } = useRole();
  const { data, loading, error, reload, setData } = useAsync(
    () => notifications.list(role),
    [role]
  );
  const [tab, setTab] = useState("all");
  const [fail, setFail] = useState("");

  const markRead = async (id: string) => {
    setFail("");
    try {
      await notifications.markRead(id);
      setData((d: any) =>
        (d || []).map((n: any) => (n.id === id ? { ...n, read: true } : n))
      );
      ping();
    } catch (err: any) {
      setFail(err.message);
    }
  };

  const markAll = async () => {
    setFail("");
    try {
      await notifications.markAllRead(role);
      setData((d: any) => (d || []).map((n: any) => ({ ...n, read: true })));
      ping();
    } catch (err: any) {
      setFail(err.message);
    }
  };

  const items = (data || []).filter((n: any) => tab === "all" || !n.read);
  const unread = (data || []).filter((n: any) => !n.read).length;

  return (
    <>
      <PageHeader
        eyebrow="Shared"
        title="What *happened* while you were away."
        lead="Answers, replies and updates from your courses."
      />
      <div className="app-body">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <Tabs
            idPrefix="notif"
            label="Notification filter"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: "all", label: "All" },
              { id: "unread", label: `Unread (${unread})` },
            ]}
          />
          <button
            type="button"
            className="btn btn--sm"
            onClick={markAll}
            disabled={unread === 0}
          >
            Mark all as read
          </button>
        </div>
        {fail && <p className="notice notice--error" role="alert">{fail}</p>}
        <TabPanel idPrefix="notif" id={tab} value={tab}>
          {loading && <Loading />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {data && items.length === 0 && (
            <Empty
              title="You are all caught up"
              text="New notifications will appear here."
            />
          )}
          <div style={{ maxWidth: "46rem" }}>
            {items.map((n: any) => (
              <div className="note" key={n.id} data-read={n.read ? "true" : "false"}>
                <div>
                  <p>
                    <span className="tag">{n.type}</span>
                  </p>
                  <p style={{ marginTop: 6 }}>{n.text}</p>
                  <p className="meta">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    className="btn-text"
                    onClick={() => markRead(n.id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        </TabPanel>
      </div>
    </>
  );
}
