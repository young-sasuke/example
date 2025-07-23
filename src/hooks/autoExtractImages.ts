// src/hooks/autoExtractImages.ts
import { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload';

export const trackImageUrlsBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (operation === 'update' && originalDoc) {
    req.context = {
      ...req.context,
      originalImageUrls: new Set<string>(),
    };
  }
  return data;
};

export const autoExtractImagesHook: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  collection,
}) => {
  if (operation !== 'create' && operation !== 'update') {
    return doc;
  }
  return doc;
};