// A tag is shown under the filter bar when a filter is selected.
// Tags show what filters have been selected
// On click, the tag is removed and the filter is reset
type TagProps = {
  type: string;
  value: string;
  updateField: (type: string, value: string) => void;
};

export default function Tag({ type, value, updateField }: TagProps) {
  return (
    <span className="">
      {value}
      <button
        type="button"
        aria-label="Remove"
        onClick={() => updateField(type, "")}
      >
        X
      </button>
    </span>
  );
}
