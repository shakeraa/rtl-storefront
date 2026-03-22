/**
 * Team Management UI
 * T0016: Team & Access Control — team management page
 *
 * GET  /app/team  — list team members and pending invites
 * POST /app/team  — send a new invite
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  DataTable,
  FormLayout,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  getTeamMembers,
  getPendingInvites as getAuthPendingInvites,
  inviteTeamMember,
  type Role,
} from "../services/auth/roles";

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const members = getTeamMembers(shop);
  const pending = getAuthPendingInvites(shop);

  return json({ shop, members, pending });
};

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const role = (formData.get("role") as string | null) ?? "viewer";

  if (!email) {
    return json({ error: "Email is required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json({ error: "Invalid email address" }, { status: 400 });
  }

  inviteTeamMember(email, role as Role, shop, "owner");
  return json({ success: true });
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Translator", value: "translator" },
  { label: "Viewer", value: "viewer" },
];

function roleBadgeTone(
  role: string,
): "success" | "attention" | "info" | "warning" {
  switch (role) {
    case "admin":
      return "success";
    case "manager":
      return "attention";
    case "translator":
      return "info";
    default:
      return "warning";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TeamPage() {
  const { members, pending } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("translator");

  function handleInvite() {
    if (!email.trim()) return;
    const form = new FormData();
    form.append("email", email.trim());
    form.append("role", role);
    submit(form, { method: "post" });
    setEmail("");
    setRole("translator");
  }

  const memberRows = members.map((m) => [
    m.name || "—",
    m.email,
    <Badge key={m.id} tone={roleBadgeTone(m.role)}>
      {m.role}
    </Badge>,
    <Badge key={`${m.id}-status`} tone={m.status === "active" ? "success" : "warning"}>
      {m.status}
    </Badge>,
    m.acceptedAt
      ? new Date(m.acceptedAt).toLocaleDateString()
      : "—",
  ]);

  const pendingRows = pending.map((inv) => [
    inv.email,
    <Badge key={inv.id} tone={roleBadgeTone(inv.role)}>
      {inv.role}
    </Badge>,
    new Date(inv.expiresAt).toLocaleDateString(),
    inv.token.slice(0, 8) + "…",
  ]);

  return (
    <Page>
      <TitleBar title="Team & Access Control" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Team members table */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Team Members
                </Text>
                {members.length === 0 ? (
                  <Banner tone="info">
                    No team members yet. Invite someone below.
                  </Banner>
                ) : (
                  <DataTable
                    columnContentTypes={[
                      "text",
                      "text",
                      "text",
                      "text",
                      "text",
                    ]}
                    headings={["Name", "Email", "Role", "Status", "Joined"]}
                    rows={memberRows}
                  />
                )}
              </BlockStack>
            </Card>

            {/* Invite form */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Invite a Team Member
                </Text>
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Email address"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                      placeholder="colleague@example.com"
                    />
                    <Select
                      label="Role"
                      options={ROLE_OPTIONS}
                      value={role}
                      onChange={setRole}
                    />
                  </FormLayout.Group>
                </FormLayout>
                <InlineStack>
                  <Button
                    variant="primary"
                    onClick={handleInvite}
                    loading={isSubmitting}
                    disabled={!email.trim()}
                  >
                    Send Invite
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Pending invites */}
            {pending.length > 0 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Pending Invites
                  </Text>
                  <DataTable
                    columnContentTypes={["text", "text", "text", "text"]}
                    headings={["Email", "Role", "Expires", "Token"]}
                    rows={pendingRows}
                  />
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
