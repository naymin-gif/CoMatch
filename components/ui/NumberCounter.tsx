import { ChangeEvent } from "react";
import { Button } from "./button";
import { FaCaretUp } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa6";
import { Input } from "./input";

interface NumberCounterProps {
    min?: number;
    value: number | string; 
    onChange: (val: number) => void;
}

export default function NumberCounter({
    min,
    value, 
    onChange, 
}: NumberCounterProps) {

    const handleUp = () => {
        const current = typeof value === "string" ? parseInt(value, 10) || 0 : value;
        onChange(current + 1);
    };

    const handleDown = () => {
        const current = typeof value === "string" ? parseInt(value, 10) || 0 : value;
        const next = current - 1;
        onChange(min !== undefined && next < min ? min : next);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "") {
            onChange(min !== undefined ? min : 0); 
            return;
        }
        
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
            onChange(num);
        }
    };

    const handleBlur = () => {
        if (value === "") {
            onChange(min !== undefined ? min : 0);
            return;
        }

        const currentNum = typeof value === "string" ? parseInt(value, 10) : value;
        
        if (min !== undefined && currentNum < min) {
            onChange(min);
        }
    };

    return (
        <div className="flex flex-row items-center">
            <Input
                type="number"
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                min={min}
            />
            <div className="flex flex-col">
                <Button variant="ghost" className="p-0 h-fit" onClick={handleUp}>
                    <FaCaretUp />
                </Button>
                <Button variant="ghost" className="p-0 h-fit" onClick={handleDown}>
                    <FaCaretDown />
                </Button>
            </div>
        </div>
    );
}