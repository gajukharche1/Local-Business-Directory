"use client";

import { useState } from "react";
import {
  Code,
  Eye,
  Sparkles,
  Columns,
  Table,
  AlertTriangle,
  HelpCircle,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Minus,
} from "lucide-react";

interface ContentBlockEditorProps {
  initialValue?: string;
  name?: string;
  required?: boolean;
  error?: string;
}

const HTML_TEMPLATES = [
  {
    name: "Feature Highlights Grid",
    icon: Columns,
    description: "2-column visual grid for key business offerings & USPs",
    html: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
  <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; background: #f8fafc;">
    <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 700; color: #1e293b;">⚡ Certified Specialists</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #64748b;">Experienced professionals with verified credentials in Pimple Saudagar.</p>
  </div>
  <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; background: #f8fafc;">
    <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 700; color: #1e293b;">🛡️ 100% Satisfaction</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #64748b;">Transparent pricing with no hidden charges and dedicated support.</p>
  </div>
</div>`,
  },
  {
    name: "Service & Pricing Table",
    icon: Table,
    description: "Clean HTML table for services, consultations, or package rates",
    html: `<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.875rem;">
  <thead>
    <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left;">
      <th style="padding: 0.75rem 1rem; font-weight: 700;">Service / Package</th>
      <th style="padding: 0.75rem 1rem; font-weight: 700;">Duration</th>
      <th style="padding: 0.75rem 1rem; font-weight: 700; text-align: right;">Starting Price</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 0.75rem 1rem;">Primary Consultation</td>
      <td style="padding: 0.75rem 1rem;">30 mins</td>
      <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 600;">₹500</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 0.75rem 1rem;">Comprehensive Package</td>
      <td style="padding: 0.75rem 1rem;">60 mins</td>
      <td style="padding: 0.75rem 1rem; text-align: right; font-weight: 600;">₹1,200</td>
    </tr>
  </tbody>
</table>`,
  },
  {
    name: "Callout / Notice Banner",
    icon: AlertTriangle,
    description: "Highlighted alert block for offers, timings, or customer advice",
    html: `<div style="padding: 1rem 1.25rem; border-left: 4px solid #2563eb; background: #eff6ff; border-radius: 0.5rem; margin: 1.5rem 0;">
  <strong style="color: #1e40af; font-size: 0.95rem; display: block; margin-bottom: 0.25rem;">📢 Special Community Notice</strong>
  <p style="margin: 0; color: #1e3a8a; font-size: 0.875rem;">Prior appointment recommended on weekends. Walk-ins welcomed subject to doctor availability.</p>
</div>`,
  },
  {
    name: "Frequently Asked Questions",
    icon: HelpCircle,
    description: "Pre-structured Q&A content block for customers",
    html: `<div style="margin: 1.5rem 0;">
  <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 0.75rem; color: #0f172a;">Frequently Asked Questions</h3>
  <div style="margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9;">
    <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 600; color: #1e293b;">Do you have reserved parking?</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">Yes, dedicated visitor basement parking is available at the building premises.</p>
  </div>
  <div style="margin-bottom: 1rem;">
    <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 600; color: #1e293b;">What payment modes are accepted?</h4>
    <p style="margin: 0; font-size: 0.875rem; color: #475569;">We accept UPI (GPay/PhonePe), Credit Cards, Debit Cards, and Net Banking.</p>
  </div>
</div>`,
  },
];

export function ContentBlockEditor({
  initialValue = "",
  name = "description",
  required = true,
  error,
}: ContentBlockEditorProps) {
  const [content, setContent] = useState(
    initialValue ||
      `<p>Welcome to our business in Pimple Saudagar. We provide premier local services tailored for residents and families across PCMC.</p>`
  );
  const [activeTab, setActiveTab] = useState<"visual" | "code">("visual");

  const insertTag = (openTag: string, closeTag: string, defaultText: string) => {
    const snippet = `${openTag}${defaultText}${closeTag}`;
    setContent((prev) => prev + "\n" + snippet);
  };

  const insertTemplate = (templateHtml: string) => {
    setContent((prev) => prev.trim() + "\n\n" + templateHtml);
  };

  return (
    <div className="space-y-3">
      {/* Editor Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "visual"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Visual Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "code"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>HTML Code Structure</span>
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertTag("<h2>", "</h2>", "Section Heading")}
            title="Add Heading 2"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag("<h3>", "</h3>", "Sub-heading")}
            title="Add Heading 3"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <Heading3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag("<strong>", "</strong>", "Important text")}
            title="Bold"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag("<em>", "</em>", "Emphasized text")}
            title="Italic"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertTag("<ul>\n  <li>", "</li>\n  <li>Second item</li>\n</ul>", "First feature")
            }
            title="Bullet List"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertTag("<ol>\n  <li>", "</li>\n  <li>Step two</li>\n</ol>", "Step one")
            }
            title="Numbered List"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertTag("<blockquote>", "</blockquote>", "Customer quote or specialty note")
            }
            title="Quote"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setContent((prev) => prev + "\n<hr />")}
            title="Horizontal Divider"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === "visual" ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-background p-4 min-h-[220px] max-h-[450px] overflow-y-auto">
            <div
              className="prose prose-sm max-w-none text-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Visual mode is rendering your formatted content and custom HTML blocks.</span>
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className="text-primary hover:underline font-semibold"
            >
              Switch to Code View to Edit Markup →
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl border border-border overflow-hidden bg-slate-950">
            <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>HTML Source Code (Direct Markup Allowed)</span>
              <span>UTF-8 · Sanitized</span>
            </div>
            <textarea
              name={name}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required={required}
              rows={10}
              placeholder="<div>Enter or paste HTML content blocks here...</div>"
              className="w-full bg-slate-950 p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 selection:bg-emerald-900"
            ></textarea>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>You can directly paste HTML tags: &lt;div&gt;, &lt;table&gt;, &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, etc.</span>
            <span>{content.length} characters</span>
          </div>
        </div>
      )}

      {/* Hidden input to ensure form submission captures content even if in visual tab */}
      {activeTab === "visual" && (
        <input type="hidden" name={name} value={content} />
      )}

      {/* Pre-made HTML Content Block Inserters */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Insert Ready-Made HTML Content Blocks</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Click any block below to append a pre-styled, responsive HTML element into your listing:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
          {HTML_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => insertTemplate(tmpl.html)}
                className="flex flex-col text-left p-2.5 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition group"
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground group-hover:text-primary mb-1">
                  <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{tmpl.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {tmpl.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

