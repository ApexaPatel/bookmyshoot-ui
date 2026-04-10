import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FilterDropdown({ value, onValueChange, placeholder, options = [] }) {
  return (
    <Select value={value || '__all__'} onValueChange={(v) => onValueChange(v === '__all__' ? '' : v)}>
      <SelectTrigger className="h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-[#030711]" style={{ backgroundColor: '#030711' }}>
        <SelectItem value="__all__">{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
