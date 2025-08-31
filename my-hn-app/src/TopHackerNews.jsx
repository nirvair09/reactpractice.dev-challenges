import React, { useEffect, useState } from "react";

const TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const ITEM_URL = (id) =>
  `https://hacker-news.firebaseio.com/v0/item/${id}.json`;

export default function TopHackerNews() {
  const [articles, setArticles] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function loadTop10() {
      setIsLoading(true);
      setError(null);
      setArticles(null);

      try {
        // 1) Fetch top story IDs
        const idsResp = await fetch(TOP_STORIES_URL, { signal });
        if (!idsResp.ok) throw new Error("Failed to load top story IDs");
        const ids = await idsResp.json();

        // 2) Keep first 10
        const first10 = ids.slice(0, 10);

        // 3) Fetch each item's details in parallel
        const detailPromises = first10.map(async (id) => {
          const resp = await fetch(ITEM_URL(id), { signal });
          if (!resp.ok) throw new Error(`Failed to load item ${id}`);
          const json = await resp.json();
          return {
            id: json.id,
            by: json.by,
            score: json.score,
            title: json.title,
            url: json.url,
          };
        });

        const items = await Promise.all(detailPromises);
        setArticles(items);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Unknown error while loading articles");
      } finally {
        setIsLoading(false);
      }
    }

    loadTop10();
    return () => controller.abort();
  }, []);

  if (isLoading) {
    return <p>Loading top Hacker News articles…</p>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return <p>No articles found.</p>;
  }

  return (
    <div className="hn-widget">
      <h2>Top 10 Hacker News Articles</h2>
      <ol>
        {articles.map((a) => (
          <li key={a.id} className="hn-article">
            <div className="hn-meta">
              <span className="hn-score">▲ {a.score}</span>
              <span className="hn-author">by {a.by}</span>
            </div>
            <div className="hn-title">
              {a.url ? (
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  {a.title}
                </a>
              ) : (
                <span>{a.title}</span>
              )}
            </div>
            <div className="hn-url">
              {a.url ? (
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  {new URL(a.url).hostname}
                </a>
              ) : (
                <em>(no external url)</em>
              )}
            </div>
          </li>
        ))}
      </ol>
      <style>{`
        .hn-widget {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          max-width: 720px;
          margin: 12px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
        }
        .hn-meta {
          font-size: 13px;
          color: #6b7280;
          display: flex;
          gap: 12px;
          align-items: baseline;
        }
        .hn-score {
          font-weight: 600;
        }
        .hn-title a {
          color: #111827;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
        }
        .hn-title a:hover {
          text-decoration: underline;
        }
        .hn-url {
          font-size: 13px;
          color: #6b7280;
        }
        li.hn-article {
          margin: 14px 0;
        }
      `}</style>
    </div>
  );
}
