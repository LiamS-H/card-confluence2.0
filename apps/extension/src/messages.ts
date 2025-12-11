import { ICatalog } from "@repo/scryfall-search";

export type GetCatalogRequest = {
    type: "GET_CATALOG";
};

export type GetCatalogResponse =
    | {
          type: "GET_CATALOG_SUCCESS";
          data: ICatalog;
      }
    | {
          type: "GET_CATALOG_ERROR";
          error: string;
      };

export type ExtensionMessage = GetCatalogRequest;
export type ExtensionResponse = GetCatalogResponse;
