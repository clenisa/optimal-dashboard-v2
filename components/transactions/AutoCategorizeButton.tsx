"use client";

import * as React from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AutoCategorizeButton({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<number>(0);
  const [credits, setCredits] = React.useState<number | null>(null);
  const [count, setCount] = React.useState<number>(0);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { count: p } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .is("provider", null)
        .not("description", "is", null);
      setPending(p ?? 0);

      try {
        const { data } = await supabase.from("profiles").select("credits").single();
        setCredits(typeof data?.credits === "number" ? data.credits : null);
      } catch { setCredits(null); }
    })();
  }, []);

  function onOpen() {
    if (pending <= 0) {
      toast.info("No transactions to auto-categorize.");
      return;
    }
    setCount(Math.min(pending, credits ?? pending));
    setOpen(true);
  }

  async function run() {
    setOpen(false);
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("infer-providers", {
        body: { maxItems: count, chunkSize: 40, dryRun: false }
      });
      if (error) throw error;
      toast.success(`Auto-categorizer finished — ${data?.updated ?? 0} labeled, ${data?.skipped ?? 0} skipped.`);
      const { count: p } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .is("provider", null)
        .not("description", "is", null);
      setPending(p ?? 0);
      onDone?.();
    } catch (e: any) {
      toast.error(`Auto-categorizer failed — ${e?.message ?? String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" onClick={onOpen} aria-label="Auto-sort all">Auto-sort all</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-categorize transactions</DialogTitle>
            <DialogDescription>
              We found <b>{pending}</b> transactions with blank providers.<br />
              {credits !== null ? <>You have <b>{credits}</b> credits available.</> : <>Credits unavailable — choose how many to process.</>}
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-2" />

          <div className="grid gap-2">
            <Label htmlFor="count">How many should we process now?</Label>
            <Input id="count" type="number" min={1} max={pending} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            <p className="text-xs text-muted-foreground">1 credit ≈ 1 attempted label. We only save results when confidence is high.</p>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={run}>Use {count} credits & run</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {running && (
        <Alert className="text-sm">
          <Spinner className="mr-2 inline h-4 w-4" />
          <AlertDescription>Supabase Auto-Categorizer Running...</AlertDescription>
        </Alert>
      )}
    </div>
  );
}