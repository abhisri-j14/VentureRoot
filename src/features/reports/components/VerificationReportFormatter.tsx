"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Scale,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  FileText,
  ChevronDown,
  ChevronUp,
  FileCode,
  Layers,
  Printer
} from "lucide-react";

interface VerificationReportFormatterProps {
  reportText: string;
  verdict: "VERIFIED" | "FLAG_WARNING" | "REJECTED";
  complianceScore: number;
  modelUsed?: string;
  retrievedChunksCount?: number;
  businessName?: string;
}

interface ParsedItem {
  title?: string;
  body: string;
  subItems?: string[];
}

interface ParsedSection {
  rawHeading: string;
  cleanHeading: string;
  type: "verified" | "warnings" | "violations" | "citations" | "summary" | "table" | "generic";
  items: ParsedItem[];
  tableData?: { headers: string[]; rows: string[][] };
  rawContent: string;
}

/**
 * Helper to render inline markdown safely (bold, code, quote highlights).
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split by bold (**bold**) and inline code (`code`)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-bold text-gray-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[12px] border border-slate-200"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="italic text-gray-700">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Parses markdown table lines into headers and rows.
 */
function parseMarkdownTable(lines: string[]): { headers: string[]; rows: string[][] } | null {
  const tableLines = lines.filter((l) => l.trim().startsWith("|") && l.trim().endsWith("|"));
  if (tableLines.length < 2) return null;

  const headers = tableLines[0]
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const dataLines = tableLines.slice(1).filter((l) => !l.replace(/[\s|:-]/g, "").length === false);
  const rows: string[][] = [];

  for (const line of dataLines) {
    // Skip divider row like |---|---|
    if (/^[|\s:-]+$/.test(line)) continue;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return { headers, rows };
}

/**
 * Intelligent section classifier based on heading keywords.
 */
function classifySection(heading: string): ParsedSection["type"] {
  const h = heading.toLowerCase();
  if (h.includes("verified") || h.includes("compliant") || h.includes("alignment")) return "verified";
  if (h.includes("warning") || h.includes("flag") || h.includes("concern") || h.includes("advisory")) return "warnings";
  if (h.includes("violation") || h.includes("breach") || h.includes("rejected")) return "violations";
  if (h.includes("citation") || h.includes("reference") || h.includes("statute") || h.includes("rules")) return "citations";
  if (h.includes("summary") || h.includes("recommendation") || h.includes("conclusion") || h.includes("verdict")) return "summary";
  return "generic";
}

/**
 * Parses a section body into items, identifying bullet points, titles, and nested sub-bullets.
 */
function parseSectionItems(content: string): { items: ParsedItem[]; tableData?: { headers: string[]; rows: string[][] } } {
  const lines = content.split("\n");

  // Check if content is primarily a markdown table
  if (lines.some((l) => l.trim().startsWith("|") && l.trim().endsWith("|"))) {
    const tbl = parseMarkdownTable(lines);
    if (tbl && tbl.rows.length > 0) {
      return { items: [], tableData: tbl };
    }
  }

  const items: ParsedItem[] = [];
  let currentItem: ParsedItem | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    // Check for nested sub-bullet (indented by 2+ spaces or tabs, followed by * or -)
    const isSubBullet = /^(\s{2,}|\t+)[*-]\s+/.test(line);

    if (isSubBullet && currentItem) {
      const subContent = trimmed.replace(/^[*-]\s+/, "");
      if (!currentItem.subItems) currentItem.subItems = [];
      currentItem.subItems.push(subContent);
      continue;
    }

    // Check for top-level bullet point (*, -, or 1.)
    const isTopBullet = /^[*-]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);

    if (isTopBullet) {
      if (currentItem) items.push(currentItem);

      const cleaned = trimmed.replace(/^([*-]|\d+\.)\s+/, "");

      // Check if bullet starts with a bold title like **Title:** Body or **Title**: Body
      const titleMatch = cleaned.match(/^\*\*([^*]+)\*\*[:\s]*(.*)/);
      if (titleMatch) {
        currentItem = {
          title: titleMatch[1].trim(),
          body: titleMatch[2].trim(),
        };
      } else {
        currentItem = {
          body: cleaned,
        };
      }
    } else {
      // Continuation of current item or regular paragraph
      if (currentItem) {
        currentItem.body = currentItem.body ? `${currentItem.body} ${trimmed}` : trimmed;
      } else {
        currentItem = {
          body: trimmed,
        };
      }
    }
  }

  if (currentItem) {
    items.push(currentItem);
  }

  return { items };
}

export const VerificationReportFormatter: React.FC<VerificationReportFormatterProps> = ({
  reportText,
  verdict,
  complianceScore,
  modelUsed = "gemini-2.5-flash",
  retrievedChunksCount = 5,
  businessName,
}) => {
  const [viewMode, setViewMode] = useState<"structured" | "raw">("structured");
  const [copied, setCopied] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Copy raw report to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Parse structured sections
  const { sections, leadSummary } = useMemo(() => {
    if (!reportText) return { sections: [], leadSummary: null };

    // Strip redundant leading VERDICT & Compliance Score from the report text
    let cleanText = reportText.replace(/\*\*VERDICT:[^*]+\*\*/gi, "").trim();
    cleanText = cleanText.replace(/\*\*Compliance Score:[^*]+\*\*/gi, "").trim();
    cleanText = cleanText.replace(/^---+\s*/m, "").trim();

    // Split by headings (### or ##)
    const rawBlocks = cleanText.split(/(?=^#{2,4}\s+)/m);
    const parsedSections: ParsedSection[] = [];
    let lead: string | null = null;

    rawBlocks.forEach((block, idx) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;

      const headingMatch = trimmedBlock.match(/^(#{2,4})\s+(.+)$/m);
      if (headingMatch) {
        const rawHeading = headingMatch[2].trim();
        // Clean out emojis and markdown symbols for clean display
        const cleanHeading = rawHeading.replace(/^[^\w\s]+/, "").trim();
        const content = trimmedBlock.substring(headingMatch[0].length).trim();
        const type = classifySection(rawHeading);
        const { items, tableData } = parseSectionItems(content);

        parsedSections.push({
          rawHeading,
          cleanHeading: cleanHeading || rawHeading,
          type,
          items,
          tableData,
          rawContent: content,
        });
      } else if (idx === 0) {
        // Leading introductory text before any heading
        lead = trimmedBlock;
      } else {
        parsedSections.push({
          rawHeading: "General Findings",
          cleanHeading: "General Findings",
          type: "generic",
          items: [{ body: trimmedBlock }],
          rawContent: trimmedBlock,
        });
      }
    });

    return { sections: parsedSections, leadSummary: lead };
  }, [reportText]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* ── Top Header Dossier Bar ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#ebcb2f]/20 border border-[#ebcb2f]/40 flex items-center justify-center shrink-0">
            <Scale className="w-4.5 h-4.5 text-[#ebcb2f]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading text-[15px] font-bold tracking-tight text-white truncate">
                Regulatory Compliance Audit Dossier
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 font-mono text-[10px] tracking-wide uppercase">
                {modelUsed}
              </span>
            </div>
            <p className="font-sans text-[12px] text-slate-300/80 truncate mt-0.5">
              Authoritative statutory evaluation against {retrievedChunksCount} codified regulation chunks
              {businessName ? ` • ${businessName}` : ""}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* View Toggle */}
          <div className="inline-flex bg-slate-800/90 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode("structured")}
              className={`px-2.5 py-1 rounded-md font-sans text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "structured"
                  ? "bg-[#ebcb2f] text-slate-900 shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Structured Executive View"
            >
              <Layers className="w-3 h-3" />
              <span>Structured View</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-2.5 py-1 rounded-md font-sans text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "raw"
                  ? "bg-[#ebcb2f] text-slate-900 shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
              title="View Raw Markdown Source"
            >
              <FileCode className="w-3 h-3" />
              <span>Raw Text</span>
            </button>
          </div>

          {/* Copy Report */}
          <button
            onClick={handleCopy}
            className="p-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Copy Report to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-sans text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="font-sans text-[11px] hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Report Content ───────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 bg-slate-50/50">
        {/* Raw text view mode */}
        {viewMode === "raw" ? (
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-slate-200 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap overflow-x-auto shadow-inner select-text">
            {reportText}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Optional Lead Summary */}
            {leadSummary && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-700 font-sans text-[13.5px] leading-relaxed shadow-xs">
                {renderInlineMarkdown(leadSummary)}
              </div>
            )}

            {/* Render Each Categorized Section */}
            {sections.map((section, sIdx) => {
              const secId = `sec-${sIdx}`;
              const isCollapsed = !!collapsedSections[secId];

              // ── Verified Findings Section ───────────────────────────────
              if (section.type === "verified") {
                return (
                  <div
                    key={sIdx}
                    className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-5 shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <h4 className="font-heading text-[15px] font-bold text-emerald-950">
                          {section.cleanHeading}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 font-sans text-[11px] font-bold">
                          {section.items.length} Compliant
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSection(secId)}
                        className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md"
                        aria-label="Toggle section"
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>

                    {!isCollapsed && (
                      <div className="flex flex-col gap-2.5 pt-1">
                        {section.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="bg-white/95 border border-emerald-200/60 rounded-xl p-3.5 flex items-start gap-3 shadow-xs"
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                              ✓
                            </span>
                            <div className="font-sans text-[13.5px] text-emerald-950 leading-relaxed min-w-0">
                              {item.title && (
                                <span className="font-bold text-gray-900 block sm:inline mr-1.5">
                                  {item.title}:
                                </span>
                              )}
                              <span>{renderInlineMarkdown(item.body)}</span>
                              {item.subItems && item.subItems.length > 0 && (
                                <ul className="mt-2 pl-4 border-l-2 border-emerald-300 space-y-1.5 text-[12.5px] text-gray-700">
                                  {item.subItems.map((sub, sIdx2) => (
                                    <li key={sIdx2} className="list-disc pl-1">
                                      {renderInlineMarkdown(sub)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Warnings & Flags Section ────────────────────────────────
              if (section.type === "warnings") {
                return (
                  <div
                    key={sIdx}
                    className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <h4 className="font-heading text-[15px] font-bold text-amber-950">
                          {section.cleanHeading}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-sans text-[11px] font-bold">
                          {section.items.length} Advisory Flag{section.items.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSection(secId)}
                        className="text-amber-700 hover:text-amber-900 p-1 rounded-md"
                        aria-label="Toggle section"
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>

                    {!isCollapsed && (
                      <div className="flex flex-col gap-3 pt-1">
                        {section.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="bg-white/95 border border-amber-200/80 rounded-xl p-4 shadow-xs"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                                !
                              </span>
                              <div className="flex-1 min-w-0 font-sans text-[13.5px] leading-relaxed text-gray-800">
                                {item.title && (
                                  <div className="font-heading font-bold text-amber-950 text-[14px] mb-1">
                                    {item.title}
                                  </div>
                                )}
                                <div>{renderInlineMarkdown(item.body)}</div>

                                {/* Nested Sub-bullets (e.g. FSSAI, Udyam, Trade license) */}
                                {item.subItems && item.subItems.length > 0 && (
                                  <div className="mt-2.5 pl-3.5 border-l-2 border-amber-300/80 space-y-1.5">
                                    {item.subItems.map((sub, sIdx2) => (
                                      <div
                                        key={sIdx2}
                                        className="font-sans text-[12.5px] text-gray-700 flex items-start gap-2"
                                      >
                                        <span className="text-amber-600 font-bold">•</span>
                                        <span>{renderInlineMarkdown(sub)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Violations Section ──────────────────────────────────────
              if (section.type === "violations") {
                // Check if text says "No violations" or similar
                const fullText = section.rawContent.toLowerCase();
                const isClean =
                  fullText.includes("no direct regulatory violation") ||
                  fullText.includes("no violation") ||
                  fullText.includes("none found") ||
                  fullText.includes("n/a") ||
                  (section.items.length === 1 && fullText.includes("no direct"));

                return (
                  <div
                    key={sIdx}
                    className={`border rounded-2xl p-5 shadow-xs transition-all ${
                      isClean
                        ? "bg-emerald-50/60 border-emerald-200/90"
                        : "bg-rose-50/70 border-rose-200/90"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0 shadow-xs ${
                            isClean ? "bg-emerald-600" : "bg-rose-600"
                          }`}
                        >
                          {isClean ? <ShieldCheck className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
                        </div>
                        <h4
                          className={`font-heading text-[15px] font-bold ${
                            isClean ? "text-emerald-950" : "text-rose-950"
                          }`}
                        >
                          {isClean ? "Statutory Violations Check" : section.cleanHeading}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full font-sans text-[11px] font-bold ${
                            isClean
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-900"
                          }`}
                        >
                          {isClean ? "0 Violations Detected" : `${section.items.length} Violations`}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSection(secId)}
                        className={`p-1 rounded-md ${
                          isClean ? "text-emerald-700 hover:text-emerald-900" : "text-rose-700 hover:text-rose-900"
                        }`}
                        aria-label="Toggle section"
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>

                    {!isCollapsed && (
                      <div className="pt-1">
                        {isClean ? (
                          <div className="bg-white/95 border border-emerald-200/70 rounded-xl p-4 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-heading font-bold text-gray-900 text-[13.5px]">
                                Zero Mandatory Statutory Violations
                              </p>
                              <p className="font-sans text-[13px] text-gray-600 leading-relaxed mt-0.5">
                                {section.rawContent.replace(/^[*-]\s*/m, "").trim()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5">
                            {section.items.map((item, iIdx) => (
                              <div
                                key={iIdx}
                                className="bg-white/95 border border-rose-200 rounded-xl p-3.5 flex items-start gap-3 shadow-xs"
                              >
                                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                                  ✕
                                </span>
                                <div className="font-sans text-[13.5px] text-rose-950 leading-relaxed">
                                  {item.title && (
                                    <span className="font-bold text-gray-900 block sm:inline mr-1.5">
                                      {item.title}:
                                    </span>
                                  )}
                                  <span>{renderInlineMarkdown(item.body)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Regulatory Citations Section ────────────────────────────
              if (section.type === "citations") {
                return (
                  <div
                    key={sIdx}
                    className="bg-slate-100/70 border border-slate-200 rounded-2xl p-5 shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h4 className="font-heading text-[15px] font-bold text-slate-900">
                          {section.cleanHeading}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-sans text-[11px] font-bold">
                          Codified Sources
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSection(secId)}
                        className="text-slate-600 hover:text-slate-900 p-1 rounded-md"
                        aria-label="Toggle section"
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>

                    {!isCollapsed && (
                      <div className="flex flex-col gap-2.5 pt-1">
                        {section.items.map((item, iIdx) => {
                          // Check if citation is pipe separated: Doc | Section | Excerpt
                          const parts = item.body.split("|").map((p) => p.trim());
                          const isPipeSeparated = parts.length >= 2;

                          return (
                            <div
                              key={iIdx}
                              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs"
                            >
                              {isPipeSeparated ? (
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-heading text-[13px] font-bold text-gray-900">
                                      {parts[0].replace(/\.pdf$/i, "")}
                                    </span>
                                    {parts[1] && (
                                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-md font-sans text-[11px] font-semibold">
                                        {parts[1]}
                                      </span>
                                    )}
                                  </div>
                                  {parts[2] && (
                                    <p className="font-sans text-[12.5px] text-gray-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                                      &ldquo;{parts[2].replace(/^["']|["']$/g, "")}&rdquo;
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="font-sans text-[13px] text-gray-800 leading-relaxed flex items-start gap-2.5">
                                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                  <span>{renderInlineMarkdown(item.body)}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Executive Verification Summary Section ───────────────────
              if (section.type === "summary") {
                return (
                  <div
                    key={sIdx}
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-[#ebcb2f]/60 rounded-2xl p-5 text-white shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#ebcb2f] text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                          <Sparkles className="w-4 h-4 text-slate-900" />
                        </div>
                        <h4 className="font-heading text-[15px] font-bold text-white tracking-wide">
                          {section.cleanHeading}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#ebcb2f]/20 text-[#ebcb2f] border border-[#ebcb2f]/30 font-sans text-[11px] font-bold">
                          Executive Takeaway
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSection(secId)}
                        className="text-slate-400 hover:text-white p-1 rounded-md"
                        aria-label="Toggle section"
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>

                    {!isCollapsed && (
                      <div className="pt-1 font-sans text-[13.5px] text-slate-200 leading-relaxed space-y-2">
                        {section.items.map((item, iIdx) => (
                          <div key={iIdx} className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                            {item.title && (
                              <strong className="text-[#ebcb2f] block mb-1 font-semibold">
                                {item.title}
                              </strong>
                            )}
                            <p className="text-slate-100">{renderInlineMarkdown(item.body)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Table Data (if any markdown table was detected) ─────────
              if (section.tableData) {
                return (
                  <div key={sIdx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <h4 className="font-heading text-[15px] font-bold text-slate-900 mb-3">
                      {section.cleanHeading}
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left font-sans text-[13px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            {section.tableData.headers.map((h, hIdx) => (
                              <th key={hIdx} className="px-4 py-2.5">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {section.tableData.rows.map((r, rIdx) => (
                            <tr
                              key={rIdx}
                              className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                            >
                              {r.map((cell, cIdx) => (
                                <td key={cIdx} className="px-4 py-2 text-gray-700">
                                  {renderInlineMarkdown(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              // ── Generic Fallback Section ─────────────────────────────────
              return (
                <div key={sIdx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-heading text-[15px] font-bold text-slate-900">
                      {section.cleanHeading}
                    </h4>
                    <button
                      onClick={() => toggleSection(secId)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                      aria-label="Toggle section"
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isCollapsed && (
                    <div className="flex flex-col gap-2 pt-1 font-sans text-[13.5px] text-gray-800 leading-relaxed">
                      {section.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-start gap-2">
                          <span className="text-slate-400 font-bold">•</span>
                          <div>
                            {item.title && (
                              <strong className="font-bold text-gray-900 mr-1.5">{item.title}:</strong>
                            )}
                            <span>{renderInlineMarkdown(item.body)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer Dossier Disclaimer ────────────────────────────────────── */}
      <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-slate-500 font-sans text-[11.5px]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Cross-verified with Indian MSME, PMEGP, FSSAI, and Ministry Regulations.</span>
        </div>
        <span className="text-slate-400 italic">
          Statutory conditions subject to localized notification updates.
        </span>
      </div>
    </div>
  );
};
