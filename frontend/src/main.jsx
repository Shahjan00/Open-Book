import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function normalizeBook(book) {
  return {
    id: book.id,
    title: book.title || "Untitled book",
    description: book.description || "",
    rating: book.rating,
    url: book.url,
    imgUrl: book.img_url || "",
    aiSummary: book.ai_summary || "",
    genre: book.genre || "",
  };
}

async function fetchJson(path, options) {
  const headers = {
    ...(options?.body ? { "Content-Type": "application/json" } : {}),
    ...(options?.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();
}

function getBookIdFromPath() {
  const match = window.location.pathname.match(/^\/books\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.88L18.18 21 12 17.75 5.82 21 7 14.15l-5-4.88 6.91-1.01L12 2Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M10.8 4a6.8 6.8 0 1 1 0 13.6 6.8 6.8 0 0 1 0-13.6Zm0 2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm5.2 9.6 4.2 4.2-1.4 1.4-4.2-4.2 1.4-1.4Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M13.2 5.3 19.9 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.1l-4.3-4.3 1.4-1.4Z" />
    </svg>
  );
}

function BookCover({ title, imgUrl, large = false }) {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const sizeClass = large ? "h-64 sm:h-72" : "h-44";

  return (
    <div className={`${sizeClass} w-full overflow-hidden rounded-lg bg-emerald-900 text-stone-50 shadow-sm`}>
      {imgUrl ? (
        <img className="h-full w-full object-cover" src={imgUrl} alt="" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-800 via-stone-800 to-red-700 text-4xl font-black">
          {initials || "OB"}
        </div>
      )}
    </div>
  );
}

function Rating({ value }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-sm font-semibold text-stone-500">No rating</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-800">
      <StarIcon />
      {Number(value).toFixed(1)}
    </span>
  );
}

function BookCard({ book, compact = false }) {
  return (
    <button
      className={`group grid w-full gap-4 rounded-lg border border-stone-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md ${
        compact ? "grid-cols-[82px_minmax(0,1fr)]" : ""
      }`}
      onClick={() => navigateTo(`/books/${book.id}`)}
    >
      {compact ? (
        <div className="h-32 overflow-hidden rounded-md bg-stone-100">
          {book.imgUrl ? (
            <img className="h-full w-full object-cover" src={book.imgUrl} alt="" />
          ) : (
            <div className="flex h-full items-center justify-center bg-emerald-900 text-lg font-black text-white">
              {book.title.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      ) : (
        <BookCover title={book.title} imgUrl={book.imgUrl} />
      )}

      <span className="flex min-w-0 flex-col gap-3">
        <span className="line-clamp-2 text-lg font-black leading-snug text-stone-900">{book.title}</span>
        {!compact && (
          <span className="line-clamp-3 text-sm leading-6 text-stone-600">
            {book.description || "No description available yet."}
          </span>
        )}
        <span className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <Rating value={book.rating} />
          <span className="inline-flex items-center gap-1 text-sm font-bold text-red-700">
            Open
            <ArrowIcon />
          </span>
        </span>
      </span>
    </button>
  );
}

function HomePage({ books, loading, error }) {
  const [query, setQuery] = useState("");
  const filteredBooks = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return books;
    return books.filter((book) => `${book.title} ${book.description}`.toLowerCase().includes(search));
  }, [books, query]);

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 sm:py-12">
      <section className="grid gap-8 border-b border-stone-200 pb-8 lg:grid-cols-[1fr_420px] lg:items-end">
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-red-700">Open Book</p>
          <h1 className="max-w-3xl text-5xl font-black leading-none text-stone-950 sm:text-7xl">
            Books ready for questions.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-600">
            Browse scraped books, open a detail page, and ask the RAG assistant about the indexed collection.
          </p>
        </div>

        <label className="flex h-14 items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 shadow-sm">
          <span className="text-stone-500">
            <SearchIcon />
          </span>
          <input
            className="w-full bg-transparent text-stone-900 outline-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search books"
          />
        </label>
      </section>

      <section className="pt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-stone-950">Library</h2>
          <span className="text-sm font-semibold text-stone-500">{filteredBooks.length} books</span>
        </div>

        {loading && <p className="my-5 text-stone-600">Loading books...</p>}
        {error && <p className="my-5 text-red-700">{error}</p>}
        {!loading && !error && filteredBooks.length === 0 && <p className="my-5 text-stone-600">No books found.</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </main>
  );
}

function QuestionPanel({ book }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askQuestion(event) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;

    setQuestion("");
    setError("");
    setMessages((current) => [...current, { role: "user", text: cleanQuestion }]);
    setLoading(true);

    try {
      const data = await fetchJson("/api/rag/ask/", {
        method: "POST",
        body: JSON.stringify({ question: cleanQuestion }),
      });
      const answer = data.answer || data.Answer || "No answer returned.";
      setMessages((current) => [...current, { role: "assistant", text: answer }]);
    } catch (requestError) {
      setError("Could not get an answer. Check the backend server and API URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:sticky lg:top-5">
      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-red-700">Ask</p>
        <h2 className="line-clamp-2 text-lg font-black text-stone-950">{book.title}</h2>
      </div>

      <div className="mt-5 flex max-h-[420px] min-h-64 flex-col gap-3 overflow-auto rounded-lg border border-stone-100 bg-stone-50 p-3">
        {messages.length === 0 && (
          <div className="grid min-h-44 place-items-center rounded-lg border border-dashed border-stone-300 p-5 text-center text-sm text-stone-500">
            Ask anything about this book or your indexed collection.
          </div>
        )}
        {messages.map((message, index) => (
          <div
            className={`w-fit max-w-[92%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-6 ${
              message.role === "user"
                ? "self-end bg-emerald-800 text-white"
                : "self-start bg-white text-stone-800 shadow-sm"
            }`}
            key={`${message.role}-${index}`}
          >
            {message.text}
          </div>
        ))}
        {loading && <div className="w-fit rounded-lg bg-white px-3 py-2 text-sm text-stone-600 shadow-sm">Thinking...</div>}
      </div>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <form className="mt-4 grid gap-3" onSubmit={askQuestion}>
        <textarea
          className="min-h-28 w-full resize-y rounded-lg border border-stone-200 bg-white p-3 text-stone-900 outline-none focus:border-emerald-700"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Type your question"
          rows="4"
        />
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
          disabled={loading || !question.trim()}
        >
          Ask
          <ArrowIcon />
        </button>
      </form>
    </aside>
  );
}

function DetailPage({ bookId, books, loading, error }) {
  const [book, setBook] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadBook() {
      const existingBook = books.find((candidate) => candidate.id === bookId);
      if (existingBook) {
        setBook(existingBook);
        return;
      }

      setDetailLoading(true);
      setDetailError("");
      try {
        const data = await fetchJson(`/api/books/${bookId}`);
        if (!ignore) setBook(normalizeBook(data));
      } catch (requestError) {
        if (!ignore) setDetailError("Book details could not be loaded.");
      } finally {
        if (!ignore) setDetailLoading(false);
      }
    }

    loadBook();
    return () => {
      ignore = true;
    };
  }, [bookId, books]);

  useEffect(() => {
    let ignore = false;

    async function loadRecommendations() {
      setRecommendationsLoading(true);
      try {
        const data = await fetchJson(`/api/books/${bookId}/related`);
        if (!ignore) setRecommendations(Array.isArray(data) ? data.map(normalizeBook) : []);
      } catch (requestError) {
        if (!ignore) {
          setRecommendations(books.filter((candidate) => candidate.id !== bookId).slice(0, 4));
        }
      } finally {
        if (!ignore) setRecommendationsLoading(false);
      }
    }

    loadRecommendations();
    return () => {
      ignore = true;
    };
  }, [bookId, books]);

  if (loading || detailLoading) {
    return <main className="mx-auto w-[min(1280px,calc(100%-32px))] py-8 text-stone-600">Loading book...</main>;
  }

  if (error || detailError || !book) {
    return (
      <main className="mx-auto w-[min(1280px,calc(100%-32px))] py-8">
        <button className="font-bold text-emerald-800" onClick={() => navigateTo("/")}>Back to library</button>
        <p className="mt-5 text-red-700">{error || detailError || "Book not found."}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-[min(1280px,calc(100%-32px))] py-8">
      <button className="mb-5 font-bold text-emerald-800" onClick={() => navigateTo("/")}>Back to library</button>

      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
        <QuestionPanel book={book} />

        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
            <BookCover title={book.title} imgUrl={book.imgUrl} large />
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-red-700">Reading Room</p>
              <h1 className="text-4xl font-black leading-tight text-stone-950 sm:text-5xl">{book.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Rating value={book.rating} />
                {book.genre && <span className="text-sm font-bold text-red-700">{book.genre}</span>}
                {book.url && (
                  <a className="inline-flex items-center gap-1 text-sm font-bold text-emerald-800" href={book.url} target="_blank" rel="noreferrer">
                    Source
                    <ArrowIcon />
                  </a>
                )}
              </div>
            </div>
          </div>

          {book.aiSummary && (
            <div className="mt-8 border-t border-stone-200 pt-6">
              <h2 className="text-lg font-black text-stone-950">AI Summary</h2>
              <p className="mt-3 max-w-3xl text-base leading-8 text-stone-700">{book.aiSummary}</p>
            </div>
          )}

          <div className="mt-8 border-t border-stone-200 pt-6">
            <h2 className="text-lg font-black text-stone-950">Description</h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-stone-700">{book.description || "No description available yet."}</p>
          </div>
        </article>
      </section>

      <section className="pt-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-stone-950">Recommended Books</h2>
          <span className="text-sm font-semibold text-stone-500">{recommendationsLoading ? "Loading" : `${recommendations.length} shown`}</span>
        </div>
        {recommendationsLoading ? (
          <p className="text-stone-600">Loading recommendations...</p>
        ) : recommendations.length === 0 ? (
          <p className="text-stone-600">Add more books to see recommendations.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((recommendedBook) => (
              <BookCard key={recommendedBook.id} book={recommendedBook} compact />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookId, setBookId] = useState(getBookIdFromPath());

  useEffect(() => {
    function onRouteChange() {
      setBookId(getBookIdFromPath());
    }

    window.addEventListener("popstate", onRouteChange);
    return () => window.removeEventListener("popstate", onRouteChange);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadBooks() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchJson("/api/books/");
        if (!ignore) setBooks(Array.isArray(data) ? data.map(normalizeBook) : []);
      } catch (requestError) {
        if (!ignore) setError("Books could not be loaded. Check the backend server and API URL.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadBooks();
    return () => {
      ignore = true;
    };
  }, []);

  return bookId ? (
    <DetailPage bookId={bookId} books={books} loading={loading} error={error} />
  ) : (
    <HomePage books={books} loading={loading} error={error} />
  );
}

createRoot(document.getElementById("root")).render(<App />);
