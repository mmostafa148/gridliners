import "./globals.css";

/**
 * Every route lives under `src/app/[locale]/`, whose layout renders the real
 * <html>/<body> with the active locale's `lang` and `dir`. Next still requires
 * a root layout, so this one just passes children through and loads the
 * global stylesheet.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
