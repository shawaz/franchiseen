"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ApplicationModalProps {
  franchiseId: string; // ID of the brand (franchiser)
  franchiseName: string;
  trigger?: React.ReactNode;
}

interface ApplicationFormValues {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  message: string;
}

export function ApplicationModal({ franchiseId, franchiseName, trigger }: ApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const submitApplication = useMutation(api.applications.submit);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ApplicationFormValues>();

  const onSubmit = async (data: ApplicationFormValues) => {
    try {
      await submitApplication({
        franchiserId: franchiseId as Id<"franchiser">,
        applicantName: data.applicantName,
        applicantEmail: data.applicantEmail,
        applicantPhone: data.applicantPhone,
        message: data.message,
      });
      
      toast.success("Application Submitted", {
        description: `Your application for ${franchiseName} has been sent successfully.`
      });
      
      setIsOpen(false);
      reset();
    } catch (error) {
        console.error(error);
      toast.error("Submission Failed", {
        description: "There was an error submitting your application. Please try again."
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="lg" className="w-full md:w-auto">Apply Now</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for {franchiseName}</DialogTitle>
          <DialogDescription>
            Fill out the form below to express your interest. The brand owner will contact you shortly.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="applicantName">Full Name</Label>
            <Input 
                id="applicantName" 
                placeholder="John Doe" 
                {...register("applicantName", { required: true })} 
            />
            {errors.applicantName && <p className="text-red-500 text-xs">Name is required</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="applicantEmail">Email</Label>
                <Input 
                    id="applicantEmail" 
                    type="email" 
                    placeholder="john@example.com" 
                    {...register("applicantEmail", { required: true })} 
                />
                {errors.applicantEmail && <p className="text-red-500 text-xs">Email is required</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="applicantPhone">Phone</Label>
                <Input 
                    id="applicantPhone" 
                    placeholder="+971 50 123 4567" 
                    {...register("applicantPhone", { required: true })} 
                />
                {errors.applicantPhone && <p className="text-red-500 text-xs">Phone is required</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea 
                id="message" 
                placeholder="Tell us about your experience or interest..." 
                className="resize-none"
                {...register("message")} 
            />
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
