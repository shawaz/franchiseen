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
import type * as auth from "../auth.js";
import type * as authActions from "../authActions.js";
import type * as brandManagement from "../brandManagement.js";
import type * as brandWallet from "../brandWallet.js";
import type * as budgetManagement from "../budgetManagement.js";
import type * as createTestTokens from "../createTestTokens.js";
import type * as debugFranchiseWallets from "../debugFranchiseWallets.js";
import type * as debugShares from "../debugShares.js";
import type * as expenseManagement from "../expenseManagement.js";
import type * as files from "../files.js";
import type * as fixFranchiseWalletBalances from "../fixFranchiseWalletBalances.js";
import type * as franchiseApproval from "../franchiseApproval.js";
import type * as franchiseManagement from "../franchiseManagement.js";
import type * as franchiseStoreQueries from "../franchiseStoreQueries.js";
import type * as franchiseWallet from "../franchiseWallet.js";
import type * as franchises from "../franchises.js";
import type * as inventoryManagement from "../inventoryManagement.js";
import type * as investments from "../investments.js";
import type * as leadsManagement from "../leadsManagement.js";
import type * as masterData from "../masterData.js";
import type * as payoutManagement from "../payoutManagement.js";
import type * as productManagement from "../productManagement.js";
import type * as propertyManagement from "../propertyManagement.js";
import type * as seedData from "../seedData.js";
import type * as seedProducts from "../seedProducts.js";
import type * as stockManagement from "../stockManagement.js";
import type * as teamManagement from "../teamManagement.js";
import type * as testData from "../testData.js";
import type * as tokenManagement from "../tokenManagement.js";
import type * as userManagement from "../userManagement.js";

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
  auth: typeof auth;
  authActions: typeof authActions;
  brandManagement: typeof brandManagement;
  brandWallet: typeof brandWallet;
  budgetManagement: typeof budgetManagement;
  createTestTokens: typeof createTestTokens;
  debugFranchiseWallets: typeof debugFranchiseWallets;
  debugShares: typeof debugShares;
  expenseManagement: typeof expenseManagement;
  files: typeof files;
  fixFranchiseWalletBalances: typeof fixFranchiseWalletBalances;
  franchiseApproval: typeof franchiseApproval;
  franchiseManagement: typeof franchiseManagement;
  franchiseStoreQueries: typeof franchiseStoreQueries;
  franchiseWallet: typeof franchiseWallet;
  franchises: typeof franchises;
  inventoryManagement: typeof inventoryManagement;
  investments: typeof investments;
  leadsManagement: typeof leadsManagement;
  masterData: typeof masterData;
  payoutManagement: typeof payoutManagement;
  productManagement: typeof productManagement;
  propertyManagement: typeof propertyManagement;
  seedData: typeof seedData;
  seedProducts: typeof seedProducts;
  stockManagement: typeof stockManagement;
  teamManagement: typeof teamManagement;
  testData: typeof testData;
  tokenManagement: typeof tokenManagement;
  userManagement: typeof userManagement;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
