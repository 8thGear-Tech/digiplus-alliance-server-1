import { Injectable } from '@nestjs/common';

function customSlugify(text: string, separator: '_' | '-'): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, separator);
}

@Injectable()
export class QuestionDataKeyService {
  private readonly specialKeys = {
    'company name': 'company_name',
    'first name': 'first_name',
    'last name': 'last_name',
    'phone number': 'phone_number',
    'reason for applying': 'reason_for_applying',
    email: 'email',
  };

  generate(questionText: string, existingKeys: string[]): string {
    const normalizedText = questionText.toLowerCase().trim();
    let baseKey: string;

    if (this.specialKeys[normalizedText]) {
      baseKey = this.specialKeys[normalizedText];
    } else {
      baseKey = customSlugify(questionText, '_');
    }

    let newKey = baseKey;
    let counter = 1;
    while (existingKeys.includes(newKey)) {
      newKey = `${baseKey}_${counter}`;
      counter++;
    }

    return newKey;
  }

  generateSlug(text: string): string {
    return customSlugify(text, '-');
  }
}
