'use server';

/**
 * @fileOverview AI-driven savings suggestions to meet financial goals.
 *
 * - getSavingsSuggestions - A function that provides suggestions for adjusting savings contributions.
 * - SavingsSuggestionsInput - The input type for the getSavingsSuggestions function.
 * - SavingsSuggestionsOutput - The return type for the getSavingsSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SavingsSuggestionsInputSchema = z.object({
  currentSavings: z.number().describe('The current amount of savings.'),
  monthlyContribution: z.number().describe('The current monthly contribution to savings.'),
  interestRate: z.number().describe('The annual interest rate of the savings account.'),
  financialGoal: z.number().describe('The desired financial goal amount.'),
  timeframeYears: z.number().describe('The timeframe in years to achieve the financial goal.'),
  riskTolerance: z
    .enum(['low', 'medium', 'high'])
    .describe('The user risk tolerance: low, medium, or high.'),
});
export type SavingsSuggestionsInput = z.infer<typeof SavingsSuggestionsInputSchema>;

const SavingsSuggestionsOutputSchema = z.object({
  suggestedContributionIncrease: z
    .number()
    .describe(
      'The suggested increase in monthly contribution to reach the financial goal within the timeframe.'
    ),
  revisedTimeframeMonths: z
    .number()
    .describe(
      'The revised timeframe in months to reach the financial goal with the current contribution.'
    ),
  alternativeInvestmentSuggestion: z.string().describe(
    'If risk tolerance is medium or high, suggests alternative investments that might help reach the goal faster.'
  ),
  considerations: z.string().describe('Important considerations or caveats for the user.'),
});
export type SavingsSuggestionsOutput = z.infer<typeof SavingsSuggestionsOutputSchema>;

export async function getSavingsSuggestions(
  input: SavingsSuggestionsInput
): Promise<SavingsSuggestionsOutput> {
  return savingsSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'savingsSuggestionsPrompt',
  input: {schema: SavingsSuggestionsInputSchema},
  output: {schema: SavingsSuggestionsOutputSchema},
  prompt: `You are a financial advisor providing personalized savings suggestions.

  Based on the user's current savings, monthly contributions, interest rate, financial goal, timeframe, and risk tolerance, provide suggestions on how to adjust their savings strategy.

Current Savings: {{{currentSavings}}}
Monthly Contribution: {{{monthlyContribution}}}
Interest Rate: {{{interestRate}}}
Financial Goal: {{{financialGoal}}}
Timeframe (Years): {{{timeframeYears}}}
Risk Tolerance: {{{riskTolerance}}}


Consider the following:

- If the user is unlikely to meet their financial goal within the specified timeframe with their current savings strategy, suggest an increase in monthly contributions.
- Calculate the revised timeframe to reach the financial goal with the current contribution, if the goal is unattainable in the given timeframe.
- If the user's risk tolerance is medium or high, suggest alternative investments that might help them reach their goal faster. Be specific about the type of investment and potential risks.
- Provide important considerations or caveats, such as the impact of inflation or potential changes in interest rates.

Ensure the output is well-formatted and easy to understand.

Output:
`,
});

const savingsSuggestionsFlow = ai.defineFlow(
  {
    name: 'savingsSuggestionsFlow',
    inputSchema: SavingsSuggestionsInputSchema,
    outputSchema: SavingsSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
