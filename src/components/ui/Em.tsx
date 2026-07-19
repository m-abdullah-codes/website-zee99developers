/**
 * Renders dashboard-editable copy where *asterisk spans* become styled <em>.
 * Keeps the prospectus italic-gold accents editable without storing markup.
 */
export default function Em({
  text,
  emClass = "italic text-gold",
}: {
  text: string;
  emClass?: string;
}) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} className={emClass}>
            {part}
          </em>
        ) : (
          part
        ),
      )}
    </>
  );
}
