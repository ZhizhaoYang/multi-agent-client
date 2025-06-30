import { useMemo } from 'react';
import { CalculatorOutlined, SearchOutlined, BulbOutlined, QuestionOutlined, AuditOutlined } from '@ant-design/icons';
import type { ThoughtChainItem } from '@ant-design/x';

// Department configuration for ThoughtChain UI
const departmentConfig: Record<string, {
    title: string;
    icon: React.ReactNode;
    description: string;
}> = {
    "Assessment": {
        title: "Assessment",
        icon: <AuditOutlined />,
        description: "Analyzing query and planning tasks"
    },
    "MathDepartment": {
        title: "Math Department",
        icon: <CalculatorOutlined />,
        description: "Solving mathematical problems"
    },
    "WebDepartment": {
        title: "Web Department",
        icon: <SearchOutlined />,
        description: "Gathering online information"
    },
    "GeneralKnowledge": {
        title: "General Knowledge",
        icon: <BulbOutlined />,
        description: "Providing general assistance"
    },
    "Aggregator": {
        title: "Aggregator",
        icon: <AuditOutlined />,
        description: "Aggregating information"
    },
    "Supervisor": {
        title: "Supervisor",
        icon: <AuditOutlined />,
        description: "Dispatching tasks to departments"
    }
};

interface UseThoughtChainProcessorParams {
    departmentTexts: Map<string, string>;
    activeDepartments: string[];
    completedDepartments: string[];
}

export const useThoughtChainProcessor = ({
    departmentTexts,
    activeDepartments,
    completedDepartments
}: UseThoughtChainProcessorParams): ThoughtChainItem[] => {

    const thoughtChainItems = useMemo<ThoughtChainItem[]>(() => {
        const items: ThoughtChainItem[] = [];

        activeDepartments.forEach(department => {
            const config = departmentConfig[department] || {
                title: department,
                icon: <QuestionOutlined />,
                description: "Processing..."
            };

            const textContent = departmentTexts.get(department) || "";
            const isCompleted = completedDepartments.includes(department);

                        // Display content as plain text with preserved line breaks via CSS
            const content = textContent.trim()
                ? textContent
                : "Initializing...";

            items.push({
                key: department,
                title: config.title,
                description: config.description,
                icon: config.icon,
                status: isCompleted ? 'success' : 'pending',
                content: content
            });
        });

        return items;
    }, [departmentTexts, activeDepartments, completedDepartments]);

    return thoughtChainItems;
};

export default useThoughtChainProcessor;