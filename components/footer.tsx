"use client";
import { Copyright, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer>
      <div className="px-24 py-6 ">
        <ul className="flex items-center justify-between">
          <li className="flex flex-col text-sm">
            <p>SD-JWT Employee VCs for Gaia-X Federation Services</p>
            <p className="text-xs flex items-baseline space-x-1">
              Powered by{" "}
              <sup>
                <Copyright strokeWidth={1.5} size={8} className="ml-1" />
              </sup>
              Meeco SD-JWT-VC
            </p>
          </li>
          <span className="flex space-x-6">
            <li>
              <Link
                href="https://github.com/crustypluto19/gx-credentials-sd-jwt-demo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github
                  className="hover:scale-110 transition-transform duration-500"
                  size={28}
                />
              </Link>
            </li>
          </span>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
