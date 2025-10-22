// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Begitu halaman ini diakses, langsung arahkan ke /chat
  redirect("/chat");
}
