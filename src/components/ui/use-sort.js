import React from "react";

export function useSort(rows, initial = { key: null, dir: "asc" }) {
  const [sort, setSort] = React.useState(initial);
  const sorted = React.useMemo(() => {
    if (!sort?.key) return rows;
    return [...rows].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      const c =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x ?? "").localeCompare(String(y ?? ""), "zh");
      return sort.dir === "asc" ? c : -c;
    });
  }, [rows, sort]);
  const toggle = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  return { sorted, sort, toggle };
}
