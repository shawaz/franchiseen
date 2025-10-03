/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as adminManagement from "../adminManagement.js";
import type * as aiChat from "../aiChat.js";
import type * as brandManagement from "../brandManagement.js";
import type * as brandWallet from "../brandWallet.js";
import type * as files from "../files.js";
import type * as franchiseManagement from "../franchiseManagement.js";
import type * as franchiseStoreQueries from "../franchiseStoreQueries.js";
import type * as franchises from "../franchises.js";
import type * as investments from "../investments.js";
import type * as leadsManagement from "../leadsManagement.js";
import type * as masterData from "../masterData.js";
import type * as propertyManagement from "../propertyManagement.js";
import type * as seedData from "../seedData.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adminManagement: typeof adminManagement;
  aiChat: typeof aiChat;
  brandManagement: typeof brandManagement;
  brandWallet: typeof brandWallet;
  files: typeof files;
  franchiseManagement: typeof franchiseManagement;
  franchiseStoreQueries: typeof franchiseStoreQueries;
  franchises: typeof franchises;
  investments: typeof investments;
  leadsManagement: typeof leadsManagement;
  masterData: typeof masterData;
  propertyManagement: typeof propertyManagement;
  seedData: typeof seedData;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
