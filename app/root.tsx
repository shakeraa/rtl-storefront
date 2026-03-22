import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getDocumentDirectionContext, shouldInjectRTLStyles } from "./utils/rtl";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const contentLocale = new URL(request.url).searchParams.get("contentLocale");
  const direction = getDocumentDirectionContext(request, { contentLocale });

  return json({
    locale: direction.locale,
    direction: direction.direction,
    mode: direction.mode,
    htmlAttributes: direction.htmlAttributes,
    injectRTLStyles: shouldInjectRTLStyles(direction.locale, contentLocale),
  });
};

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <html
      lang={data.htmlAttributes.lang}
      dir={data.htmlAttributes.dir}
      className={data.htmlAttributes.className}
      data-locale={data.htmlAttributes.dataLocale}
      data-directionality={data.htmlAttributes.dataDirectionality}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        {data.injectRTLStyles ? (
          <link rel="stylesheet" href="/rtl-themes/default.css" />
        ) : null}
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
