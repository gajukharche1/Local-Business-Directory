import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "div",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "code",
    "pre",
    "img",
  ],
  allowedAttributes: {
    "*": ["class", "id", "style"],
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
  },
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href || "";
      // Ensure link is https or internal relative path
      const isHttps = href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:");
      const cleanHref = isHttps ? href : "#";

      return {
        tagName,
        attribs: {
          ...attribs,
          href: cleanHref,
          target: "_blank",
          rel: "nofollow noopener noreferrer",
        },
      };
    },
  },
  disallowedTagsMode: "discard",
};

/**
 * Sanitizes rich-text user input against XSS vectors before database writes.
 */
export function sanitizeRichText(dirty: string): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, SANITIZE_OPTIONS).trim();
}

/**
 * Strips all HTML tags entirely for plain-text fields (e.g. titles, reviews, comments).
 */
export function stripHtml(dirty: string): string {
  if (!dirty) return "";
  const spaced = dirty.replace(/>\s*</g, "> <");
  return sanitizeHtml(spaced, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();
}
