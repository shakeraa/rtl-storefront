import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getPublicStatusPageData } from "../services/system/status";

export async function loader({ request }: LoaderFunctionArgs) {
  return json(getPublicStatusPageData(), {
    headers: {
      "cache-control": "public, max-age=60",
    },
  });
}

export default function StatusPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background:
          "linear-gradient(180deg, #f4efe4 0%, #ffffff 40%, #eef3ea 100%)",
        color: "#1d261d",
        fontFamily: "\"Iowan Old Style\", \"Palatino Linotype\", serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p style={{ margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          System Status
        </p>
        <h1 style={{ fontSize: "3rem", margin: "12px 0 8px" }}>{data.service}</h1>
        <p style={{ fontSize: "1.1rem", marginBottom: 32 }}>
          Current status: <strong>{data.status}</strong>
        </p>

        <section
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {data.components.map((component) => (
            <article
              key={component.name}
              style={{
                padding: 20,
                borderRadius: 16,
                background: "#ffffffcc",
                boxShadow: "0 10px 30px rgba(20, 30, 20, 0.08)",
                border: "1px solid #d9e4d3",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  marginBottom: 12,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: component.status === "operational" ? "#d7f0d8" : "#f8dccf",
                  color: "#244625",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {component.status}
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: "1.35rem" }}>{component.name}</h2>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{component.description}</p>
            </article>
          ))}
        </section>

        <p style={{ marginTop: 28, color: "#5f685f" }}>
          Updated at {new Date(data.updatedAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC
        </p>
      </div>
    </main>
  );
}
