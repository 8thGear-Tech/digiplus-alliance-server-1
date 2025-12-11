/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Types } from 'mongoose';

export interface AssessmentQuestion {
  _id: Types.ObjectId | string;
  question: string;
  question_type:
    | 'multiple_choice_grid'
    | 'single_choice'
    | 'multiple_choice'
    | 'text'
    | string;
  options?: { id: string; label: string }[];
  rows?: { id: string; label: string }[];
  columns?: { id: string; label: string }[];
}
