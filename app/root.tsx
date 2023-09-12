import type {
  DataFunctionArgs,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import stylesheet from "~/tailwind.css";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import {
  ClerkApp,
  ClerkCatchBoundary,
  V2_ClerkErrorBoundary,
  useAuth,
} from "@clerk/remix";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Header } from "./components/header";
import { useMemo } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader: LoaderFunction = (args: DataFunctionArgs) => {
  return rootAuthLoader(args, () => ({
    ENV: {
      CONVEX_URL: process.env.CONVEX_URL,
      CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    },
  }));
};

function App() {
  const data = useLoaderData<typeof loader>();
  const convex = useMemo(
    () => new ConvexReactClient(data.ENV.CONVEX_URL),
    [data.ENV.CONVEX_URL]
  );

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-gray-900 dark:text-white">
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <Header />
          <div className="pt-8 pb-8 container mx-auto">
            <Outlet />
          </div>
        </ConvexProviderWithClerk>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default ClerkApp(App);

export const ErrorBoundary = V2_ClerkErrorBoundary();
export const CatchBoundary = ClerkCatchBoundary();
