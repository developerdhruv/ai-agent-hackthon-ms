'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { UserProfile, InterviewType } from '@/lib/types';

// Create a schema for the form
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  jobTitle: z.string().min(2, { message: 'Job title must be at least 2 characters.' }),
  yearsOfExperience: z.coerce.number().min(0, { message: 'Experience must be a non-negative number.' }),
  skills: z.string(), // Keep as string in the form
  targetRole: z.string().min(2, { message: 'Target role must be at least 2 characters.' }),
  industry: z.string().min(2, { message: 'Industry must be at least 2 characters.' }),
  interviewType: z.nativeEnum(InterviewType),
});

// Define the FormValues type based on the schema
type FormValues = z.infer<typeof formSchema>;

// Ensure UserProfile has skills as string[]
interface ProfileFormProps {
  onSubmit: (data: UserProfile) => void;
  defaultInterviewType?: InterviewType;
}

export function ProfileForm({ onSubmit, defaultInterviewType = InterviewType.GENERAL }: ProfileFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      jobTitle: '',
      yearsOfExperience: 0,
      skills: '',
      targetRole: '',
      industry: '',
      interviewType: defaultInterviewType,
    },
  });

  // Handle form submission
  const handleSubmit = (formData: FormValues) => {
    // Convert the skills string to an array before submitting
    const profileData: UserProfile = {
      ...formData,
      skills: formData.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean)
    };
    onSubmit(profileData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input placeholder="3" type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="JavaScript, React, Node.js" {...field} />
                </FormControl>
                <FormDescription>
                  Enter your key skills separated by commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="targetRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Role</FormLabel>
                <FormControl>
                  <Input placeholder="Senior Software Engineer" {...field} />
                </FormControl>
                <FormDescription>
                  The position you&apos;re interviewing for
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder="Technology" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="interviewType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={InterviewType.TECHNICAL}>Technical</SelectItem>
                    <SelectItem value={InterviewType.BEHAVIORAL}>Behavioral</SelectItem>
                    <SelectItem value={InterviewType.CASE_STUDY}>Case Study</SelectItem>
                    <SelectItem value={InterviewType.GENERAL}>General</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Type of interview you want to practice
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
}