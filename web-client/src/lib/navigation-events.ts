"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import nProgress from "nprogress";
import "nprogress/nprogress.css";

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    nProgress.start();
    if (pathname === "/") {
      nProgress.done();
    }
    const url = `${pathname}?${searchParams}`;
  }, [pathname, searchParams]);

  return null;
}

export function dismissProgress() {
  nProgress.done();
}
