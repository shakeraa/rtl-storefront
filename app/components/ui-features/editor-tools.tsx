import { useState, useCallback } from "react";
import {
  Card,
  Badge,
  Button,
  TextField,
  InlineStack,
  BlockStack,
  Text,
  Box,
  Banner,
  Icon,
  Popover,
  ActionList,
  DataTable,
  ProgressBar,
} from "@shopify/polaris";

// ---------------------------------------------------------------------------
// T0368 - Saved Searches
// ---------------------------------------------------------------------------

interface SavedSearch {
  id: string;
  name: string;
  query: string;
}

export function SavedSearches({
  searches,
  onSelect,
  onSave,
  onDelete,
}: {
  searches: SavedSearch[];
  onSelect: (query: string) => void;
  onSave: (name: string, query: string) => void;
  onDelete: (id: string) => void;
}) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuery, setNewQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const togglePopover = useCallback(
    () => setPopoverActive((prev) => !prev),
    [],
  );

  const handleSave = useCallback(() => {
    if (newName.trim() && newQuery.trim()) {
      onSave(newName.trim(), newQuery.trim());
      setNewName("");
      setNewQuery("");
      setShowForm(false);
    }
  }, [newName, newQuery, onSave]);

  const activator = (
    <Button onClick={togglePopover} disclosure>
      Saved Searches
    </Button>
  );

  return (
    <Popover active={popoverActive} activator={activator} onClose={togglePopover}>
      <Box padding="400" minWidth="320px">
        <BlockStack gap="300">
          {searches.length === 0 && (
            <Text as="p" variant="bodySm" tone="subdued">
              No saved searches yet.
            </Text>
          )}
          {searches.map((search) => (
            <InlineStack key={search.id} align="space-between" blockAlign="center" gap="200">
              <Button variant="plain" onClick={() => { onSelect(search.query); togglePopover(); }}>
                {search.name}
              </Button>
              <Button variant="plain" tone="critical" onClick={() => onDelete(search.id)}>
                Delete
              </Button>
            </InlineStack>
          ))}

          {showForm ? (
            <BlockStack gap="200">
              <TextField label="Name" value={newName} onChange={setNewName} autoComplete="off" />
              <TextField label="Query" value={newQuery} onChange={setNewQuery} autoComplete="off" />
              <InlineStack gap="200">
                <Button variant="primary" onClick={handleSave}>Save</Button>
                <Button onClick={() => setShowForm(false)}>Cancel</Button>
              </InlineStack>
            </BlockStack>
          ) : (
            <Button onClick={() => setShowForm(true)}>+ New Search</Button>
          )}
        </BlockStack>
      </Box>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// T0369 - Export Preview
// ---------------------------------------------------------------------------

export function ExportPreview({
  data,
  format,
  onExport,
}: {
  data: Array<Record<string, string>>;
  format: "csv" | "json" | "xliff";
  onExport: () => void;
}) {
  const previewRows = data.slice(0, 5);
  const columns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  const formatLabel = format.toUpperCase();

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">
            Export Preview
          </Text>
          <Badge>{formatLabel}</Badge>
        </InlineStack>

        {previewRows.length > 0 ? (
          <DataTable
            columnContentTypes={columns.map(() => "text" as const)}
            headings={columns}
            rows={previewRows.map((row) => columns.map((col) => row[col] ?? ""))}
          />
        ) : (
          <Text as="p" variant="bodySm" tone="subdued">
            No data to export.
          </Text>
        )}

        <InlineStack align="space-between" blockAlign="center">
          <Text as="p" variant="bodySm" tone="subdued">
            {data.length} total {data.length === 1 ? "row" : "rows"}
          </Text>
          <Button variant="primary" onClick={onExport}>
            Export {formatLabel}
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// T0370 - Import Preview
// ---------------------------------------------------------------------------

export function ImportPreview({
  data,
  errors,
  onConfirm,
  onCancel,
}: {
  data: Array<Record<string, string>>;
  errors: Array<{ row: number; error: string }>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const previewRows = data.slice(0, 10);
  const columns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          Import Preview
        </Text>

        {errors.length > 0 && (
          <Banner tone="critical" title={`${errors.length} error${errors.length > 1 ? "s" : ""} found`}>
            <BlockStack gap="100">
              {errors.slice(0, 5).map((err, i) => (
                <Text as="p" variant="bodySm" key={i}>
                  Row {err.row}: {err.error}
                </Text>
              ))}
              {errors.length > 5 && (
                <Text as="p" variant="bodySm" tone="subdued">
                  ...and {errors.length - 5} more errors
                </Text>
              )}
            </BlockStack>
          </Banner>
        )}

        {previewRows.length > 0 && (
          <DataTable
            columnContentTypes={columns.map(() => "text" as const)}
            headings={columns}
            rows={previewRows.map((row) => columns.map((col) => row[col] ?? ""))}
          />
        )}

        <InlineStack align="space-between" blockAlign="center">
          <Text as="p" variant="bodySm" tone="subdued">
            {data.length} {data.length === 1 ? "row" : "rows"} to import
          </Text>
          <InlineStack gap="200">
            <Button onClick={onCancel}>Cancel</Button>
            <Button variant="primary" onClick={onConfirm} disabled={errors.length > 0}>
              Confirm Import
            </Button>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// T0371 - Conflict Resolution
// ---------------------------------------------------------------------------

export function ConflictResolver({
  conflicts,
  onResolve,
}: {
  conflicts: Array<{ field: string; current: string; incoming: string }>;
  onResolve: (field: string, choice: "current" | "incoming") => void;
}) {
  const [resolved, setResolved] = useState<Record<string, "current" | "incoming">>({});

  const handleResolve = useCallback(
    (field: string, choice: "current" | "incoming") => {
      setResolved((prev) => ({ ...prev, [field]: choice }));
      onResolve(field, choice);
    },
    [onResolve],
  );

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">
            Resolve Conflicts
          </Text>
          <Badge tone="attention">
            {`${conflicts.length - Object.keys(resolved).length} remaining`}
          </Badge>
        </InlineStack>

        {conflicts.map((conflict) => {
          const choice = resolved[conflict.field];
          return (
            <Card key={conflict.field}>
              <BlockStack gap="300">
                <Text as="h4" variant="headingSm">
                  {conflict.field}
                </Text>
                <InlineStack gap="400" wrap={false}>
                  <Box
                    width="50%"
                    padding="300"
                    background={choice === "current" ? "bg-surface-success" : "bg-surface-secondary"}
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <Badge tone={choice === "current" ? "success" : undefined}>
                        Current
                      </Badge>
                      <Text as="p" variant="bodySm">
                        {conflict.current}
                      </Text>
                      <Button
                        size="slim"
                        variant={choice === "current" ? "primary" : "secondary"}
                        onClick={() => handleResolve(conflict.field, "current")}
                      >
                        Keep Current
                      </Button>
                    </BlockStack>
                  </Box>
                  <Box
                    width="50%"
                    padding="300"
                    background={choice === "incoming" ? "bg-surface-success" : "bg-surface-secondary"}
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <Badge tone={choice === "incoming" ? "success" : undefined}>
                        Incoming
                      </Badge>
                      <Text as="p" variant="bodySm">
                        {conflict.incoming}
                      </Text>
                      <Button
                        size="slim"
                        variant={choice === "incoming" ? "primary" : "secondary"}
                        onClick={() => handleResolve(conflict.field, "incoming")}
                      >
                        Accept Incoming
                      </Button>
                    </BlockStack>
                  </Box>
                </InlineStack>
              </BlockStack>
            </Card>
          );
        })}
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// T0372 - Auto-Save Indicator
// ---------------------------------------------------------------------------

export function AutoSaveIndicator({
  status,
}: {
  status: "saved" | "saving" | "unsaved" | "error";
}) {
  const config: Record<typeof status, { tone: "success" | "info" | "attention" | "critical"; label: string }> = {
    saved: { tone: "success", label: "Saved" },
    saving: { tone: "info", label: "Saving..." },
    unsaved: { tone: "attention", label: "Unsaved" },
    error: { tone: "critical", label: "Save Error" },
  };

  const { tone, label } = config[status];

  return (
    <InlineStack gap="200" blockAlign="center">
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor:
            tone === "success"
              ? "#22c55e"
              : tone === "info"
                ? "#3b82f6"
                : tone === "attention"
                  ? "#eab308"
                  : "#ef4444",
          display: "inline-block",
        }}
      />
      <Badge tone={tone}>{label}</Badge>
    </InlineStack>
  );
}

// ---------------------------------------------------------------------------
// T0373 - Undo/Redo
// ---------------------------------------------------------------------------

export function UndoRedoButtons({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <InlineStack gap="200">
      <Button disabled={!canUndo} onClick={onUndo} accessibilityLabel="Undo">
        Undo
      </Button>
      <Button disabled={!canRedo} onClick={onRedo} accessibilityLabel="Redo">
        Redo
      </Button>
    </InlineStack>
  );
}

// ---------------------------------------------------------------------------
// T0374 - Copy/Paste
// ---------------------------------------------------------------------------

export function CopyButton({
  text,
  label,
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <Button onClick={handleCopy} variant={copied ? "primary" : "secondary"}>
      {copied ? "Copied!" : label ?? "Copy"}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// T0375 - Find & Replace
// ---------------------------------------------------------------------------

export function FindReplace({
  onFind,
  onReplace,
  onReplaceAll,
}: {
  onFind: (query: string) => void;
  onReplace: (query: string, replacement: string) => void;
  onReplaceAll: (query: string, replacement: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");

  const handleFind = useCallback(() => {
    if (query.trim()) onFind(query);
  }, [query, onFind]);

  const handleReplace = useCallback(() => {
    if (query.trim()) onReplace(query, replacement);
  }, [query, replacement, onReplace]);

  const handleReplaceAll = useCallback(() => {
    if (query.trim()) onReplaceAll(query, replacement);
  }, [query, replacement, onReplaceAll]);

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          Find & Replace
        </Text>
        <TextField
          label="Find"
          value={query}
          onChange={setQuery}
          autoComplete="off"
          placeholder="Search text..."
        />
        <TextField
          label="Replace with"
          value={replacement}
          onChange={setReplacement}
          autoComplete="off"
          placeholder="Replacement text..."
        />
        <InlineStack gap="200">
          <Button onClick={handleFind} disabled={!query.trim()}>
            Find
          </Button>
          <Button onClick={handleReplace} disabled={!query.trim()}>
            Replace
          </Button>
          <Button variant="primary" onClick={handleReplaceAll} disabled={!query.trim()}>
            Replace All
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// T0376 - Spell Check UI
// ---------------------------------------------------------------------------

export function SpellCheckIndicator({
  errors,
  onFix,
}: {
  errors: Array<{ word: string; suggestions: string[] }>;
  onFix: (word: string, replacement: string) => void;
}) {
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  if (errors.length === 0) {
    return (
      <InlineStack gap="200" blockAlign="center">
        <Badge tone="success">No spelling errors</Badge>
      </InlineStack>
    );
  }

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">
            Spelling Issues
          </Text>
          <Badge tone="warning">{`${errors.length}`}</Badge>
        </InlineStack>

        {errors.map((error) => (
          <Box
            key={error.word}
            padding="200"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <BlockStack gap="200">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                  <span style={{ textDecoration: "wavy underline red", textUnderlineOffset: "3px" }}>
                    {error.word}
                  </span>
                </Text>
                <Button
                  variant="plain"
                  onClick={() =>
                    setExpandedWord(expandedWord === error.word ? null : error.word)
                  }
                >
                  {expandedWord === error.word ? "Hide" : "Suggestions"}
                </Button>
              </InlineStack>

              {expandedWord === error.word && (
                <InlineStack gap="200" wrap>
                  {error.suggestions.length > 0 ? (
                    error.suggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        size="slim"
                        onClick={() => {
                          onFix(error.word, suggestion);
                          setExpandedWord(null);
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))
                  ) : (
                    <Text as="p" variant="bodySm" tone="subdued">
                      No suggestions available.
                    </Text>
                  )}
                </InlineStack>
              )}
            </BlockStack>
          </Box>
        ))}
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// T0377 - Word Count
// ---------------------------------------------------------------------------

export function WordCount({ text }: { text: string }) {
  const trimmed = text.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  const characters = text.length;
  const sentences = trimmed.length === 0 ? 0 : trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

  return (
    <InlineStack gap="400">
      <BlockStack gap="100">
        <Text as="p" variant="headingSm">{words}</Text>
        <Text as="p" variant="bodySm" tone="subdued">Words</Text>
      </BlockStack>
      <BlockStack gap="100">
        <Text as="p" variant="headingSm">{characters}</Text>
        <Text as="p" variant="bodySm" tone="subdued">Characters</Text>
      </BlockStack>
      <BlockStack gap="100">
        <Text as="p" variant="headingSm">{sentences}</Text>
        <Text as="p" variant="bodySm" tone="subdued">Sentences</Text>
      </BlockStack>
    </InlineStack>
  );
}

// ---------------------------------------------------------------------------
// T0378 - Reading Time
// ---------------------------------------------------------------------------

const getWpm = (locale?: string) => {
  // Arabic reading speed is slower due to script complexity
  if (locale?.startsWith('ar')) return 150;
  if (locale?.startsWith('he')) return 180;
  return 200;
};

export function ReadingTime({
  text,
  wordsPerMinute,
  locale,
}: {
  text: string;
  wordsPerMinute?: number;
  locale?: string;
}) {
  const effectiveWpm = wordsPerMinute ?? getWpm(locale);
  const trimmed = text.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / effectiveWpm));

  return (
    <Text as="p" variant="bodySm" tone="subdued">
      {minutes} min read
    </Text>
  );
}

// ---------------------------------------------------------------------------
// T0379 - SEO Preview
// ---------------------------------------------------------------------------

export function SEOPreview({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  const truncatedTitle = title.length > 60 ? title.slice(0, 60) + "..." : title;
  const truncatedDesc = description.length > 160 ? description.slice(0, 160) + "..." : description;

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          SEO Preview
        </Text>
        <Box padding="400" background="bg-surface-secondary" borderRadius="200">
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd">
              <span style={{ color: "#1a0dab", fontSize: "18px", cursor: "pointer" }}>
                {truncatedTitle || "Page Title"}
              </span>
            </Text>
            <Text as="p" variant="bodySm">
              <span style={{ color: "#006621", fontSize: "13px" }}>
                {url || "https://example.com"}
              </span>
            </Text>
            <Text as="p" variant="bodySm">
              <span style={{ color: "#545454", fontSize: "13px" }}>
                {truncatedDesc || "Page description will appear here."}
              </span>
            </Text>
          </BlockStack>
        </Box>
        <InlineStack gap="300">
          <Text as="p" variant="bodySm" tone={title.length > 60 ? "critical" : "subdued"}>
            Title: {title.length}/60
          </Text>
          <Text as="p" variant="bodySm" tone={description.length > 160 ? "critical" : "subdued"}>
            Description: {description.length}/160
          </Text>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// T0380 - Social Preview
// ---------------------------------------------------------------------------

export function SocialPreview({
  title,
  description,
  image,
  platform,
}: {
  title: string;
  description: string;
  image?: string;
  platform: "facebook" | "twitter";
}) {
  const isFacebook = platform === "facebook";
  const cardBg = isFacebook ? "#f0f2f5" : "#15202b";
  const cardBorder = isFacebook ? "#dadde1" : "#38444d";
  const titleColor = isFacebook ? "#1d2129" : "#d9d9d9";
  const descColor = isFacebook ? "#606770" : "#8899a6";

  const truncatedTitle = title.length > 70 ? title.slice(0, 70) + "..." : title;
  const truncatedDesc = description.length > 120 ? description.slice(0, 120) + "..." : description;

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">
            {isFacebook ? "Facebook" : "Twitter"} Preview
          </Text>
          <Badge>{platform}</Badge>
        </InlineStack>

        <Box padding="0" borderRadius="200">
          <div
            style={{
              border: `1px solid ${cardBorder}`,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: cardBg,
            }}
          >
            {image && (
              <div
                style={{
                  width: "100%",
                  height: 200,
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            {!image && (
              <div
                style={{
                  width: "100%",
                  height: 200,
                  backgroundColor: isFacebook ? "#e4e6eb" : "#253341",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text as="p" variant="bodySm" tone="subdued">
                  No image
                </Text>
              </div>
            )}
            <div style={{ padding: "12px 16px" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: titleColor,
                  lineHeight: "20px",
                }}
              >
                {truncatedTitle || "Page Title"}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 14,
                  color: descColor,
                  lineHeight: "18px",
                }}
              >
                {truncatedDesc || "Page description will appear here."}
              </p>
            </div>
          </div>
        </Box>
      </BlockStack>
    </Card>
  );
}
