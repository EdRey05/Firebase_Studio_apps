"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/contexts/accounts-context";
import { useToast } from "@/hooks/use-toast";
import type { Account, AccountType, InvestmentSubtype } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Account name must be at least 2 characters." }),
  bank: z.string().min(2, { message: "Bank name must be at least 2 characters." }),
  type: z.enum(["savings", "investment"]),
  interestRate: z.coerce.number().optional(),
  subtype: z.enum(["managed", "self-directed"]).optional(),
});

type AddAccountFormProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddAccountForm({ children, open, onOpenChange }: AddAccountFormProps) {
  const { addAccount, accounts } = useAccounts();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bank: "",
      type: "savings",
      interestRate: undefined,
      subtype: undefined,
    },
  });

  const accountType = form.watch("type");

  function onSubmit(values: z.infer<typeof formSchema>) {
    const maxId = accounts.reduce((max, acc) => {
        const currentId = parseInt(acc.id.replace('acc_', ''), 10);
        return isNaN(currentId) ? max : Math.max(max, currentId);
    }, 0);
    const newId = `acc_${String(maxId + 1).padStart(2, '0')}`;
    
    const newAccount: Account = {
      id: newId,
      name: values.name,
      bank: values.bank,
      type: values.type as AccountType,
      ...(values.type === 'savings' && { interestRate: values.interestRate }),
      ...(values.type === 'investment' && { subtype: values.subtype as InvestmentSubtype }),
    };

    addAccount(newAccount);
    toast({
      title: "Account created!",
      description: `Your ${values.name} account has been added.`,
    });
    form.reset({
      name: "",
      bank: "",
      type: "savings",
      interestRate: undefined,
      subtype: undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Enter the details for your new account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Emergency Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank/Institution</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Fidelity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {accountType === "savings" && (
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 4.5" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {accountType === "investment" && (
                <FormField
                    control={form.control}
                    name="subtype"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Investment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select investment type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="managed">Managed</SelectItem>
                            <SelectItem value="self-directed">Self-Directed</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            <DialogFooter>
              <Button type="submit">Create Account</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
