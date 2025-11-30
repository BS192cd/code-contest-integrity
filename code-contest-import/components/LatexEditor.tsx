'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

export default function LatexEditor({
  value,
  onChange,
  label = 'Description',
  placeholder = 'Enter problem description with LaTeX math notation...',
  minHeight = '400px'
}: LatexEditorProps) {
  const [showPreview, setShowPreview] = useState(true);

  const insertLatex = (before: string, after: string = '') => {
    const textarea = document.getElementById('latex-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const latexButtons = [
    { label: 'x²', latex: '$x^{2}$', tooltip: 'Superscript' },
    { label: 'xₙ', latex: '$x_{n}$', tooltip: 'Subscript' },
    { label: 'a/b', latex: '$\\frac{a}{b}$', tooltip: 'Fraction' },
    { label: '√', latex: '$\\sqrt{x}$', tooltip: 'Square root' },
    { label: '∑', latex: '$\\sum_{i=1}^{n}$', tooltip: 'Summation' },
    { label: '∫', latex: '$\\int_{a}^{b}$', tooltip: 'Integral' },
    { label: '≤', latex: '$\\le$', tooltip: 'Less than or equal' },
    { label: '≥', latex: '$\\ge$', tooltip: 'Greater than or equal' },
    { label: 'α', latex: '$\\alpha$', tooltip: 'Greek alpha' },
    { label: 'θ', latex: '$\\theta$', tooltip: 'Greek theta' },
    { label: '$$', latex: '$$\n\n$$', tooltip: 'Display math block' },
  ];

  const markdownButtons = [
    { label: 'H1', before: '# ', tooltip: 'Heading 1' },
    { label: 'H2', before: '## ', tooltip: 'Heading 2' },
    { label: 'B', before: '**', after: '**', tooltip: 'Bold' },
    { label: 'I', before: '*', after: '*', tooltip: 'Italic' },
    { label: 'Code', before: '`', after: '`', tooltip: 'Inline code' },
    { label: '```', before: '```\n', after: '\n```', tooltip: 'Code block' },
    { label: 'Link', before: '[', after: '](url)', tooltip: 'Link' },
    { label: 'List', before: '- ', tooltip: 'Bullet list' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-primary hover:underline"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Toolbar */}
      <div className="border rounded-t-lg bg-muted p-2 space-y-2">
        {/* Markdown Buttons */}
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground mr-2 self-center">Markdown:</span>
          {markdownButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertLatex(btn.before, btn.after)}
              className="px-2 py-1 text-xs bg-background border rounded hover:bg-accent"
              title={btn.tooltip}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* LaTeX Buttons */}
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground mr-2 self-center">LaTeX:</span>
          {latexButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertLatex(btn.latex)}
              className="px-2 py-1 text-xs bg-background border rounded hover:bg-accent"
              title={btn.tooltip}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor and Preview */}
      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {/* Editor */}
        <div>
          <textarea
            id="latex-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 border rounded-b-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ minHeight }}
          />
          <div className="mt-1 text-xs text-muted-foreground">
            Use $...$ for inline math, $$...$$ for display math
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="border rounded-lg p-4 bg-background overflow-auto" style={{ minHeight }}>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {value || '*Preview will appear here...*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">
          LaTeX Quick Reference
        </summary>
        <div className="mt-2 p-3 bg-muted rounded space-y-1">
          <div><code>$x^n$</code> → xⁿ (superscript)</div>
          <div><code>$x_i$</code> → xᵢ (subscript)</div>
          <div><code>$\frac{'{a}'}{'{b}'}$</code> → a/b (fraction)</div>
          <div><code>$\sqrt{'{x}'}$</code> → √x (square root)</div>
          <div><code>$\sum_{'{i=1}'}^{'{n}'}$</code> → Σ (summation)</div>
          <div><code>$\int_{'{a}'}^{'{b}'}$</code> → ∫ (integral)</div>
          <div><code>$\le$</code> → ≤, <code>$\ge$</code> → ≥</div>
          <div><code>$\alpha$</code> → α, <code>$\beta$</code> → β, <code>$\theta$</code> → θ</div>
          <div><code>$$...$$</code> → Display math (centered, larger)</div>
        </div>
      </details>
    </div>
  );
}
