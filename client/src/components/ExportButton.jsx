import { useState } from "react";

export default function ExportButton({ prompt }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked by browser permissions; fail quietly
      // rather than breaking the rest of the page.
      setCopied(false);
    }
  }

  function handleDownload() {
    const blob = new Blob([prompt], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "ux-requirements-prompt.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="export-actions">
      <button type="button" className="primary-button" onClick={handleCopy}>
        Copy Prompt
      </button>
      <button type="button" className="secondary-button" onClick={handleDownload}>
        Download Prompt
      </button>
      {copied && (
        <span className="copy-confirmation" role="status">
          Prompt copied!
        </span>
      )}
    </div>
  );
}
