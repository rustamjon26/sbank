import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Database } from 'lucide-react';

export function SupabaseConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 p-3 rounded-lg">
              <Database className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">Supabase Configuration Required</CardTitle>
              <CardDescription>Database connection not configured</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Missing Environment Variables</AlertTitle>
            <AlertDescription>
              The application requires Supabase credentials to function properly.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Quick Setup:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">supabase.com</a></li>
                <li>Copy <code className="bg-muted px-1 py-0.5 rounded">.env.example</code> to <code className="bg-muted px-1 py-0.5 rounded">.env</code></li>
                <li>Add your Supabase URL and anon key to the <code className="bg-muted px-1 py-0.5 rounded">.env</code> file</li>
                <li>Run the database migration SQL (see SETUP_GUIDE.md)</li>
                <li>Restart the development server</li>
              </ol>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Your .env file should contain:</p>
              <pre className="text-xs bg-background p-3 rounded border border-border overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
              </pre>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                📖 For detailed setup instructions, see <code className="bg-muted px-1 py-0.5 rounded">SETUP_GUIDE.md</code> in the project root.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
