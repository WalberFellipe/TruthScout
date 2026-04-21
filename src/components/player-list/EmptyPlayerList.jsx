export function EmptyPlayerList({ message }) {
  return (
    <div
      style={{
        padding: 60,
        textAlign: "center",
        border: "1px dashed var(--line)",
        borderRadius: 18,
        color: "var(--fg-dim)",
      }}
    >
      {message}
    </div>
  );
}
