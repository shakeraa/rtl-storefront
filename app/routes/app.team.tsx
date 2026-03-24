/**
 * Team Management UI
 * T0016: Team & Access Control — team management page with email status
 *
 * GET  /app/team  — list team members and pending invites
 * POST /app/team  — send a new invite
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
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
  Tooltip,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticateWithTenant } from "../utils/auth.server";
import {
  getTeamMembers,
  getPendingInvites as getAuthPendingInvites,
  inviteTeamMember,
  type Role,
} from "../services/auth/roles";
import { getInvites, createInvite, resendInvite, revokeInvite } from "../services/team/invites.server";
import { getStatusTone, formatStatus } from "../services/team/invites.client";

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, shop } = await authenticateWithTenant(request);

  const members = getTeamMembers(shop);
  const invites = await getInvites(shop);

  return json({ shop, members, invites });
};

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, shop } = await authenticateWithTenant(request);
  const invitedBy = session.email || "owner";

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const inviteId = formData.get("inviteId") as string;

  try {
    // Handle revoke
    if (intent === "revoke" && inviteId) {
      await revokeInvite(inviteId);
      return json({ success: true });
    }

    // Handle resend
    if (intent === "resend" && inviteId) {
      await resendInvite(inviteId, invitedBy);
      return json({ success: true });
    }

    // Handle new invite
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const role = (formData.get("role") as string | null) ?? "viewer";

    if (!email) {
      return json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: "Invalid email address" }, { status: 400 });
    }

    const invite = await createInvite(shop, email, role, invitedBy);
    return json({ success: true, invite });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return json({ error: message }, { status: 400 });
  }
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
  const { members, invites } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("translator");

  // Clear form on successful submission
  if (actionData?.success && email) {
    setEmail("");
    setRole("translator");
  }

  function handleInvite() {
    if (!email.trim()) return;
    const form = new FormData();
    form.append("email", email.trim());
    form.append("role", role);
    submit(form, { method: "post" });
  }

  function handleRevoke(inviteId: string) {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;
    const form = new FormData();
    form.append("intent", "revoke");
    form.append("inviteId", inviteId);
    submit(form, { method: "post" });
  }

  function handleResend(inviteId: string) {
    const form = new FormData();
    form.append("intent", "resend");
    form.append("inviteId", inviteId);
    submit(form, { method: "post" });
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

  const inviteRows = invites.map((inv) => {
    const canResend = inv.status === "pending" || inv.status === "sent";
    const canRevoke = inv.status !== "accepted" && inv.status !== "revoked";
    const isExpired = new Date() > new Date(inv.expiresAt);

    return [
      inv.email,
      <Badge key={`${inv.id}-role`} tone={roleBadgeTone(inv.role)}>
        {inv.role}
      </Badge>,
      <Badge key={`${inv.id}-status`} tone={getStatusTone(inv.status)}>
        {formatStatus(inv.status)}
        {inv.emailError && " ⚠️"}
      </Badge>,
      new Date(inv.expiresAt).toLocaleDateString(),
      inv.sentAt ? new Date(inv.sentAt).toLocaleDateString() : "—",
      inv.resentCount > 0 ? `${inv.resentCount}x` : "—",
      <InlineStack key={`${inv.id}-actions`} gap="200">
        {canResend && !isExpired && (
          <Tooltip content="Resend invitation email">
            <Button
              size="slim"
              onClick={() => handleResend(inv.id)}
              loading={isSubmitting}
            >
              Resend
            </Button>
          </Tooltip>
        )}
        {canRevoke && (
          <Tooltip content="Revoke invitation">
            <Button
              size="slim"
              tone="critical"
              onClick={() => handleRevoke(inv.id)}
              loading={isSubmitting}
            >
              Revoke
            </Button>
          </Tooltip>
        )}
      </InlineStack>,
    ];
  });

  // Check for invites with email errors
  const failedInvites = invites.filter((i) => i.emailError);

  return (
    <Page>
      <TitleBar title="Team & Access Control" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Email error banner */}
            {failedInvites.length > 0 && (
              <Banner tone="warning" title="Email Delivery Issues">
                <Text as="p">
                  {failedInvites.length} invitation(s) failed to send. 
                  Check your email configuration or resend the invites.
                </Text>
              </Banner>
            )}

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
                {actionData?.error && (
                  <Banner tone="critical">{actionData.error}</Banner>
                )}
                {actionData?.success && !actionData?.error && (
                  <Banner tone="success">Invitation sent successfully!</Banner>
                )}
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Email address"
                      type="email"
                      value={email}
                      onChange={(val) => setEmail(val)}
                      autoComplete="email"
                      placeholder="colleague@example.com"
                    />
                    <Select
                      label="Role"
                      options={ROLE_OPTIONS}
                      value={role}
                      onChange={(val) => setRole(val)}
                    />
                  </FormLayout.Group>
                  <Button
                    variant="primary"
                    onClick={handleInvite}
                    loading={navigation.state === "submitting"}
                    disabled={!email || email.trim() === ""}
                  >
                    Send Invite
                  </Button>
                </FormLayout>
              </BlockStack>
            </Card>

            {/* Invites table with status */}
            {invites.length > 0 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Invitations
                  </Text>
                  <DataTable
                    columnContentTypes={[
                      "text",
                      "text",
                      "text",
                      "text",
                      "text",
                      "text",
                      "text",
                    ]}
                    headings={[
                      "Email",
                      "Role",
                      "Status",
                      "Expires",
                      "Sent",
                      "Resent",
                      "Actions",
                    ]}
                    rows={inviteRows}
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

export function ErrorBoundary() {
  const error = useRouteError();
  const isResponse = isRouteErrorResponse(error);

  return (
    <Page>
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            {isResponse ? `${error.status} Error` : "Something went wrong"}
          </Text>
          <Text as="p">
            {isResponse
              ? error.data?.message || error.statusText
              : "An unexpected error occurred. Please try again."}
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}
