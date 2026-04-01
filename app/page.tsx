"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  PencilLine,
  Plus,
  Share2,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";

type Dish = {
  id: number;
  name: string;
  category: string;
  note: string;
};

type Menu = {
  Maandag: number | "";
  Dinsdag: number | "";
  Woensdag: number | "";
  Donderdag: number | "";
  Vrijdag: number | "";
  Zaterdag: number | "";
  Zondag: number | "";
};

const initialDishes: Dish[] = [
  { id: 1, name: "Nasi kip", category: "Rijst", note: "Met groenten" },
  { id: 2, name: "Bami kip", category: "Noedels", note: "Licht pittig" },
  { id: 3, name: "Pom", category: "Surinaams", note: "Met kip" },
  { id: 4, name: "Roti kip", category: "Surinaams", note: "Kousenband en aardappel" },
  { id: 5, name: "Saoto soep", category: "Soep", note: "Met rijst en ei" },
  { id: 6, name: "Moksi alesi", category: "Rijst", note: "Huisstijl" },
  { id: 7, name: "Pasta kip", category: "Pasta", note: "Romige saus" },
  { id: 8, name: "Gevulde wraps", category: "Snack", note: "Met salade" },
];

const days: Array<keyof Menu> = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
];

const defaultMenu: Menu = {
  Maandag: 1,
  Dinsdag: 2,
  Woensdag: 4,
  Donderdag: 5,
  Vrijdag: 3,
  Zaterdag: 7,
  Zondag: 8,
};

const STORAGE_KEYS = {
  dishes: "perima-weekmenu-dishes",
  menu: "perima-weekmenu-menu",
  houseName: "perima-weekmenu-houseName",
  selectedWeek: "perima-weekmenu-selectedWeek",
  selectedYear: "perima-weekmenu-selectedYear",
};

function getISOWeek(date: Date) {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getMondayOfISOWeek(year: number, week: number) {
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - jan4Day + 1);

  const monday = new Date(mondayWeek1);
  monday.setDate(mondayWeek1.getDate() + (week - 1) * 7);
  return monday;
}

function formatShortDate(date: Date) {
  const dayShort = ["zon", "ma", "di", "wo", "do", "vr", "za"][date.getDay()];
  const monthShort = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"][date.getMonth()];
  return `${dayShort} ${date.getDate()} ${monthShort}`;
}

function getWeekRange(year: number, week: number) {
  const monday = getMondayOfISOWeek(year, week);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${formatShortDate(monday)} t/m ${formatShortDate(sunday)} ${sunday.getFullYear()}`;
}

function safeReadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

const today = new Date();
const currentYear = today.getFullYear();
const currentWeek = getISOWeek(today);

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 font-semibold transition ${
        active ? "bg-yellow-400 text-black" : "bg-black text-yellow-400"
      }`}
    >
      {children}
    </button>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`rounded-3xl border bg-white shadow-sm ${className}`}>{children}</div>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"planner" | "gerechten" | "delen">("planner");
  const [houseName, setHouseName] = useState(() => {
    if (typeof window === "undefined") return "Perima Weekmenu";
    return window.localStorage.getItem(STORAGE_KEYS.houseName) || "Perima Weekmenu";
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    if (typeof window === "undefined") return currentYear;
    const saved = window.localStorage.getItem(STORAGE_KEYS.selectedYear);
    return saved ? Number(saved) : currentYear;
  });
  const [selectedWeek, setSelectedWeek] = useState(() => {
    if (typeof window === "undefined") return currentWeek;
    const saved = window.localStorage.getItem(STORAGE_KEYS.selectedWeek);
    return saved ? Number(saved) : currentWeek;
  });
  const [dishes, setDishes] = useState<Dish[]>(() => safeReadJSON(STORAGE_KEYS.dishes, initialDishes));
  const [menu, setMenu] = useState<Menu>(() => safeReadJSON(STORAGE_KEYS.menu, defaultMenu));
  const [newDish, setNewDish] = useState({ name: "", category: "", note: "" });

  useEffect(() => {
    safeWrite(STORAGE_KEYS.dishes, JSON.stringify(dishes));
  }, [dishes]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.menu, JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.houseName, houseName);
  }, [houseName]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.selectedWeek, String(selectedWeek));
  }, [selectedWeek]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.selectedYear, String(selectedYear));
  }, [selectedYear]);

  const weekLabel = `Week ${selectedWeek}`;
  const weekRangeText = useMemo(() => getWeekRange(selectedYear, selectedWeek), [selectedYear, selectedWeek]);
  const nextId = useMemo(() => (dishes.length ? Math.max(...dishes.map((d) => d.id)) + 1 : 1), [dishes]);

  const dishMap = useMemo(() => {
    const map = new Map<string, Dish>();
    dishes.forEach((dish) => map.set(String(dish.id), dish));
    return map;
  }, [dishes]);

  const shareText = useMemo(() => {
    const lines = days.map((day) => {
      const dish = dishMap.get(String(menu[day]));
      return `${day}: ${dish ? `${dish.id}. ${dish.name}` : "Nog niet ingevuld"}`;
    });
    return `${houseName} - ${weekLabel} (${weekRangeText})\n\n${lines.join("\n")}`;
  }, [dishMap, houseName, menu, weekLabel, weekRangeText]);

  const addDish = () => {
    if (!newDish.name.trim()) return;
    setDishes((current) => [
      ...current,
      {
        id: nextId,
        name: newDish.name.trim(),
        category: newDish.category.trim() || "Overig",
        note: newDish.note.trim(),
      },
    ]);
    setNewDish({ name: "", category: "", note: "" });
  };

  const removeDish = (id: number) => {
    setDishes((current) => current.filter((dish) => dish.id !== id));
    setMenu((current) => {
      const updated = { ...current };
      days.forEach((day) => {
        if (updated[day] === id) {
          updated[day] = "";
        }
      });
      return updated;
    });
  };

  const changeWeekBy = (delta: number) => {
    setSelectedWeek((prevWeek) => {
      let nextWeek = prevWeek + delta;
      let nextYear = selectedYear;

      if (nextWeek < 1) {
        nextWeek = 52;
        nextYear = selectedYear - 1;
      } else if (nextWeek > 52) {
        nextWeek = 1;
        nextYear = selectedYear + 1;
      }

      if (nextYear !== selectedYear) {
        setSelectedYear(nextYear);
      }

      return nextWeek;
    });
  };

  const copyMenu = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Weekmenu gekopieerd. Je kunt het nu delen via WhatsApp of e-mail.");
    } catch {
      alert("Kopiëren lukte niet automatisch.");
    }
  };

  const shareMenu = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: houseName,
          text: shareText,
        });
        return;
      } catch {}
    }

    await copyMenu();
  };

  return (
    <main className="min-h-screen bg-yellow-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
          <Card className="border-2 border-green-600">
            <div className="rounded-t-3xl bg-green-600 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <UtensilsCrossed className="h-6 w-6" />
                    Perima Weekmenu
                  </h1>
                  <p className="mt-2 text-sm text-green-100">
                    Plan per dag een gerechtnummer en deel het menu met je huisgenoten.
                  </p>
                </div>
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">MVP</span>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Naam huishouden / groep</label>
                <input
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Weekkeuze</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeWeekBy(-1)}
                    className="rounded-2xl border border-green-600 px-3 py-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <input
                    value={weekLabel}
                    readOnly
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-center font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => changeWeekBy(1)}
                    className="rounded-2xl border border-green-600 px-3 py-3"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-slate-500">Weeknummer</label>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    >
                      {Array.from({ length: 52 }, (_, index) => index + 1).map((week) => (
                        <option key={week} value={week}>
                          Week {week}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-32">
                    <label className="mb-1 block text-xs text-slate-500">Jaar</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    >
                      {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-sm font-medium text-slate-500">{weekRangeText}</div>
              </div>
            </div>
          </Card>

          <Card className="border-2 border-black">
            <div className="rounded-t-3xl bg-black p-6 text-yellow-400">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <CalendarDays className="h-5 w-5" />
                Snel delen
              </h2>
            </div>
            <div className="space-y-3 p-6">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                onClick={copyMenu}
              >
                <Share2 className="h-4 w-4" />
                Kopieer weekmenu
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-black hover:bg-yellow-300"
                onClick={shareMenu}
              >
                <Share2 className="h-4 w-4" />
                Deel direct
              </button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <TabButton active={activeTab === "planner"} onClick={() => setActiveTab("planner")}>
            Planner
          </TabButton>
          <TabButton active={activeTab === "gerechten"} onClick={() => setActiveTab("gerechten")}>
            Gerechten
          </TabButton>
          <TabButton active={activeTab === "delen"} onClick={() => setActiveTab("delen")}>
            Delen
          </TabButton>
        </div>

        {activeTab === "planner" && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-2 border-green-600">
              <div className="rounded-t-3xl bg-green-600 p-6 text-white">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <PencilLine className="h-5 w-5" />
                  Weekplanning
                </h2>
              </div>
              <div className="grid gap-4 p-6">
                {days.map((day) => {
                  const selectedDish = dishMap.get(String(menu[day]));

                  return (
                    <div
                      key={day}
                      className="grid gap-3 rounded-3xl border border-green-300 p-4 md:grid-cols-[150px_1fr] md:items-center"
                    >
                      <div className="font-medium text-black">{day}</div>
                      <div className="grid gap-2 md:grid-cols-[220px_1fr]">
                        <select
                          value={String(menu[day] || "")}
                          onChange={(e) =>
                            setMenu((current) => ({
                              ...current,
                              [day]: e.target.value ? Number(e.target.value) : "",
                            }))
                          }
                          className="rounded-2xl border border-green-600 px-4 py-3"
                        >
                          <option value="">Kies nummer</option>
                          {dishes.map((dish) => (
                            <option key={dish.id} value={dish.id}>
                              {dish.id}. {dish.name}
                            </option>
                          ))}
                        </select>

                        <div className="rounded-2xl bg-slate-100 px-3 py-3 text-sm text-slate-700">
                          {selectedDish ? (
                            <>
                              <div className="font-medium">{selectedDish.name}</div>
                              <div className="text-slate-500">
                                {selectedDish.category}
                                {selectedDish.note ? ` • ${selectedDish.note}` : ""}
                              </div>
                            </>
                          ) : (
                            "Nog geen gerecht gekozen"
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="border-2 border-black">
              <div className="rounded-t-3xl bg-black p-6 text-yellow-400">
                <h2 className="text-xl font-bold">Menukaart</h2>
              </div>
              <div className="space-y-2 p-6">
                <div>
                  <div className="text-lg font-semibold">{houseName}</div>
                  <div className="text-sm text-slate-500">{weekLabel}</div>
                  <div className="text-sm text-slate-400">{weekRangeText}</div>
                </div>

                {days.map((day) => {
                  const dish = dishMap.get(String(menu[day]));
                  return (
                    <div key={day} className="flex justify-between border-b py-2">
                      <span className="font-medium">{day}</span>
                      <span>{dish ? `${dish.id}. ${dish.name}` : "-"}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "gerechten" && (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="border-2 border-green-600">
              <div className="rounded-t-3xl bg-green-600 p-6 text-white">
                <h2 className="text-xl font-bold">Nieuw gerecht</h2>
              </div>
              <div className="space-y-3 p-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Naam gerecht</label>
                  <input
                    value={newDish.name}
                    onChange={(e) => setNewDish((current) => ({ ...current, name: e.target.value }))}
                    placeholder="Bijv. Roti vegetarisch"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Categorie</label>
                  <input
                    value={newDish.category}
                    onChange={(e) => setNewDish((current) => ({ ...current, category: e.target.value }))}
                    placeholder="Bijv. Surinaams"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Notitie</label>
                  <textarea
                    value={newDish.note}
                    onChange={(e) => setNewDish((current) => ({ ...current, note: e.target.value }))}
                    placeholder="Bijv. Met extra groenten"
                    className="min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />
                </div>
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                  onClick={addDish}
                >
                  <Plus className="h-4 w-4" />
                  Gerecht toevoegen als nr. {nextId}
                </button>
              </div>
            </Card>

            <Card className="border-2 border-green-600">
              <div className="rounded-t-3xl bg-green-600 p-6 text-white">
                <h2 className="text-xl font-bold">Gerechten</h2>
              </div>
              <div className="grid gap-3 p-6">
                {dishes.map((dish) => (
                  <div key={dish.id} className="flex justify-between gap-3 rounded-2xl border p-3">
                    <div>
                      <div className="font-medium">
                        {dish.id}. {dish.name}
                      </div>
                      <div className="text-sm text-slate-500">{dish.category}</div>
                      {dish.note ? <div className="text-sm text-slate-400">{dish.note}</div> : null}
                    </div>
                    <button
                      className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50"
                      onClick={() => removeDish(dish.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "delen" && (
          <Card className="border-2 border-black">
            <div className="rounded-t-3xl bg-black p-6 text-yellow-400">
              <h2 className="text-xl font-bold">Delen</h2>
            </div>
            <div className="space-y-4 p-6">
              <textarea
                value={shareText}
                readOnly
                className="min-h-[260px] w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                  onClick={copyMenu}
                >
                  Kopieer
                </button>
                <button
                  className="rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-black hover:bg-yellow-300"
                  onClick={shareMenu}
                >
                  Deel direct
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
