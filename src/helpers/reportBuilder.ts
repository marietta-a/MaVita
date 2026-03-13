export function buildReport(obj: Record<string, unknown>): string {
  let report = "";

  for (const [section, content] of Object.entries(obj)) {
    report += `\n=== ${section.replace(/_/g, " ").toUpperCase()} ===\n`;

    if (typeof content === "object" && content !== null && !Array.isArray(content)) {
      // Handle nested object
      for (const [key, value] of Object.entries(content)) {
        if (Array.isArray(value)) {
          // If array of primitives
          if (value.every(v => typeof v !== "object")) {
            report += `${key}: ${value.join(", ")}\n`;
          } else {
            // Array of objects
            report += `${key}:\n`;
            value.forEach((item, idx) => {
              report += `  Item ${idx + 1}:\n`;
              if (typeof item === "object" && item !== null) {
                for (const [k, v] of Object.entries(item)) {
                  report += `    - ${k}: ${v}\n`;
                }
              } else {
                report += `    - ${item}\n`;
              }
            });
          }
        } else if (typeof value === "object" && value !== null) {
          // Nested object
          report += `${key}:\n`;
          for (const [subKey, subVal] of Object.entries(value)) {
            report += `  - ${subKey}: ${subVal}\n`;
          }
        } else {
          // Primitive
          report += `${key}: ${value}\n`;
        }
      }
    } else if (Array.isArray(content)) {
      // Top-level array
      content.forEach((item, idx) => {
        report += `Item ${idx + 1}:\n`;
        if (typeof item === "object" && item !== null) {
          for (const [k, v] of Object.entries(item)) {
            report += `  - ${k}: ${v}\n`;
          }
        } else {
          report += `  - ${item}\n`;
        }
      });
    } else {
      // Primitive at top level
      report += `${content}\n`;
    }
  }

  // Add Date Generated
  const dateGenerated = new Date().toLocaleString();
  report += `\n=== META INFORMATION ===\n`;
  report += `Date Generated: ${dateGenerated}\n`;

  // Add Disclaimer
  report += `\n=== DISCLAIMER ===\n`;
  report += `This report is auto-generated from available data. It is intended for informational purposes only and should not be considered a substitute for professional medical, nutritional, or clinical advice.\n`;

  return report;
}
