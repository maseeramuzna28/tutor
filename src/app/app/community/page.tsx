"use client";

import { useState } from "react";
import Link from "next/link";
import useAsync from "@/hooks/useAsync";
import { community } from "@/services";
import { MockPost } from "@/services/mockData";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import { Loading, ErrorState, Empty } from "@/components/ui/States";
import { timeAgo } from "@/utils/format";
import RequireRole from "@/components/App/RequireRole";

const TAGS = ["Question", "Discussion", "Resource"];

function PostCard({
  post,
  onUpvote,
  onReply,
}: {
  post: MockPost;
  onUpvote: (id: string) => void;
  onReply: (id: string, text: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 2) {
      setErr("Write a reply first.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await onReply(post.id, text.trim());
      setText("");
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card post">
      <div className="post__head">
        <span className="tag">{post.tag}</span>
        <strong>{post.author}</strong>
        <span className="meta">{timeAgo(post.createdAt)}</span>
      </div>
      <p className="post__body">{post.body}</p>
      <div className="post__actions">
        <button
          type="button"
          className="btn-text"
          aria-pressed={post.upvoted}
          onClick={() => onUpvote(post.id)}
        >
          Helpful ({post.upvotes})
        </button>
        <button
          type="button"
          className="btn-text"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          Replies ({post.replies.length})
        </button>
      </div>
      {open && (
        <div className="replies">
          {post.replies.map((r) => (
            <div key={r.id}>
              <p>
                <strong>{r.author}</strong>{" "}
                <span className="meta">{timeAgo(r.createdAt)}</span>
              </p>
              <p>{r.body}</p>
            </div>
          ))}
          <form className="form" onSubmit={send}>
            <div className="field" data-invalid={err ? "true" : "false"}>
              <label htmlFor={`reply-${post.id}`}>Your reply</label>
              <textarea
                id={`reply-${post.id}`}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {err && <span className="field__error">{err}</span>}
            </div>
            <div>
              <button type="submit" className="btn btn--sm" disabled={busy}>
                {busy ? "Sending" : "Reply"}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}

function CommunityContent() {
  const { data, loading, error, reload, setData } = useAsync(() => community.list(), []);
  const [filter, setFilter] = useState("All");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("Question");
  const [anonymous, setAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 10) {
      setFormError("Write at least 10 characters.");
      return;
    }
    setPosting(true);
    setFormError("");
    setSent(false);
    try {
      const post = await community.create({ body: body.trim(), tag, anonymous });
      setData((d) => [post, ...(d || [])]);
      setBody("");
      setSent(true);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const upvote = async (id: string) => {
    setData((d) =>
      (d || []).map((p) =>
        p.id === id
          ? { ...p, upvoted: !p.upvoted, upvotes: p.upvotes + (p.upvoted ? -1 : 1) }
          : p
      )
    );
    try {
      await community.upvote(id);
    } catch {
      reload();
    }
  };

  const reply = async (id: string, text: string) => {
    const r = await community.reply(id, text);
    setData((d) =>
      (d || []).map((p) => (p.id === id ? { ...p, replies: [...p.replies, r] } : p))
    );
  };

  const visible = (data || []).filter((p) => filter === "All" || p.tag === filter);

  return (
    <>
      <PageHeader
        eyebrow="Student"
        title="The class *feed.*"
        lead="Ask, share and reply. Post anonymously when a question feels too small to sign."
      />
      <div className="app-body">
        <form className="card form" onSubmit={submit} style={{ maxWidth: "46rem" }}>
          <div className="field" data-invalid={formError ? "true" : "false"}>
            <label htmlFor="post-body">New post</label>
            <textarea
              id="post-body"
              value={body}
              maxLength={500}
              onChange={(e) => setBody(e.target.value)}
            />
            {formError && <span className="field__error" role="alert">{formError}</span>}
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="post-tag">Type</label>
              <select
                id="post-tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                {TAGS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              Post anonymously
            </label>
          </div>
          <p className="meta">
            Anonymous hides your name from other users. See the{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link> for how anonymous posts are handled.
          </p>
          {sent && (
            <p className="notice notice--ok" role="status">
              Your post is live in the feed.
            </p>
          )}
          <div>
            <button type="submit" className="btn btn--primary" disabled={posting}>
              {posting ? "Posting" : "Post"}
            </button>
          </div>
        </form>

        <div className="chips" role="group" aria-label="Filter posts">
          {["All", ...TAGS].map((t) => (
            <button
              key={t}
              type="button"
              className="chip"
              aria-pressed={filter === t}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && visible.length === 0 && (
          <Empty title="Nothing here yet" text="Be the first to post in this category." />
        )}
        <div className="grid" style={{ maxWidth: "46rem" }}>
          {visible.map((p) => (
            <Reveal key={p.id}>
              <PostCard post={p} onUpvote={upvote} onReply={reply} />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

export default function CommunityPage() {
  return (
    <RequireRole role="student">
      <CommunityContent />
    </RequireRole>
  );
}
