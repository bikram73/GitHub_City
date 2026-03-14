import React from 'react';

interface YearSelectorProps {
  value: string;
  years: string[];
  onChange: (year: string) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ value, years, onChange }) => {
  return (
    <label className="control-card year-selector">
      <span className="control-label">Select Activity Period</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">All Time</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  );
};

export default YearSelector;