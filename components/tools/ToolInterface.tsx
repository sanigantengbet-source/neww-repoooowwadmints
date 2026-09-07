'use client';

import React from 'react';
import type { Tool } from '@/types';
import JsonFormatterTool from './JsonFormatterTool';
import JsonValidatorTool from './JsonValidatorTool';
import Base64Tool from './Base64Tool';
import UuidGeneratorTool from './UuidGeneratorTool';
import PasswordGeneratorTool from './PasswordGeneratorTool';
import UrlEncoderTool from './UrlEncoderTool';
import TimestampConverterTool from './TimestampConverterTool';
import ColorConverterTool from './ColorConverterTool';
import SlugGeneratorTool from './SlugGeneratorTool';
import WordCounterTool from './WordCounterTool';
import QrCodeGeneratorTool from './QrCodeGeneratorTool';
import TextCaseConverterTool from './TextCaseConverterTool';

interface ToolInterfaceProps {
  tool: Tool;
}

export default function ToolInterface({ tool }: ToolInterfaceProps) {
  switch (tool.slug) {
    case 'json-formatter':
      return <JsonFormatterTool />;
    case 'json-validator':
      return <JsonValidatorTool />;
    case 'base64-encoder-decoder':
      return <Base64Tool />;
    case 'uuid-generator':
      return <UuidGeneratorTool />;
    case 'password-generator':
      return <PasswordGeneratorTool />;
    case 'url-encoder-decoder':
      return <UrlEncoderTool />;
    case 'timestamp-converter':
      return <TimestampConverterTool />;
    case 'color-converter':
      return <ColorConverterTool />;
    case 'slug-generator':
      return <SlugGeneratorTool />;
    case 'word-counter':
      return <WordCounterTool />;
    case 'qr-code-generator':
      return <QrCodeGeneratorTool />;
    case 'text-case-converter':
      return <TextCaseConverterTool />;
    default:
      return (
        <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center space-y-2">
          <p className="text-zinc-300 font-medium">Interactive tool interface is active.</p>
          <p className="text-xs text-zinc-500">
            This tool ({tool.name}) is configured and running client-side.
          </p>
        </div>
      );
  }
}
