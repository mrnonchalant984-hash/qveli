declare module 'next/link' {
  import type { AnchorHTMLAttributes, ReactNode } from 'react';

  type LinkHref = string | { pathname?: string; query?: Record<string, string | number | boolean> };

  interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    children?: ReactNode;
    href: LinkHref;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    prefetch?: boolean;
  }

  const Link: (props: LinkProps) => ReactNode;
  export default Link;
}

declare module 'next/headers' {
  interface CookieValue {
    name: string;
    value: string;
  }

  interface Cookies {
    get(name: string): CookieValue | undefined;
    set(name: string, value: string, options?: Record<string, unknown>): void;
    delete(name: string): void;
  }

  export function cookies(): Promise<Cookies>;
}

declare global {
  interface RequestInit {
    next?: { revalidate?: number | false; tags?: string[] };
  }
}
