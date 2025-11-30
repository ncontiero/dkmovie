import { useContext } from "react";
import { IntlContext } from "@/context/intl/context";

export const useIntl = () => {
  const context = useContext(IntlContext);
  if (context === undefined) {
    console.warn("IntlContext is undefined in useIntl()");
    throw new Error(`useIntl must be used within a IntlProvider.`);
  }
  return context;
};
