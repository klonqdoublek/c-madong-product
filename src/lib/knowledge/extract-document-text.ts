import JSZip from "jszip";
import { extractText } from "unpdf";

const WORDPROCESSINGML_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

export class DocumentExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentExtractionError";
  }
}

interface ExtractDocumentTextInput {
  fileName: string;
  contentType?: string | null;
  buffer: ArrayBuffer;
}

export function isSupportedKnowledgeFile(fileName: string, contentType?: string | null) {
  const lowerName = fileName.toLowerCase();

  return (
    !!contentType?.startsWith("text/") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".pdf") ||
    lowerName.endsWith(".docx")
  );
}

export async function extractDocumentText({
  fileName,
  contentType,
  buffer,
}: ExtractDocumentTextInput): Promise<string> {
  const lowerName = fileName.toLowerCase();

  if (contentType?.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
    return new TextDecoder().decode(buffer).trim();
  }

  if (lowerName.endsWith(".pdf") || contentType === "application/pdf") {
    try {
      const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
      return text.trim();
    } catch (error) {
      throw new DocumentExtractionError(
        `Failed to parse PDF content: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  if (
    lowerName.endsWith(".docx") ||
    contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(buffer);
  }

  throw new DocumentExtractionError(
    "Unsupported file type. Upload a TXT, MD, PDF, or DOCX document."
  );
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const xmlPaths = Object.keys(zip.files)
      .filter(
        (path) =>
          path === "word/document.xml" ||
          /^word\/header\d+\.xml$/.test(path) ||
          /^word\/footer\d+\.xml$/.test(path)
      )
      .sort((a, b) => {
        if (a === "word/document.xml") return -1;
        if (b === "word/document.xml") return 1;
        return a.localeCompare(b);
      });

    if (xmlPaths.length === 0) {
      throw new DocumentExtractionError("DOCX file is missing document.xml");
    }

    const parts = await Promise.all(
      xmlPaths.map(async (path) => {
        const xml = await zip.file(path)?.async("text");
        return xml ? xmlToPlainText(xml) : "";
      })
    );

    const text = parts
      .join("\n\n")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      throw new DocumentExtractionError("DOCX text extraction produced no content");
    }

    return text;
  } catch (error) {
    if (error instanceof DocumentExtractionError) {
      throw error;
    }

    throw new DocumentExtractionError(
      `Failed to parse DOCX content: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}

function xmlToPlainText(xml: string): string {
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const paragraphs = Array.from(doc.getElementsByTagNameNS(WORDPROCESSINGML_NS, "p"));
    const lines = paragraphs.map((paragraph) => paragraphToText(paragraph));
    return lines.filter(Boolean).join("\n");
  }

  return fallbackXmlToText(xml);
}

function paragraphToText(paragraph: Element): string {
  let text = "";

  for (const node of Array.from(paragraph.childNodes)) {
    text += nodeToText(node);
  }

  return text.trimEnd();
}

function nodeToText(node: Node): string {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as Element;

  if (element.localName === "r") {
    return Array.from(element.childNodes).map(nodeToText).join("");
  }

  if (element.localName === "t") {
    return decodeXmlEntities(element.textContent ?? "");
  }

  if (element.localName === "tab") {
    return "\t";
  }

  if (element.localName === "br" || element.localName === "cr") {
    return "\n";
  }

  if (element.localName === "hyperlink" || element.localName === "smartTag") {
    return Array.from(element.childNodes).map(nodeToText).join("");
  }

  return "";
}

function fallbackXmlToText(xml: string): string {
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:(br|cr)\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((line) => decodeXmlEntities(line).trimEnd())
    .filter(Boolean)
    .join("\n");
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#xA;/gi, "\n")
    .replace(/&#10;/g, "\n")
    .replace(/&#x9;/gi, "\t")
    .replace(/&#9;/g, "\t");
}
