import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Checkbox,
  Modal,
  Text,
  Button,
  ButtonGroup,
  InlineStack,
  BlockStack,
  Box,
  Card,
  Badge,
  Banner,
  TextField,
  Select,
  ChoiceList,
  Popover,
  ActionList,
  ResourceList,
  ResourceItem,
  Avatar,
  Tabs,
  Icon,
  Tag,
  Listbox,
  Scrollable,
  Divider,
} from "@shopify/polaris";

// =============================================================================
// T0351 - Dark Mode Toggle
// =============================================================================

export function DarkModeToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  const handleChange = useCallback(
    (newChecked: boolean) => {
      document.documentElement.setAttribute(
        "data-theme",
        newChecked ? "dark" : "light",
      );
      onChange(newChecked);
    },
    [onChange],
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      enabled ? "dark" : "light",
    );
  }, [enabled]);

  return (
    <Checkbox label="Dark mode" checked={enabled} onChange={handleChange} />
  );
}

// =============================================================================
// T0352 - Keyboard Shortcuts
// =============================================================================

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  action: string;
  label: string;
}

export const KEYBOARD_SHORTCUTS: ShortcutConfig[] = [
  { key: "s", ctrl: true, action: "save", label: "Save" },
  { key: "z", ctrl: true, action: "undo", label: "Undo" },
  { key: "z", ctrl: true, shift: true, action: "redo", label: "Redo" },
  { key: "f", ctrl: true, action: "find", label: "Find" },
  { key: "/", action: "search", label: "Focus search" },
];

function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.shift) parts.push("Shift");
  parts.push(shortcut.key.toUpperCase());
  return parts.join(" + ");
}

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  const activator = (
    <Button onClick={() => setOpen(true)} variant="plain">
      Keyboard shortcuts
    </Button>
  );

  return (
    <>
      {activator}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Keyboard Shortcuts"
      >
        <Modal.Section>
          <BlockStack gap="300">
            {KEYBOARD_SHORTCUTS.map((shortcut) => (
              <InlineStack
                key={shortcut.action}
                align="space-between"
                blockAlign="center"
              >
                <Text as="span" variant="bodyMd">
                  {shortcut.label}
                </Text>
                <Badge>{formatShortcut(shortcut)}</Badge>
              </InlineStack>
            ))}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}

// =============================================================================
// T0353 - Bulk Actions
// =============================================================================

export function BulkActionBar({
  selectedCount,
  actions,
  onAction,
}: {
  selectedCount: number;
  actions: Array<{ id: string; label: string; destructive?: boolean }>;
  onAction: (id: string) => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        insetInlineStart: 0,
        insetInlineEnd: 0,
        zIndex: 400,
        background: "var(--p-color-bg-surface)",
        borderTop: "1px solid var(--p-color-border)",
        padding: "12px 20px",
      }}
    >
      <InlineStack align="space-between" blockAlign="center">
        <Text as="span" variant="bodyMd" fontWeight="semibold">
          {selectedCount} selected
        </Text>
        <ButtonGroup>
          {actions.map((action) => (
            <Button
              key={action.id}
              onClick={() => onAction(action.id)}
              variant={action.destructive ? "primary" : "secondary"}
              tone={action.destructive ? "critical" : undefined}
            >
              {action.label}
            </Button>
          ))}
        </ButtonGroup>
      </InlineStack>
    </div>
  );
}

// =============================================================================
// T0354 - Drag and Drop
// =============================================================================

export function DraggableList<T extends { id: string }>({
  items,
  renderItem,
  onReorder,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onReorder: (from: number, to: number) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
      setDragIndex(index);
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropIndex(index);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        onReorder(fromIndex, toIndex);
      }
      setDragIndex(null);
      setDropIndex(null);
    },
    [onReorder],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropIndex(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        // Toggle grabbed state
      }
      if (e.key === 'ArrowUp' && index > 0) {
        e.preventDefault();
        onReorder(index, index - 1);
      }
      if (e.key === 'ArrowDown' && index < items.length - 1) {
        e.preventDefault();
        onReorder(index, index + 1);
      }
    },
    [items.length, onReorder],
  );

  return (
    <div role="listbox" aria-label="Reorderable list">
      <BlockStack gap="100">
        {items.map((item, index) => (
          <div
            key={item.id}
            role="option"
            aria-selected={false}
            tabIndex={0}
            aria-label={`Item ${index + 1}. Press Space to grab, arrow keys to move`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{
              opacity: dragIndex === index ? 0.5 : 1,
              borderTop:
                dropIndex === index && dragIndex !== index
                  ? "2px solid var(--p-color-border-interactive)"
                  : "2px solid transparent",
              cursor: "grab",
              padding: "4px 0",
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </BlockStack>
    </div>
  );
}

// =============================================================================
// T0355 - Advanced Filtering
// =============================================================================

export interface FilterConfig {
  field: string;
  label: string;
  type: "select" | "text" | "date" | "boolean";
  options?: Array<{ label: string; value: string }>;
}

export function AdvancedFilters({
  filters,
  values,
  onChange,
}: {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}) {
  const handleFilterChange = useCallback(
    (field: string, value: string) => {
      onChange({ ...values, [field]: value });
    },
    [values, onChange],
  );

  const handleClearAll = useCallback(() => {
    const cleared: Record<string, string> = {};
    filters.forEach((f) => {
      cleared[f.field] = "";
    });
    onChange(cleared);
  }, [filters, onChange]);

  const activeFilterCount = Object.values(values).filter(
    (v) => v !== "",
  ).length;

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <Text as="h3" variant="headingSm">
              Filters
            </Text>
            {activeFilterCount > 0 && (
              <Badge tone="info">{`${activeFilterCount} active`}</Badge>
            )}
          </InlineStack>
          {activeFilterCount > 0 && (
            <Button onClick={handleClearAll} variant="plain">
              Clear all
            </Button>
          )}
        </InlineStack>
        <InlineStack gap="300" wrap>
          {filters.map((filter) => {
            const currentValue = values[filter.field] ?? "";

            switch (filter.type) {
              case "select":
                return (
                  <div key={filter.field} style={{ minWidth: 180 }}>
                    <Select
                      label={filter.label}
                      options={[
                        { label: "All", value: "" },
                        ...(filter.options ?? []),
                      ]}
                      value={currentValue}
                      onChange={(v) => handleFilterChange(filter.field, v)}
                    />
                  </div>
                );
              case "text":
                return (
                  <div key={filter.field} style={{ minWidth: 180 }}>
                    <TextField
                      label={filter.label}
                      value={currentValue}
                      onChange={(v) => handleFilterChange(filter.field, v)}
                      autoComplete="off"
                      clearButton
                      onClearButtonClick={() =>
                        handleFilterChange(filter.field, "")
                      }
                    />
                  </div>
                );
              case "date":
                return (
                  <div key={filter.field} style={{ minWidth: 180 }}>
                    <TextField
                      label={filter.label}
                      type="date"
                      value={currentValue}
                      onChange={(v) => handleFilterChange(filter.field, v)}
                      autoComplete="off"
                    />
                  </div>
                );
              case "boolean":
                return (
                  <div key={filter.field} style={{ minWidth: 180 }}>
                    <Select
                      label={filter.label}
                      options={[
                        { label: "All", value: "" },
                        { label: "Yes", value: "true" },
                        { label: "No", value: "false" },
                      ]}
                      value={currentValue}
                      onChange={(v) => handleFilterChange(filter.field, v)}
                    />
                  </div>
                );
              default:
                return null;
            }
          })}
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// =============================================================================
// T0356 - Custom Columns
// =============================================================================

export function ColumnSelector({
  available,
  selected,
  onChange,
}: {
  available: Array<{ id: string; label: string }>;
  selected: string[];
  onChange: (cols: string[]) => void;
}) {
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopover = useCallback(
    () => setPopoverActive((prev) => !prev),
    [],
  );

  const handleToggleColumn = useCallback(
    (columnId: string) => {
      if (selected.includes(columnId)) {
        onChange(selected.filter((id) => id !== columnId));
      } else {
        onChange([...selected, columnId]);
      }
    },
    [selected, onChange],
  );

  const activator = (
    <Button onClick={togglePopover} disclosure>
      Columns
    </Button>
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopover}
    >
      <Popover.Section>
        <BlockStack gap="200">
          <Text as="span" variant="headingSm">
            Toggle columns
          </Text>
          {available.map((col) => (
            <Checkbox
              key={col.id}
              label={col.label}
              checked={selected.includes(col.id)}
              onChange={() => handleToggleColumn(col.id)}
            />
          ))}
        </BlockStack>
      </Popover.Section>
    </Popover>
  );
}

// =============================================================================
// T0357 - Saved Views
// =============================================================================

export function SavedViews({
  views,
  activeView,
  onSelect,
  onSave,
  onDelete,
}: {
  views: Array<{ id: string; name: string; filters: Record<string, string> }>;
  activeView?: string;
  onSelect: (id: string) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showSave, setShowSave] = useState(false);
  const [viewName, setViewName] = useState("");

  const tabs = views.map((view) => ({
    id: view.id,
    content: view.name,
  }));

  const selectedIndex = views.findIndex((v) => v.id === activeView);

  const handleSave = useCallback(() => {
    if (viewName.trim()) {
      onSave(viewName.trim());
      setViewName("");
      setShowSave(false);
    }
  }, [viewName, onSave]);

  return (
    <BlockStack gap="300">
      <InlineStack gap="300" blockAlign="center" wrap>
        {views.map((view) => (
          <InlineStack key={view.id} gap="100" blockAlign="center">
            <Button
              variant={view.id === activeView ? "primary" : "secondary"}
              onClick={() => onSelect(view.id)}
              size="slim"
            >
              {view.name}
            </Button>
            <Button
              variant="plain"
              tone="critical"
              onClick={() => onDelete(view.id)}
              size="slim"
            >
              Remove
            </Button>
          </InlineStack>
        ))}
        {!showSave ? (
          <Button onClick={() => setShowSave(true)} variant="plain">
            + Save current view
          </Button>
        ) : (
          <InlineStack gap="200" blockAlign="end">
            <TextField
              label="View name"
              labelHidden
              value={viewName}
              onChange={setViewName}
              placeholder="View name"
              autoComplete="off"
            />
            <Button onClick={handleSave} variant="primary" size="slim">
              Save
            </Button>
            <Button onClick={() => setShowSave(false)} size="slim">
              Cancel
            </Button>
          </InlineStack>
        )}
      </InlineStack>
    </BlockStack>
  );
}

// =============================================================================
// T0358 - Real-time Collaboration Indicator (stub)
// =============================================================================

export function CollaborationIndicator({
  users,
}: {
  users: Array<{ name: string; avatar?: string; editing?: string }>;
}) {
  if (users.length === 0) return null;

  return (
    <InlineStack gap="200" blockAlign="center">
      {users.map((user, i) => (
        <div
          key={`${user.name}-${i}`}
          title={
            user.editing
              ? `${user.name} is editing ${user.editing}`
              : `${user.name} is viewing`
          }
          style={{ position: "relative" }}
        >
          <Avatar
            name={user.name}
            initials={user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
            size="sm"
          />
          {user.editing && (
            <div
              style={{
                position: "absolute",
                bottom: -2,
                insetInlineEnd: '-2px',
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--p-color-bg-fill-success)",
                border: "2px solid var(--p-color-bg-surface)",
              }}
            />
          )}
        </div>
      ))}
      <Text as="span" variant="bodySm" tone="subdued">
        {users.length} active {users.length === 1 ? "user" : "users"}
      </Text>
    </InlineStack>
  );
}

// =============================================================================
// T0359 - Change Notification
// =============================================================================

export function ChangeNotification({
  message,
  type,
  timestamp,
}: {
  message: string;
  type: "info" | "success" | "warning";
  timestamp: string;
}) {
  const toneMap: Record<string, "info" | "success" | "warning"> = {
    info: "info",
    success: "success",
    warning: "warning",
  };

  return (
    <Banner tone={toneMap[type]}>
      <InlineStack align="space-between" blockAlign="center">
        <Text as="span" variant="bodyMd">
          {message}
        </Text>
        <Text as="span" variant="bodySm" tone="subdued">
          {timestamp}
        </Text>
      </InlineStack>
    </Banner>
  );
}

// =============================================================================
// T0360 - Comment Thread
// =============================================================================

export function CommentThread({
  comments,
  onAdd,
}: {
  comments: Array<{ author: string; text: string; date: string }>;
  onAdd: (text: string) => void;
}) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = useCallback(() => {
    if (newComment.trim()) {
      onAdd(newComment.trim());
      setNewComment("");
    }
  }, [newComment, onAdd]);

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingSm">
          Comments
        </Text>
        {comments.length === 0 ? (
          <Text as="p" variant="bodySm" tone="subdued">
            No comments yet
          </Text>
        ) : (
          <BlockStack gap="300">
            {comments.map((comment, i) => (
              <Box
                key={`comment-${i}`}
                padding="300"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <BlockStack gap="100">
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      {comment.author}
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {comment.date}
                    </Text>
                  </InlineStack>
                  <Text as="p" variant="bodyMd">
                    {comment.text}
                  </Text>
                </BlockStack>
              </Box>
            ))}
          </BlockStack>
        )}
        <Divider />
        <InlineStack gap="200" blockAlign="end">
          <div style={{ flex: 1 }}>
            <TextField
              label="Add a comment"
              labelHidden
              value={newComment}
              onChange={setNewComment}
              placeholder="Write a comment..."
              autoComplete="off"
              multiline={2}
            />
          </div>
          <Button onClick={handleSubmit} variant="primary" disabled={!newComment.trim()}>
            Post
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// =============================================================================
// T0361 - Mention Input
// =============================================================================

export function MentionInput({
  value,
  onChange,
  users,
}: {
  value: string;
  onChange: (v: string) => void;
  users: Array<{ id: string; name: string }>;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [mentionQuery, setMentionQuery] = useState("");

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);

      const lastAtIndex = newValue.lastIndexOf("@");
      if (lastAtIndex !== -1) {
        const query = newValue.slice(lastAtIndex + 1).toLowerCase();
        const spaceAfterAt = query.indexOf(" ");
        if (spaceAfterAt === -1 && query.length > 0) {
          setMentionQuery(query);
          setFilteredUsers(
            users.filter((u) => u.name.toLowerCase().includes(query)),
          );
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    },
    [onChange, users],
  );

  const handleSelectUser = useCallback(
    (user: { id: string; name: string }) => {
      const lastAtIndex = value.lastIndexOf("@");
      const before = value.slice(0, lastAtIndex);
      const newValue = `${before}@${user.name} `;
      onChange(newValue);
      setShowSuggestions(false);
    },
    [value, onChange],
  );

  return (
    <div style={{ position: "relative" }}>
      <TextField
        label="Message"
        value={value}
        onChange={handleChange}
        autoComplete="off"
        placeholder="Type @ to mention someone..."
        multiline={2}
      />
      {showSuggestions && filteredUsers.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            insetInlineStart: 0,
            insetInlineEnd: 0,
            background: "var(--p-color-bg-surface)",
            border: "1px solid var(--p-color-border)",
            borderRadius: 8,
            boxShadow: "var(--p-shadow-300)",
            zIndex: 100,
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          <ActionList
            items={filteredUsers.map((user) => ({
              content: user.name,
              onAction: () => handleSelectUser(user),
            }))}
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// T0362 - Activity Feed
// =============================================================================

export function ActivityFeed({
  items,
}: {
  items: Array<{
    action: string;
    user: string;
    resource: string;
    date: string;
  }>;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <Text as="p" variant="bodySm" tone="subdued">
          No recent activity
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingSm">
          Activity
        </Text>
        {items.map((item, i) => (
          <Box key={`activity-${i}`} paddingBlockEnd="200">
            <InlineStack gap="200" blockAlign="start">
              <Avatar name={item.user} size="sm" />
              <BlockStack gap="050">
                <Text as="span" variant="bodyMd">
                  <Text as="span" fontWeight="semibold" variant="bodyMd">
                    {item.user}
                  </Text>{" "}
                  {item.action}{" "}
                  <Text as="span" fontWeight="semibold" variant="bodyMd">
                    {item.resource}
                  </Text>
                </Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  {item.date}
                </Text>
              </BlockStack>
            </InlineStack>
          </Box>
        ))}
      </BlockStack>
    </Card>
  );
}

// =============================================================================
// T0363 - Notifications Center
// =============================================================================

export function NotificationsCenter({
  notifications,
  onDismiss,
}: {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
  }>;
  onDismiss: (id: string) => void;
}) {
  const [popoverActive, setPopoverActive] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const activator = (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Button onClick={() => setPopoverActive((prev) => !prev)}>
        Notifications
      </Button>
      {unreadCount > 0 && (
        <div
          style={{
            position: "absolute",
            top: -6,
            insetInlineEnd: '-6px',
            background: "var(--p-color-bg-fill-critical)",
            color: "var(--p-color-text-on-color)",
            borderRadius: "50%",
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {unreadCount}
        </div>
      )}
    </div>
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={() => setPopoverActive(false)}
      preferredAlignment="right"
    >
      <Popover.Section>
        <Text as="span" variant="headingSm">
          Notifications
        </Text>
      </Popover.Section>
      <Popover.Section>
        {notifications.length === 0 ? (
          <Text as="p" variant="bodySm" tone="subdued">
            No notifications
          </Text>
        ) : (
          <Scrollable style={{ maxHeight: 300 }}>
            <BlockStack gap="200">
              {notifications.map((notif) => (
                <Box
                  key={notif.id}
                  padding="200"
                  background={
                    notif.read ? "bg-surface" : "bg-surface-secondary"
                  }
                  borderRadius="200"
                >
                  <InlineStack align="space-between" blockAlign="start">
                    <BlockStack gap="050">
                      <Text
                        as="span"
                        variant="bodyMd"
                        fontWeight={notif.read ? "regular" : "semibold"}
                      >
                        {notif.title}
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {notif.message}
                      </Text>
                    </BlockStack>
                    <Button
                      variant="plain"
                      onClick={() => onDismiss(notif.id)}
                      size="slim"
                    >
                      Dismiss
                    </Button>
                  </InlineStack>
                </Box>
              ))}
            </BlockStack>
          </Scrollable>
        )}
      </Popover.Section>
    </Popover>
  );
}

// =============================================================================
// T0364 - Mobile Warning Banner
// =============================================================================

export function MobileWarningBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile || dismissed) return null;

  return (
    <Banner
      title="Best viewed on desktop"
      tone="warning"
      onDismiss={() => setDismissed(true)}
    >
      <Text as="p" variant="bodyMd">
        This application is optimized for desktop browsers. Some features may be
        limited on mobile devices.
      </Text>
    </Banner>
  );
}

// =============================================================================
// T0365 - Responsive Container
// =============================================================================

export function ResponsiveContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewport("mobile");
      } else if (width < 1024) {
        setViewport("tablet");
      } else {
        setViewport("desktop");
      }
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const paddingMap = {
    mobile: "200" as const,
    tablet: "400" as const,
    desktop: "600" as const,
  };

  return (
    <Box
      padding={paddingMap[viewport]}
      maxWidth={viewport === "desktop" ? "1200px" : "100%"}
    >
      <div
        data-viewport={viewport}
        style={{
          display: "flex",
          flexDirection: viewport === "mobile" ? "column" : "row",
          gap: viewport === "mobile" ? 12 : 20,
          flexWrap: "wrap",
        }}
      >
        {children}
      </div>
    </Box>
  );
}

// =============================================================================
// T0366 - Offline Indicator
// =============================================================================

export function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
      }}
    >
      <Banner tone="critical">
        <Text as="span" variant="bodyMd" fontWeight="semibold">
          You are currently offline. Some features may be unavailable.
        </Text>
      </Banner>
    </div>
  );
}

// =============================================================================
// T0367 - Global Search
// =============================================================================

export function GlobalSearch({
  placeholder = "Search...",
  onSearch,
  results,
}: {
  placeholder?: string;
  onSearch: (query: string) => void;
  results: Array<{ id: string; title: string; type: string }>;
}) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      onSearch(value);
      setShowResults(value.length > 0);
    },
    [onSearch],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typeColorMap: Record<string, "info" | "success" | "warning" | "attention"> = {
    product: "info",
    order: "success",
    customer: "warning",
    page: "attention",
  };

  return (
    <div ref={containerRef} style={{ position: "relative", maxWidth: 480 }}>
      <TextField
        label="Search"
        labelHidden
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        clearButton
        onClearButtonClick={() => {
          setQuery("");
          onSearch("");
          setShowResults(false);
        }}
        onFocus={() => {
          if (query.length > 0) setShowResults(true);
        }}
      />
      {showResults && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--p-color-bg-surface)",
            border: "1px solid var(--p-color-border)",
            borderRadius: 8,
            boxShadow: "var(--p-shadow-300)",
            zIndex: 200,
            maxHeight: 320,
            overflow: "auto",
            marginTop: 4,
          }}
        >
          <ActionList
            items={results.map((result) => ({
              content: result.title,
              suffix: (
                <Badge tone={typeColorMap[result.type] ?? "info"}>
                  {result.type}
                </Badge>
              ),
            }))}
          />
        </div>
      )}
      {showResults && query.length > 0 && results.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--p-color-bg-surface)",
            border: "1px solid var(--p-color-border)",
            borderRadius: 8,
            boxShadow: "var(--p-shadow-300)",
            zIndex: 200,
            padding: 16,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          <Text as="p" variant="bodySm" tone="subdued">
            No results found for "{query}"
          </Text>
        </div>
      )}
    </div>
  );
}
