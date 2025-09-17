"use client";

import { signIn } from "next-auth/react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@ai-stack/ui";
import { Mail, Github, Chrome } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={() => signIn("email")}>
            <Mail className="mr-2 h-4 w-4" /> Email Magic Link
          </Button>
          <Button className="w-full" onClick={() => signIn("google")}>
            <Chrome className="mr-2 h-4 w-4" /> Google
          </Button>
          <Button className="w-full" onClick={() => signIn("github")}>
            <Github className="mr-2 h-4 w-4" /> GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
