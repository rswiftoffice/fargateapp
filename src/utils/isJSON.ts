export const isJson = (obj: any) =>
  obj !== undefined && obj !== null && obj.constructor == Object;
