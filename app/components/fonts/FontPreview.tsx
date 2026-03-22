import React, { useState } from 'react';
import {
  Card,
  ChoiceList,
  Select,
  Text,
  Stack,
  InlineStack,
  Box,
} from '@shopify/polaris';
import {
  ARABIC_FONTS,
  getFontById,
  getFontsByCategory,
  getFontsFor,
  FONT_PAIRINGS,
  type FontConfig,
  type ArabicFont,
} from '../../services/fonts';

interface FontPreviewProps {
  config: FontConfig;
  onChange: (config: FontConfig) => void;
}

const PREVIEW_TEXTS = {
  heading: 'مرحباً بكم في متجرنا',
  body: 'هذا نص تجريبي لعرض خط العربية. يمكنك رؤية كيف يبدو الخط في المحتوى الطبيعي للمتجر.',
  accent: 'عروض خاصة - تخفيضات 50%',
};

const SAMPLE_SIZES = {
  heading: '2rem',
  body: '1rem',
  accent: '1.25rem',
};

export function FontPreview({ config, onChange }: FontPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'single' | 'pairing'>('single');
  const [selectedPairing, setSelectedPairing] = useState<string>('modern-blog');

  const headingFont = getFontById(config.arabic.heading);
  const bodyFont = getFontById(config.arabic.body);
  const accentFont = config.arabic.accent ? getFontById(config.arabic.accent) : null;

  const handleFontChange = (type: 'heading' | 'body' | 'accent', fontId: string) => {
    onChange({
      ...config,
      arabic: {
        ...config.arabic,
        [type]: fontId,
      },
    });
  };

  const handlePairingSelect = (pairingKey: string) => {
    const pairing = FONT_PAIRINGS[pairingKey as keyof typeof FONT_PAIRINGS];
    if (pairing) {
      onChange({
        ...config,
        arabic: {
          heading: pairing.heading,
          body: pairing.body,
          accent: pairing.accent,
        },
      });
    }
  };

  const fontOptions = ARABIC_FONTS.map((font) => ({
    label: font.name,
    value: font.id,
  }));

  const pairingOptions = [
    { label: 'Modern Blog', value: 'modern-blog' },
    { label: 'Traditional Store', value: 'traditional-store' },
    { label: 'Corporate', value: 'corporate' },
    { label: 'Tech Startup', value: 'tech-startup' },
  ];

  return (
    <Card>
      <Box padding="400">
        <Stack gap="400">
          <Text variant="headingMd" as="h2">
            Arabic Font Selection
          </Text>

          <ChoiceList
            title="Selection Mode"
            choices={[
              { label: 'Single Fonts', value: 'single' },
              { label: 'Font Pairing Preset', value: 'pairing' },
            ]}
            selected={[previewMode]}
            onChange={(selected) => setPreviewMode(selected[0] as 'single' | 'pairing')}
          />

          {previewMode === 'pairing' ? (
            <Select
              label="Font Pairing"
              options={pairingOptions}
              value={selectedPairing}
              onChange={(value) => {
                setSelectedPairing(value);
                handlePairingSelect(value);
              }}
            />
          ) : (
            <Stack gap="300">
              <Select
                label="Heading Font"
                options={fontOptions}
                value={config.arabic.heading}
                onChange={(value) => handleFontChange('heading', value)}
                helpText={headingFont?.description}
              />
              <Select
                label="Body Font"
                options={fontOptions}
                value={config.arabic.body}
                onChange={(value) => handleFontChange('body', value)}
                helpText={bodyFont?.description}
              />
              <Select
                label="Accent Font (Optional)"
                options={[{ label: 'Same as heading', value: '' }, ...fontOptions]}
                value={config.arabic.accent || ''}
                onChange={(value) => handleFontChange('accent', value || '')}
                helpText={accentFont?.description}
              />
            </Stack>
          )}

          {/* Font Preview */}
          <Box
            padding="400"
            background="bg-surface-secondary"
            borderRadius="200"
            style={{ direction: 'rtl' }}
          >
            <Stack gap="400">
              <Text variant="headingSm" as="h3">
                Preview
              </Text>

              {/* Heading Preview */}
              <div
                style={{
                  fontFamily: headingFont?.family || 'inherit',
                  fontSize: SAMPLE_SIZES.heading,
                  fontWeight: config.weights.heading,
                }}
              >
                {PREVIEW_TEXTS.heading}
              </div>

              {/* Body Preview */}
              <div
                style={{
                  fontFamily: bodyFont?.family || 'inherit',
                  fontSize: SAMPLE_SIZES.body,
                  fontWeight: config.weights.body,
                  lineHeight: 1.6,
                }}
              >
                {PREVIEW_TEXTS.body}
              </div>

              {/* Accent Preview */}
              <div
                style={{
                  fontFamily: accentFont?.family || headingFont?.family || 'inherit',
                  fontSize: SAMPLE_SIZES.accent,
                  fontWeight: config.weights.bold,
                  color: 'var(--p-color-text-info)',
                }}
              >
                {PREVIEW_TEXTS.accent}
              </div>
            </Stack>
          </Box>

          {/* Selected Fonts Info */}
          <Box padding="300" background="bg-surface" borderRadius="200">
            <Stack gap="200">
              <Text variant="headingXs" as="h4">
                Selected Fonts
              </Text>
              <InlineStack gap="200">
                <Text as="span" variant="bodySm">
                  Heading: <strong>{headingFont?.name}</strong>
                </Text>
                <Text as="span" variant="bodySm">
                  Body: <strong>{bodyFont?.name}</strong>
                </Text>
                {accentFont && (
                  <Text as="span" variant="bodySm">
                    Accent: <strong>{accentFont.name}</strong>
                  </Text>
                )}
              </InlineStack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

export default FontPreview;
