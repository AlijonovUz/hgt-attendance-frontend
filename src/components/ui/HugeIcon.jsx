export const HugeIcon = ({ icon, size = 16, strokeWidth = 2, className = "" }) => (
     <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
     >
          {icon.map(([tag, attrs]) => {
               const Tag = tag;
               const { key, ...rest } = attrs;
               return <Tag key={key} {...rest} strokeWidth={strokeWidth} />;
          })}
     </svg>
);
