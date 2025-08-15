"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAccounts } from "@/contexts/accounts-context";
import { getSavingsSuggestions, type SavingsSuggestionsOutput } from "@/ai/flows/savings-suggestions";
import { useToast } from "@/hooks/use-toast";
import { calculateBalance } from "@/lib/calculations";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  financialGoal: z.coerce.number().positive("Financial goal must be a positive number."),
  timeframeYears: z.coerce.number().positive("Timeframe must be a positive number."),
  monthlyContribution: z.coerce.number().nonnegative("Monthly contribution cannot be negative."),
  riskTolerance: z.enum(["low", "medium", "high"]),
});

export function AISavingsAssistant({ children }: { children: React.ReactNode }) {
  const { accounts, transactions } = useAccounts();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SavingsSuggestionsOutput | null>(null);

  const totalSavings = accounts.reduce((acc, currentAccount) => {
    const accountTransactions = transactions.filter(t => t.accountId === currentAccount.id);
    return acc + calculateBalance(accountTransactions);
  }, 0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialGoal: 100000,
      timeframeYears: 10,
      monthlyContribution: 500,
      riskTolerance: "medium",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await getSavingsSuggestions({
        ...values,
        currentSavings: totalSavings,
        interestRate: 3, // Average assumption
      });
      setSuggestion(result);
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({
        variant: "destructive",
        title: "AI Assistant Error",
        description: "Could not get savings suggestions at this time.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Savings Assistant</DialogTitle>
          <DialogDescription>
            Get personalized suggestions to reach your financial goals faster.
          </DialogDescription>
        </DialogHeader>
        {!suggestion ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="financialGoal" render={({ field }) => (
                <FormItem><FormLabel>Financial Goal ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="timeframeYears" render={({ field }) => (
                <FormItem><FormLabel>Timeframe (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="monthlyContribution" render={({ field }) => (
                <FormItem><FormLabel>Monthly Contribution ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="riskTolerance" render={({ field }) => (
                <FormItem className="space-y-3"><FormLabel>Risk Tolerance</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="low" /></FormControl><FormLabel className="font-normal">Low</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="medium" /></FormControl><FormLabel className="font-normal">Medium</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="high" /></FormControl><FormLabel className="font-normal">High</FormLabel></FormItem>
                    </RadioGroup>
                  </FormControl><FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Get Suggestion
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-lg">Your Personalized Suggestions:</h3>
            <div>
              <p className="font-medium">Contribution Increase</p>
              <p className="text-sm text-muted-foreground">To meet your goal on time, consider increasing your monthly contribution by <span className="font-bold text-primary">${suggestion.suggestedContributionIncrease.toFixed(2)}</span>.</p>
            </div>
            <Separator />
            <div>
              <p className="font-medium">Revised Timeframe</p>
              <p className="text-sm text-muted-foreground">With your current contribution, it might take about <span className="font-bold text-primary">{suggestion.revisedTimeframeMonths} months</span> to reach your goal.</p>
            </div>
            <Separator />
            <div>
              <p className="font-medium">Alternative Investments</p>
              <p className="text-sm text-muted-foreground">{suggestion.alternativeInvestmentSuggestion}</p>
            </div>
             <Separator />
            <div>
              <p className="font-medium">Important Considerations</p>
              <p className="text-sm text-muted-foreground">{suggestion.considerations}</p>
            </div>
            <DialogFooter>
                <Button onClick={() => setSuggestion(null)}>Get New Suggestion</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
