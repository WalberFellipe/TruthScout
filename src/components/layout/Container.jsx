/**
 * Largura máxima alinhada ao grid do layout (1320px) + padding horizontal padrão.
 */
export function Container({ as: Tag = "div", children, style, ...rest }) {
  return (
    <Tag
      style={{
        width: "100%",
        maxWidth: 1320,
        margin: "0 auto",
        padding: "0 32px",
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
