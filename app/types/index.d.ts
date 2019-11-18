export interface ClassesProp {
  classes: GenericString;
}

export interface GenericObjectType {
  [key: string]: any;
}

export type NullOrGenericObject = null | GenericObject;

export interface GenericString {
  [key: string]: string;
}

export interface GenericAlphaNumeric {
  [key: string]: string | number;
}
