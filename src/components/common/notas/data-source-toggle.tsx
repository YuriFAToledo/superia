import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Database, Laptop } from "lucide-react"

interface SourceIconProps {
    icon: React.ReactNode;
    active: boolean;
}

function SourceIcon({ icon, active }: SourceIconProps) {
    return (
        <div className={`h-5 w-5 ${active ? 'text-primary' : 'text-gray-400'}`}>
            {icon}
        </div>
    );
}

interface ToggleSwitchProps {
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: string;
    tooltipText: string;
}

function ToggleSwitch({ id, checked, onCheckedChange, label, tooltipText }: ToggleSwitchProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={checked}
                            onCheckedChange={onCheckedChange}
                            id={id}
                        />
                        <Label htmlFor={id}>
                            {label}
                        </Label>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface DataSourceToggleProps {
    useMockData: boolean;
    onToggle: (useMock: boolean) => void;
}

export function DataSourceToggle({ useMockData, onToggle }: DataSourceToggleProps) {
    const handleToggleMockData = (checked: boolean) => {
        onToggle(!checked); // Inverter porque o Switch é true quando está ativo (API)
    };

    const getToggleLabel = () => useMockData ? "Usando dados simulados" : "Usando API real";

    return (
        <div className="flex items-center space-x-2 mb-4">
            <SourceIcon 
                icon={<Laptop />} 
                active={useMockData} 
            />
            
            <ToggleSwitch 
                id="data-source"
                checked={!useMockData}
                onCheckedChange={handleToggleMockData}
                label={getToggleLabel()}
                tooltipText="Alterne entre dados mockados e API real"
            />
            
            <SourceIcon 
                icon={<Database />} 
                active={!useMockData} 
            />
        </div>
    );
} 