import { type LinksFunction, json } from "@remix-run/node";
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

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader() {
  return json({
    ENV: {
      CONVEX_URL: process.env.CONVEX_URL,
    },
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const convex = new ConvexReactClient(data.ENV.CONVEX_URL as string);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ConvexProvider client={convex}>
          <Outlet />
        </ConvexProvider>
        <ScrollRestoration />
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        /> */}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
