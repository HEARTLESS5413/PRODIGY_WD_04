import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, LocateFixed, RefreshCw, Search, Sparkles } from "lucide-react";
import { searchLocations } from "../lib/weatherApi";

function buzz() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(14);
  }
}

export default function SearchBar({
  onSearch,
  onUseLocation,
  onRefresh,
  isRefreshing,
  disabled,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      setSuggestions([]);
      setIsSearching(false);
      return undefined;
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);

      try {
        const results = await searchLocations(query);
        setSuggestions(results.slice(0, 6));
        setIsOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!query.trim() || disabled) {
      return;
    }

    buzz();
    try {
      await onSearch(query.trim());
    } catch {
      return;
    }
    setIsOpen(false);
    setSuggestions([]);
    setQuery("");
  }

  async function handleSuggestionSelect(suggestion) {
    if (disabled) {
      return;
    }

    const selectedQuery = `${suggestion.lat},${suggestion.lon}`;
    buzz();
    try {
      await onSearch(selectedQuery);
    } catch {
      return;
    }
    setIsOpen(false);
    setSuggestions([]);
    setQuery("");
  }

  return (
    <div ref={wrapperRef} className="relative z-50">
      <form
        onSubmit={handleSubmit}
        className="glass-panel flex flex-col gap-4 rounded-[28px] p-4 shadow-glass sm:flex-row sm:items-center sm:gap-3 sm:p-5"
      >
        <div className="glass-subtle flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-4 py-3">
          <Search className="h-4 w-4 text-slate-300" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search any city, region, or coordinates"
            disabled={disabled}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
          />
          {isSearching ? (
            <LoaderCircle className="h-4 w-4 animate-spin text-sky-300" />
          ) : (
            <Sparkles className="h-4 w-4 text-sky-300/70" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => {
              buzz();
              onUseLocation().catch(() => {});
            }}
            disabled={disabled}
            className="icon-button"
            aria-label="Use current location"
          >
            <LocateFixed className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              buzz();
              onRefresh().catch(() => {});
            }}
            disabled={disabled}
            className="icon-button"
            aria-label="Refresh weather"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="glass-panel absolute left-0 right-0 top-[calc(100%+12px)] z-[60] overflow-hidden rounded-[24px] p-2 shadow-glass"
          >
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.id}-${suggestion.lat}-${suggestion.lon}`}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/8"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{suggestion.name}</p>
                  <p className="text-xs text-slate-400">
                    {suggestion.region ? `${suggestion.region}, ` : ""}
                    {suggestion.country}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  {suggestion.lat.toFixed(1)}, {suggestion.lon.toFixed(1)}
                </span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
