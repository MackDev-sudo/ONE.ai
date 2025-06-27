import { Message } from '@/types/chat';

export interface FormattedSection {
  type: 'heading' | 'subheading' | 'text' | 'list' | 'table' | 'emoji-section' | 
        'code' | 'quote' | 'comparison' | 'json' | 'html' | 'numbered-list' | 'code-example' |
        'code-block';  // Removed 'thinking' type since we won't show it
  content: string;
  emoji?: string;
  language?: string;        // For code blocks
  headingLevel?: number;    // For h1-h6
  columns?: string[];       // For tables/comparisons
  metadata?: {             // Additional metadata for special formatting
    title?: string;
    description?: string;
    highlight?: boolean;
    important?: boolean;
    explanation?: string;   // For code examples with explanations
  };
}

export function formatAssistantMessage(content: string): FormattedSection[] {
  const sections: FormattedSection[] = [];
  
  // Remove thinking sections entirely and keep only the final content
  // Handle both <think>...</think> and plain text starting with <think>
  let processedContent = content;
  
  // Remove complete thinking blocks
  const thinkRegex = /<think>[\s\S]*?<\/think>/gi;
  processedContent = processedContent.replace(thinkRegex, '');
  
  // Also remove any remaining incomplete thinking sections at the start
  if (processedContent.trim().startsWith('<think>')) {
    // If there's a complete thinking section, remove it
    const endIndex = processedContent.indexOf('</think>');
    if (endIndex !== -1) {
      processedContent = processedContent.substring(endIndex + 8);
    } else {
      // If it's an incomplete thinking section, remove everything until we find actual content
      const lines = processedContent.split('\n');
      let startIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].trim().startsWith('<think>') && lines[i].trim() !== '') {
          startIndex = i;
          break;
        }
      }
      processedContent = lines.slice(startIndex).join('\n');
    }
  }
  
  processedContent = processedContent.trim();
  
  // If after processing there's no content left, return empty array
  if (!processedContent) {
    return sections;
  }
  
  // Process the content without thinking sections
  const lines = processedContent.split('\n');
  let currentSection: FormattedSection | null = null;
  let codeBlockLanguage: string | null = null;
  let isInCodeBlock = false;

  for (const line of lines) {
    // Skip any remaining thinking content
    if (line.trim().startsWith('<think>') || line.trim().includes('<think>')) {
      continue;
    }
    
    // Detect code blocks
    if (line.startsWith('```')) {
      if (!isInCodeBlock) {
        if (currentSection) sections.push(currentSection);
        const language = line.slice(3).trim();
        codeBlockLanguage = language;
        isInCodeBlock = true;
        currentSection = {
          type: 'code',
          content: '',
          language: language || 'plaintext'
        };
      } else {
        if (currentSection) sections.push(currentSection);
        currentSection = null;
        isInCodeBlock = false;
        codeBlockLanguage = null;
      }
      continue;
    }

    // Handle content inside code blocks
    if (isInCodeBlock && currentSection) {
      currentSection.content += line + '\n';
      continue;
    }

    // Detect emoji sections (e.g., "🏢 Company Overview")
    if (line.match(/^[🏢🚀🔄📈🌱📌📣].*$/)) {
      if (currentSection) sections.push(currentSection);
      const [emoji, ...rest] = line.split(' ');
      currentSection = {
        type: 'emoji-section',
        content: rest.join(' '),
        emoji
      };
      sections.push(currentSection);
      currentSection = null;
      continue;
    }

    // Detect headings
    if (line.startsWith('#')) {
      if (currentSection) sections.push(currentSection);
      const headingMatch = line.match(/^(#+)/);
      if (!headingMatch) continue; // Skip if no valid heading format
      const level = headingMatch[0].length;
      const content = line.replace(/^#+\s+/, '');
      currentSection = {
        type: 'heading',
        content,
        headingLevel: level
      };
      sections.push(currentSection);
      currentSection = null;
      continue;
    }

    // Detect quotes
    if (line.startsWith('>')) {
      if (currentSection?.type !== 'quote') {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: 'quote',
          content: line.slice(1).trim() + '\n'
        };
      } else {
        currentSection.content += line.slice(1).trim() + '\n';
      }
      continue;
    }

    // Detect numbered lists
    if (line.match(/^\d+\.\s/)) {
      if (currentSection?.type !== 'numbered-list') {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: 'numbered-list',
          content: line + '\n'
        };
      } else {
        currentSection.content += line + '\n';
      }
      continue;
    }

    // Detect comparison tables (special format)
    if (line.startsWith('|COMPARE:')) {
      if (currentSection) sections.push(currentSection);
      const columns = line.slice(9).split('|').map(col => col.trim());
      currentSection = {
        type: 'comparison',
        content: '',
        columns
      };
      continue;
    }

    // Detect JSON blocks
    if (line.startsWith('{') || line.startsWith('[')) {
      try {
        JSON.parse(line);
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: 'json',
          content: line
        };
        sections.push(currentSection);
        currentSection = null;
        continue;
      } catch (e) {
        // Not valid JSON, treat as regular text
      }
    }

    // Detect HTML blocks
    if (line.match(/^<[^>]+>/)) {
      if (currentSection?.type !== 'html') {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: 'html',
          content: line + '\n'
        };
      } else {
        currentSection.content += line + '\n';
      }
      continue;
    }

    // Detect tables
    if (line.includes('|')) {
      if (currentSection?.type !== 'table') {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          type: 'table',
          content: line + '\n'
        };
      } else {
        currentSection.content += line + '\n';
      }
      continue;
    }

    // Detect lists
    if (line.match(/^[-•+*]\s/)) {
      if (currentSection?.type !== 'list') {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          type: 'list',
          content: line + '\n'
        };
      } else {
        currentSection.content += line + '\n';
      }
      continue;
    }

    // Regular text
    if (line.trim()) {
      if (!currentSection || currentSection.type !== 'text') {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          type: 'text',
          content: line + '\n'
        };
      } else {
        currentSection.content += line + '\n';
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}
