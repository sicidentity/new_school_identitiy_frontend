"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X, Loader2, AlertCircle } from "lucide-react";
import type { Student, Class, Parent, User } from "@/types/models";

// Define a union type for the data that can be edited
type EditableEntity = Student | Class | Parent | User;

export default function EditPage({
  params: paramsPromise,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(paramsPromise);
  const { type, id } = params;
  const router = useRouter();
  
  const [initialData, setInitialData] = useState<EditableEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic schema based on initial data
  const createSchema = (data: EditableEntity) => {
    const schemaFields: Record<string, z.ZodType> = {};
    Object.keys(data as unknown as Record<string, unknown>).forEach(key => {
      if (key !== 'id') {
        const value = (data as unknown as Record<string, unknown>)[key];
        if (typeof value === 'string') {
          schemaFields[key] = z.string().min(1, `${key} is required`);
        } else if (typeof value === 'number') {
          schemaFields[key] = z.number().min(0, `${key} must be positive`);
        } else if (Array.isArray(value)) {
          schemaFields[key] = z.array(z.unknown()).optional();
        } else {
          schemaFields[key] = z.unknown();
        }
      }
    });
    return z.object(schemaFields);
  };

  const form = useForm<EditableEntity>({
    resolver: initialData ? zodResolver(createSchema(initialData) as unknown as z.ZodType<EditableEntity>) : undefined,
    defaultValues: initialData || {},
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/${type}/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${type}`);
        }
        const data = await response.json() as EditableEntity;
        setInitialData(data);
        form.reset(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id, form]);

  const onSubmit = async (data: EditableEntity) => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Convert string numbers to actual numbers for numeric fields
      const processedData = { ...data };
      if (initialData) {
        Object.keys(processedData as unknown as Record<string, unknown>).forEach(key => {
          if (initialData && typeof (initialData as unknown as Record<string, unknown>)[key] === 'number' && typeof (processedData as unknown as Record<string, unknown>)[key] === 'string') {
            (processedData as unknown as Record<string, unknown>)[key] = Number((processedData as unknown as Record<string, unknown>)[key]);
          }
        });
      }

      const response = await fetch(`/api/${type}s/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${type}`);
      }

      router.push(`/${type}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFieldInput = (key: string, field: Record<string, any>, value: unknown) => {
    // Handle number fields
    if (typeof value === 'number') {
      return (
        <Input 
          {...field} 
          type="number" 
          value={field.value?.toString() || ""} 
          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    // Handle boolean fields
    if (typeof value === 'boolean') {
      return (
        <Select value={field.value?.toString()} onValueChange={(val) => field.onChange(val === 'true')}>
          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    // Handle array fields (display as badges)
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border">
          {value.length > 0 ? (
            value.map((item: any, index: number) => (
              <Badge key={index}  className="text-xs">
                {item?.name || item?.title || `Item ${index + 1}`}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500 italic">No items</span>
          )}
        </div>
      );
    }

    // Default: string input
    return (
      <Input 
        {...field} 
        type="text" 
        value={(typeof field.value === 'string' || typeof field.value === 'number') ? String(field.value) : ""} 
        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
      />
    );
  };

  const formatFieldLabel = (key: string) => {
    // Handle common ID patterns
    if (key.endsWith('Id')) {
      const baseName = key.slice(0, -2);
      return baseName.charAt(0).toUpperCase() + baseName.slice(1);
    }
    
    // Handle camelCase
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getFieldDescription = (key: string, value: unknown) => {
    if (Array.isArray(value)) {
      return "This field shows related items and is read-only.";
    }
    if (typeof value === 'boolean') {
      return "Select Yes or No";
    }
    if (typeof value === 'number') {
      return "Enter a numeric value";
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <div className="text-lg font-medium text-gray-700">Loading...</div>
              <div className="text-sm text-gray-500">Fetching {type} data</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto py-12">
          <div className="max-w-md mx-auto">
            <Card className="border-red-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Error</CardTitle>
                <CardDescription className="text-red-600">{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.back()} 
                  variant="outline" 
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!initialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto py-12">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle>No Data Found</CardTitle>
                <CardDescription>The requested {type} could not be found.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.back()} 
                  variant="outline" 
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 hover:bg-white/60 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Edit {type.charAt(0).toUpperCase() + type.slice(1)}
              </h1>
              <p className="text-gray-600">
                Update the information below and click save to apply changes.
              </p>
              <Separator className="mt-4" />
            </div>
          </div>

          {/* Form Section */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid gap-6">
                    {Object.entries(initialData).map(([key, value]) => {
                      if (key === "id") return null;

                      return (
                        <FormField
                          key={key}
                          control={form.control}
                          name={key as keyof EditableEntity}
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                {formatFieldLabel(key)}
                                {Array.isArray(value) && (
                                  <Badge  className="text-xs">
                                    Read-only
                                  </Badge>
                                )}
                              </FormLabel>
                              <FormControl>
                                {getFieldInput(key, field, value)}
                              </FormControl>
                              <FormMessage className="text-xs" />
                              {getFieldDescription(key, value) && (
                                <p className="text-xs text-gray-500">
                                  {getFieldDescription(key, value)}
                                </p>
                              )}
                            </FormItem>
                          )}
                        />
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.back()}
                      disabled={submitting}
                      className="flex-1 font-medium py-3 transition-all duration-200 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error:</span>
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}