import { OpenAPIV3 } from 'openapi-types';

import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import { OpenApiRouter } from '../types';
import { getOpenApiPathsObject } from './paths';
import { errorResponseObject } from './schema';

export const openApiVersion = '3.0.3';

export type GenerateOpenApiDocumentOptions = {
  title: string;
  description?: string;
  version: string;
  baseUrl: string;
  docsUrl?: string;
  tags?: string[];
  securitySchemes?: OpenAPIV3.ComponentsObject['securitySchemes'];
  defs?: any;
};

export const generateOpenApiDocument = (
  appRouter: OpenApiRouter,
  opts: GenerateOpenApiDocumentOptions,
): OpenAPIV3.Document => {
  const securitySchemes = opts.securitySchemes || {
    Authorization: {
      type: 'http',
      scheme: 'bearer',
    },
  };

  const jsonOut = zodToJsonSchema(z.object({}), {
    $refStrategy: 'root',
    definitions: opts.defs ?? {},
    definitionPath: 'components/schemas',
  }) as any;

  const defsJson = jsonOut['components/schemas'];

  return {
    openapi: openApiVersion,
    info: {
      title: opts.title,
      description: opts.description,
      version: opts.version,
    },
    servers: [
      {
        url: opts.baseUrl,
      },
    ],
    paths: getOpenApiPathsObject(appRouter, Object.keys(securitySchemes), opts.defs),
    components: {
      securitySchemes,
      responses: {
        error: errorResponseObject,
      },
      schemas: defsJson as any,
    },
    tags: opts.tags?.map((tag) => ({ name: tag })),
    externalDocs: opts.docsUrl ? { url: opts.docsUrl } : undefined,
  };
};
