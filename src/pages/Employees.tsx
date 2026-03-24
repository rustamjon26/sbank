import { useEffect, useMemo, useState } from "react";
import { getAllEmployees, createEmployee } from "@/db/api";
import type { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Mail,
  Building2,
  MapPin,
  Users,
  Briefcase,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const employeeSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  branch: z.string().min(1, "Branch is required"),
});

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      department: "",
      branch: "",
    },
  });

  useEffect(() => {
    loadEmployees();
  }, []);
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setEmployees(await getAllEmployees());
    } catch (error) {
      console.error("Failed to load employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(
      (employee) =>
        employee.first_name.toLowerCase().includes(q) ||
        employee.last_name.toLowerCase().includes(q) ||
        employee.email.toLowerCase().includes(q) ||
        employee.department.toLowerCase().includes(q) ||
        employee.branch.toLowerCase().includes(q),
    );
  }, [employees, searchQuery]);

  const branchCount = new Set(employees.map((item) => item.branch)).size;
  const departmentCount = new Set(employees.map((item) => item.department))
    .size;

  const onSubmit = async (values: z.infer<typeof employeeSchema>) => {
    try {
      await createEmployee(values);
      toast.success("Employee created successfully");
      setDialogOpen(false);
      form.reset();
      loadEmployees();
    } catch (error: any) {
      console.error("Failed to create employee:", error);
      if (error?.code === "23505" || error?.message?.includes("duplicate")) {
        toast.error("An employee with this email already exists!");
      } else {
        toast.error("Failed to create employee");
      }
    }
  };

  if (loading)
    return (
      <div className="page-section">
        <Skeleton className="h-40 rounded-3xl bg-muted/70" />
        <div className="data-grid">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl bg-muted/70" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-3xl bg-muted/70" />
      </div>
    );

  return (
    <div className="page-section">
      <section className="hero-panel">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
              Employee registry
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Build a clean ownership layer for every asset transfer.
            </h1>
            <p className="section-subtitle max-w-2xl text-foreground/70">
              Keep employee records organized so assignments, returns, and audit
              trails always point to a clear responsible owner.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl px-5 py-6 text-sm font-medium shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Add employee
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Create new employee</DialogTitle>
                <DialogDescription>
                  Add a new employee to use in asset assignment flows.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.smith@bank.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="Operations" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <FormControl>
                            <Input placeholder="Headquarters" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create employee</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="data-grid">
        <Card className="metric-card rounded-3xl">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Employees</div>
                <div className="mt-3 text-3xl font-semibold">
                  {employees.length}
                </div>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card rounded-3xl">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Branches</div>
                <div className="mt-3 text-3xl font-semibold">{branchCount}</div>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card rounded-3xl">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Departments</div>
                <div className="mt-3 text-3xl font-semibold">
                  {departmentCount}
                </div>
              </div>
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card rounded-3xl">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  Search results
                </div>
                <div className="mt-3 text-3xl font-semibold">
                  {filteredEmployees.length}
                </div>
              </div>
              <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600">
                <Search className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="glass-card rounded-3xl">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Employee records</CardTitle>
              <CardDescription>
                Search by name, email, branch, or department before assigning
                assets.
              </CardDescription>
            </div>
            <div className="relative w-full lg:w-auto min-w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="soft-scrollbar overflow-x-auto rounded-2xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-16 text-center text-muted-foreground"
                    >
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {employee.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">
                          <Building2 className="mr-1 h-3 w-3" />
                          {employee.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {employee.branch}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(employee.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
