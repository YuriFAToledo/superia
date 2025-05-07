import { ReactNode } from "react";
import { DataSourceToggle } from "./data-source-toggle";

interface HeaderTitleProps {
    title: string;
}

function HeaderTitle({ title }: HeaderTitleProps) {
    return (
        <div>
            <h2 className="text-2xl font-semibold text-black">{title}</h2>
        </div>
    );
}

interface HeaderActionsProps {
    useMockData?: boolean;
    onToggleMockData?: (useMock: boolean) => void;
    actions?: ReactNode;
}

function HeaderActions({ useMockData, onToggleMockData, actions }: HeaderActionsProps) {
    return (
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-start md:items-center mt-4 md:mt-0">
            {useMockData !== undefined && onToggleMockData && (
                <DataSourceToggle 
                    useMockData={useMockData} 
                    onToggle={onToggleMockData} 
                />
            )}
            
            {actions && (
                <div className="flex space-x-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

interface TableHeaderProps {
    title: string;
    description?: string;
    useMockData?: boolean;
    onToggleMockData?: (useMock: boolean) => void;
    actions?: ReactNode;
    className?: string;
}

export function TableHeader({ 
    title, 
    description, 
    useMockData, 
    onToggleMockData,
    actions,
    className = "flex flex-col md:flex-row md:items-center justify-between mb-6"
}: TableHeaderProps) {
    return (
        <div className={className}>
            <HeaderTitle title={title} />
            <HeaderActions 
                useMockData={useMockData}
                onToggleMockData={onToggleMockData}
                actions={actions} 
            />
        </div>
    );
} 