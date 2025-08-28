export default function YearDropDown({ onSelect }) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="form-group">
      <label htmlFor="year">Choose a year:</label>
      <select
        id="year"
        className="form-control"
        onChange={(e) => onSelect(Number(e.target.value))}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}
