import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type Locale,
  type Messages,
  IntlProvider as IntlProviderBase,
} from "use-intl";
import { setLanguage } from "@/http/account/language";
import { setCookie } from "@/utils/cookies";
import { getErrorMessage } from "@/utils/errors";
import { type IntlContextProps, IntlContext } from "./context";

declare const LANGUAGE_CODE: Locale;

export function IntlProvider({ children }: PropsWithChildren) {
  const [currentLang, setCurrentLang] = useState<Locale>(LANGUAGE_CODE);
  const [messages, setMessages] = useState<Messages | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const newMessages = (
          await import(`@/i18n/messages/${currentLang}.json`)
        ).default;
        if (isMounted) setMessages(newMessages);
      } catch (error) {
        toast.error("Failed to load messages");
        console.error(error);
      }
    };

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [currentLang]);

  useEffect(() => {
    document.head.querySelector("#initialLanguageScript")?.remove();
  }, []);

  const setLang = useCallback(
    (lang: Locale) => {
      try {
        setCookie("django_language", lang);
        setCurrentLang(lang);
        document.documentElement.lang = lang;
        queryClient.invalidateQueries({ queryKey: ["content"], exact: false });

        setLanguage(lang);
      } catch (error) {
        const errors = getErrorMessage(error);
        if (errors) {
          toast.error(errors);
          return;
        }

        console.error(error);
      }
    },
    [queryClient],
  );

  const contextValues = useMemo(
    (): IntlContextProps => ({ lang: currentLang, setLang }),
    [currentLang, setLang],
  );

  return !messages ? null : (
    <IntlContext.Provider value={contextValues}>
      <IntlProviderBase locale={currentLang} messages={messages}>
        {children}
      </IntlProviderBase>
    </IntlContext.Provider>
  );
}
