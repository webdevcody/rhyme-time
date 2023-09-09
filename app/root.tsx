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
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import {
  ClerkProvider,
  SignInButton,
  SignOutButton,
  useAuth,
} from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Header } from "./components/header";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader() {
  return json({
    ENV: {
      CONVEX_URL: process.env.CONVEX_URL,
      CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    },
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const convex = new ConvexReactClient(data.ENV.CONVEX_URL!);

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-gray-900 dark:text-white">
        <ClerkProvider publishableKey={data.ENV.CLERK_PUBLISHABLE_KEY!}>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <Header />
            <div className="pt-8">
              <Outlet />
            </div>
          </ConvexProviderWithClerk>
        </ClerkProvider>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
