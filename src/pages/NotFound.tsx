import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background dark flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <CheckCircle className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <span className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ATTENDO
        </span>
      </div>

      {/* 404 */}
      <div className="relative mb-6">
        <div className="text-[10rem] font-bold leading-none text-white/5 select-none" aria-hidden="true">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
        </div>
      </div>

      <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
        The page you're looking for doesn't exist or has been moved. Check the URL or head back to the homepage.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-border/60 hover:bg-white/5 gap-2 min-h-[44px]"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Go Back
        </Button>
        <Button
          onClick={() => navigate("/")}
          className="bg-primary hover:bg-primary/90 min-h-[44px]"
          aria-label="Return to homepage"
        >
          Return to Homepage
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
