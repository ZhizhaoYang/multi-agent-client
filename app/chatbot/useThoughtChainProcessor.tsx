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

// Parse department key to extract department name and task info
const parseDepartmentKey = (departmentKey: string): {
    departmentName: string;
    taskId?: string;
    displayTitle: string;
} => {
    if (departmentKey.includes('::')) {
        const [departmentName, taskId] = departmentKey.split('::');
        return {
            departmentName,
            taskId,
            displayTitle: `${departmentName} (Task: ${taskId.slice(0, 8)}...)` // Show first 8 chars of task ID
        };
    }
    return {
        departmentName: departmentKey,
        taskId: undefined,
        displayTitle: departmentKey
    };
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

        activeDepartments.forEach(departmentKey => {
            const { departmentName, taskId, displayTitle } = parseDepartmentKey(departmentKey);

            const config = departmentConfig[departmentName] || {
                title: departmentName,
                icon: <QuestionOutlined />,
                description: "Processing..."
            };

            const textContent = departmentTexts.get(departmentKey) || "";
            const isCompleted = completedDepartments.includes(departmentKey);

                        // Display content as plain text with preserved line breaks via CSS
            const content = textContent.trim()
                ? textContent
                : "Initializing...";

            items.push({
                key: departmentKey, // Use full key (department::task_id) for uniqueness
                title: displayTitle, // Show department + task info
                description: taskId ? `${config.description} (Task ${taskId.slice(0, 8)}...)` : config.description,
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