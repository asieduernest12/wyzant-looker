/**
 * @typedef {{test:RegExp,action:()=>void}} IRouteHandlerConfig
 * @typedef {Record<string,IRouteHandlerConfig>} IRouteConfig
 *
 */
export const makeRouteHandlerConfig = (/**@type {IRouteHandlerConfig} */ param) => param;

export const makeRoutes = (/** @type {IRouteConfig} */ routes) => routes;
