declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: unknown;
  }

  export namespace MetadataRoute {
    interface Manifest {
      name: string;
      short_name?: string;
      description?: string;
      start_url?: string;
      display?: string;
      background_color?: string;
      theme_color?: string;
      icons?: Array<Record<string, unknown>>;
      [key: string]: unknown;
    }
  }

  export interface NextConfig {
    reactStrictMode?: boolean;
    [key: string]: unknown;
  }
}
