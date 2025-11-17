export const selectStyles = {
  control: (base, s) => ({
    ...base,
    backgroundColor: "#343a40",
    borderColor: s.isFocused ? "#80bdff" : "#6c757d",
    boxShadow: s.isFocused ? "0 0 0 0.2rem rgba(0,123,255,.25)" : "none",
    ":hover": { borderColor: s.isFocused ? "#80bdff" : "#6c757d" },
    minHeight: 38,
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#2d3238",
    zIndex: 2000,
    border: "1px solid #6c757d",
  }),
  option: (base, s) => ({
    ...base,
    backgroundColor: s.isSelected
      ? "#007bff"
      : s.isFocused
      ? "#3b4148"
      : "transparent",
    color: "#e9ecef",
  }),
  singleValue: (b) => ({ ...b, color: "#e9ecef" }),
  input: (b) => ({ ...b, color: "#e9ecef" }),
  placeholder: (b) => ({ ...b, color: "#adb5bd" }),
  multiValue: (b) => ({ ...b, backgroundColor: "#495057" }),
  multiValueLabel: (b) => ({ ...b, color: "#fff" }),
  multiValueRemove: (b) => ({
    ...b,
    color: "#fff",
    ":hover": { opacity: 0.8 },
  }),
  indicatorSeparator: (b) => ({ ...b, backgroundColor: "#6c757d" }),
  dropdownIndicator: (b) => ({ ...b, color: "#adb5bd" }),
  clearIndicator: (b) => ({ ...b, color: "#adb5bd" }),
};
