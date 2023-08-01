import { ReadStream } from "fs";
import { IncomingMessage } from "http";
import { z } from "zod";

export const zodGetByIdSchema = z.object({
  id: z.string().uuid(),
});

export const zodGetByFilterSchema = z.object({
  filter: z.string(),
  orderBy: z.string().optional(),
});

export const zodOnlyFilterSchema = z.object({
  filter: z.string(),
});

export const zodAppExportManySchema = z.object({
  filter: z.string(),
  skipData: z.boolean().optional(),
});

const customPropertyCombinedValue = z
  .string()
  .refine(
    // its expected the data to be in format NAME=VALUE
    (v) => /^.*=.*/.test(v),
    "Custom properties should be in format: NAME=VALUE"
  )
  .superRefine((v, ctx) => {
    // checks for custom prop name. value can be anything
    const [name, value] = v.split("=");

    // special symbols and space are not allowed for custom property name
    if (/^[A-Za-z0-9_]+$/.test(name) == false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "The custom property name can be only combination of alphanumeric symbols and underline",
      });

      return false;
    }

    return true;
  });

export const zodAppUpload = z.object({
  name: z.string(),
  file: z
    .instanceof(Buffer)
    .or(z.instanceof(ReadStream))
    .or(z.instanceof(IncomingMessage))
    .or(z.instanceof(WritableStream)),
  keepData: z.boolean().optional(),
  excludeDataConnections: z.boolean().optional(),
  customProperties: z.array(customPropertyCombinedValue).optional(),
  tags: z.array(z.string()).optional(),
});

export const zodAppUploadAndReplace = zodAppUpload.extend({
  targetAppId: z.string(),
});

export const zodAppUploadMany = z.object({
  apps: z.array(zodAppUpload),
  sequence: z.boolean().optional(),
});

export const zodAppSwitch = z.object({
  targetAppId: z.string().uuid(),
});

export const zodAppPublish = z.object({
  stream: z.string(),
  name: z.string().optional(),
});

export const zodAppUpdate = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  owner: z.string().optional(),
  stream: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customProperties: z.array(customPropertyCombinedValue).optional(),
});

const updateOperations = ["add", "remove", "set"] as const;

export const zodUpdateObjectOptions = z
  .object({
    customPropertiesOperations: z.enum(updateOperations).optional(),
    tagOperations: z.enum(updateOperations).optional(),
  })
  .optional();

export const zodStreamUpdate = z.object({
  name: z.string().optional(),
  owner: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customProperties: z.array(customPropertyCombinedValue).optional(),
});

export const zodStreamCreate = z.object({
  name: z.string(),
  owner: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customProperties: z.array(customPropertyCombinedValue).optional(),
});
