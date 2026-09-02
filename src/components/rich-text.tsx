function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="prose-agent text-[14.5px] leading-6 text-ink-soft">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.every((line) => /^[-•]/.test(line.trim()) || line.trim() === "");
        if (isList) {
          return (
            <ul key={bi} className="list-disc">
              {lines
                .filter((l) => l.trim())
                .map((line, li) => (
                  <li key={li}>{renderInline(line.replace(/^[-•]\s*/, ""), `${bi}-${li}`)}</li>
                ))}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {lines.map((line, li) => (
              <span key={li}>
                {li > 0 && <br />}
                {renderInline(line, `${bi}-${li}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
