import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }
    // Simulate API call
    setMessage("A password reset link has been sent to your email.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <CardContent>
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your email to receive a password reset link.
          </p>
          <Input
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            onClick={handleReset}
          >
            Reset Password
          </Button>
          {message && <p className="mt-3 text-sm text-center text-gray-700">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}