declare const _errorSymbol: unique symbol;
export type TypeError<TMessage extends string> = TMessage & {
  _: typeof _errorSymbol;
};
