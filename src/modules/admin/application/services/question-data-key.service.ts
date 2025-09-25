// src/modules/admin-application/services/question-data-key.service.ts

import { Injectable } from '@nestjs/common';
// Removed: import slugify from 'slugify';

// Custom slugify function using built-in methods and regex
function customSlugify(text: string): string {
  if (!text) return '';

  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      // Replace non-alphanumeric characters (excluding underscores) with an empty string
      .replace(/[^a-z0-9\s]/g, '')
      // Replace one or more spaces with a single underscore
      .replace(/\s+/g, '_')
  );
}

@Injectable()
export class QuestionDataKeyService {
  private readonly specialKeys = {
    'first name': 'first_name',
    'last name': 'last_name',
    email: 'email',
    'email address': 'email',
    phone: 'phone_number',
    mobile: 'phone_number',
  };

  generate(questionText: string, providedKey?: string): string {
    // 1. If a data key is provided by the admin, use a slugified version of it.
    if (providedKey) {
      return customSlugify(providedKey);
    }

    // 2. Normalize question text for matching.
    const normalizedText = questionText.toLowerCase();

    // 3. Check for a special, predetermined key.
    for (const [keyword, dataKey] of Object.entries(this.specialKeys)) {
      if (normalizedText.includes(keyword)) {
        return dataKey;
      }
    }

    // 4. If no special key is found, generate one from the full question.
    return customSlugify(questionText);
  }
}
