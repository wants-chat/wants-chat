import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Icon from '@mdi/react';
import { mdiMagnify, mdiBarcode, mdiClose } from '@mdi/js';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBarcodeClick: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onBarcodeClick
}) => {
  return (
    <Card className="p-4 bg-white/5 border border-white/10">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Icon
            path={mdiMagnify}
            size={0.8}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
          />
          <Input
            type="text"
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 bg-transparent hover:bg-white/10 text-white/60"
              onClick={() => onSearchChange('')}
            >
              <Icon path={mdiClose} size={0.6} />
            </Button>
          )}
        </div>
        <Button
          size="icon"
          onClick={onBarcodeClick}
          className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
        >
          <Icon path={mdiBarcode} size={0.8} />
        </Button>
      </div>
    </Card>
  );
};

export default SearchBar;