import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select Model',
  includeAllOption = false,
  allOptionLabel = 'All Model',
  disabled = false,
  className = '',
  buttonClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format options: support strings or objects { label, value, line, machine, model, name }
  const formattedOptions = [];
  if (includeAllOption) {
    formattedOptions.push({ label: allOptionLabel, value: '' });
  }
  options.forEach((opt) => {
    if (typeof opt === 'string') {
      formattedOptions.push({ label: opt, value: opt });
    } else if (opt && typeof opt === 'object') {
      const label = opt.label || opt.line || opt.machine || opt.model || opt.name || String(opt.value);
      const val = opt.value !== undefined ? opt.value : (opt.line || opt.machine || opt.model || opt.name);
      formattedOptions.push({
        label,
        value: val
      });
    }
  });

  const selectedOption = formattedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : (value || placeholder);

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block w-full text-left select-none ${isOpen ? 'z-40' : ''} ${className}`}
    >
      {/* Trigger Box */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 bg-white border border-[#D0D5DD] text-sm text-[#1E232F] font-normal transition-colors focus:outline-none focus:border-[#00A854] ${
          buttonClassName || 'h-[38px] rounded-lg'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-gray-400'
        }`}
      >
        <span className={`truncate ${!value && !selectedOption ? 'text-gray-400' : 'text-[#1E232F]'}`}>
          {displayLabel}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#475467] ml-2 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#475467] ml-2 flex-shrink-0" />
        )}
      </button>

      {/* Dropdown Menu Popup - Width exactly matches the field width */}
      {isOpen && (
        <div className="absolute left-0 right-0 w-full mt-1.5 bg-white border border-[#D0D5DD] rounded-lg shadow-lg z-50 overflow-hidden py-0 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {formattedOptions.map((opt, index) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value + '_' + index}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3.5 py-2.5 text-sm text-[#1E232F] cursor-pointer transition-colors hover:bg-[#F8F9FC] ${
                  index < formattedOptions.length - 1 ? 'border-b border-[#E4E7EC]' : ''
                } ${isSelected ? 'bg-emerald-50/60 font-medium text-[#00A854]' : ''}`}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
