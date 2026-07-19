/**
 * Renders a JSON-LD structured-data block. `<` is escaped so the serialized
 * JSON can never break out of the surrounding <script> tag.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
