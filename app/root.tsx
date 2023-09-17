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
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader: LoaderFunction = (args: DataFunctionArgs) => {
  return {
    ENV: {
      CONVEX_URL: process.env.CONVEX_URL,
    },
  };
};

export default function App() {
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
        <ConvexProvider client={convex}>
          <div className="pt-8 pb-8 container mx-auto">
            <Outlet />
          </div>
        </ConvexProvider>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
