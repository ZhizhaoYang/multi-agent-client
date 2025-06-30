"use client";

import React, { useState, useEffect } from 'react'
import { ThoughtChain } from '@ant-design/x';
import { Card } from 'antd';

import type { ThoughtChainItem, ThoughtChainProps } from '@ant-design/x';
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

  // Reset on new chat (when items array is empty)
  useEffect(() => {
    if (items.length === 0) {
      setExpandedKeys([]);
    }
  }, [items.length]);

  // Keep items collapsed by default - no auto-expansion
  // Users can manually expand items they want to see

  const collapsible: ThoughtChainProps['collapsible'] = {
    expandedKeys,
    onExpand: (keys: string[]) => {
      // User takes control - they can expand/collapse as they wish
      setExpandedKeys(keys);
    },
  };

  return (
    <Card style={{ width: '100%' }} title="Chain of Thought">
      <ThoughtChain items={items} collapsible={collapsible} styles={styles}/>
    </Card>
  )
}

export default ThoughtChainBoard