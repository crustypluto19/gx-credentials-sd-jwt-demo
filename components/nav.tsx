"use client";
import Image from "next/image";
import { ModeToggle } from "./ui/mode-toggle";
import { Github } from "lucide-react";
import Link from "next/link";

export default function Nav() {
  return (
    <header>
      <nav className="px-24 py-6">
        <ul className="flex items-center justify-between">
          <li>
            <Link
              className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
              href="https://wwwmatthes.in.tum.de/pages/1c9nhoc7hkeaq/Bachelor-s-Thesis-Evan-Christopher"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-medium text-xl">
                SEBIS @ <span className="text-sky-700 font-extrabold">TUM</span>
              </span>
            </Link>
          </li>
          <li>
            <ModeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}
