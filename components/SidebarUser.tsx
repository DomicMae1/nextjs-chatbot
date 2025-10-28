"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { LogOut, Scroll, CircleUserRound } from "lucide-react";

export default function SidebarUser({
  user,
  onLogout,
  isSidebarOpen,
}: {
  user?: {
    name?: string;
    email?: string;
    photoURL?: string;
  };
  onLogout: () => void;
  isSidebarOpen: boolean;
}) {
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  // 🌗 Deteksi dark mode
  useEffect(() => {
    const checkTheme = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const userName = user?.name || "Anonymous User";

  const initials =
    userName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      className={`transition-colors duration-300 ${
        isSidebarOpen && isDark ? "border-gray-700" : ""
      }`}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={`w-full flex ${
              isSidebarOpen
                ? "flex-row items-center gap-3 px-3 py-2"
                : "flex-col items-center py-2"
            } rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            {/* Avatar */}

            {/* Nama user */}
            {isSidebarOpen ? (
              <>
                <div
                  className={`flex items-center justify-center rounded-full w-9 h-9 font-bold text-white ${
                    isDark ? "bg-blue-500" : "bg-blue-600"
                  }`}
                >
                  {initials}
                </div>
                <div className="flex flex-col items-start">
                  <span
                    className={`font-semibold leading-none ${
                      isDark ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {userName}
                  </span>
                  {user?.email && (
                    <span
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {user.email}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div
                className={`flex items-center justify-center rounded-full w-9 h-9 font-bold text-white ${
                  isDark ? "bg-blue-500" : "bg-blue-600"
                }`}
              >
                {initials}
              </div>
            )}
          </button>
        </PopoverTrigger>

        {/* Popover menu (selalu sama) */}
        <PopoverContent
          align="start"
          side="top"
          className={`w-64 p-2 shadow-lg border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col gap-2">
            {user?.email && (
              <div
                className={`flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded-md font-normal ${
                  isDark
                    ? "text-gray-200 bg-gray-800/50"
                    : "text-gray-700 bg-gray-100"
                }`}
              >
                <CircleUserRound
                  size={16}
                  className={isDark ? "text-gray-300" : "text-gray-600"}
                />
                <span className="truncate">{user.email}</span>
              </div>
            )}

            {/* Tombol Release Notes */}
            <button
              onClick={() => router.push("/release-notes")}
              className={`w-full text-left text-sm px-3 py-2 rounded-md font-semibold transition-colors duration-200 flex items-center gap-2 ${
                isDark
                  ? "hover:bg-blue-700 text-white"
                  : "hover:bg-blue-300 text-black"
              }`}
            >
              <Scroll size={16} />
              <span>Release Notes</span>
            </button>

            {/* Tombol Logout */}
            <button
              onClick={onLogout}
              className={`w-full text-left text-sm px-3 py-2 rounded-md font-semibold transition-colors duration-200 flex items-center gap-2 ${
                isDark
                  ? "hover:bg-red-700 text-white"
                  : "hover:bg-red-300 text-black"
              }`}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
