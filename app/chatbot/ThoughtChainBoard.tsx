"use client";

import type { ThoughtChainItem, ThoughtChainProps } from '@ant-design/x';

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ThoughtChain } from '@ant-design/x';
import { SemanticType } from '@ant-design/x/es/thought-chain';

interface Props {
    items: ThoughtChainItem[];
}

const styles: Partial<Record<SemanticType, React.CSSProperties>> = {
  itemHeader: {
    textAlign: 'left',
  },
  itemContent: {
    textAlign: 'left',
    width: '100%',
    whiteSpace: 'pre-line',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    hyphens: 'auto',
    maxWidth: '100%',
    overflow: 'hidden',
  },
};

const ThoughtChainBoard: React.FC<Props> = ({ items }) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const previousItemsRef = useRef<ThoughtChainItem[]>([]);

  // Reset on new chat (when items array is empty)
  useEffect(() => {
    if (items.length === 0) {
      setExpandedKeys([]);
      previousItemsRef.current = [];
    }
  }, [items.length]);

  // Auto-expand new items and auto-collapse completed items
  useEffect(() => {
    if (items.length === 0) return;

    // Use setTimeout to defer state updates to next tick
    const timeoutId = setTimeout(() => {
      const currentKeys = items.map(item => item.key).filter((key): key is string => key !== undefined);
      const previousKeys = previousItemsRef.current.map(item => item.key).filter((key): key is string => key !== undefined);

      // Find new items (just appeared)
      const newKeys = currentKeys.filter(key => !previousKeys.includes(key));

      // Find items that just completed (changed from pending to success)
      const completedKeys = items
        .filter(item => {
          if (!item.key) return false;
          const previousItem = previousItemsRef.current.find(prev => prev.key === item.key);
          return previousItem &&
                 previousItem.status === 'pending' &&
                 item.status === 'success';
        })
        .map(item => item.key)
        .filter((key): key is string => key !== undefined);

      if (newKeys.length > 0 || completedKeys.length > 0) {
        setExpandedKeys(prevExpanded => {
          let newExpanded = [...prevExpanded];

          // Auto-expand new items
          newKeys.forEach(key => {
            if (!newExpanded.includes(key)) {
              newExpanded.push(key);
            }
          });

          // Auto-collapse completed items
          completedKeys.forEach(key => {
            newExpanded = newExpanded.filter(expandedKey => expandedKey !== key);
          });

          return newExpanded;
        });
      }

      // Update previous items for next comparison
      previousItemsRef.current = [...items];
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [items]);

  const handleExpand = useCallback((keys: string[]) => {
    // User can still manually control expansion/collapse
    setExpandedKeys(keys);
  }, []);

  const collapsible: ThoughtChainProps['collapsible'] = {
    expandedKeys,
    onExpand: handleExpand,
  };

  return (
    // <Card style={{ width: '100%' }} title="Chain of Thought">
      <ThoughtChain collapsible={collapsible} items={items} styles={styles}/>
    // </Card>
  )
}

export default ThoughtChainBoard