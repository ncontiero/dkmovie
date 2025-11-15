import { Link } from "./ui/link";

export function Footer() {
  return (
    <footer className="bg-muted border-border mt-16 border-t">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Links
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="footer">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link to="/" variant="footer">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link to="/" variant="footer">
                  Teste de Velocidade
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Ajuda
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="footer">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/" variant="footer">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/" variant="footer">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Conta
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="footer">
                  Minha Conta
                </Link>
              </li>
              <li>
                <Link to="/" variant="footer">
                  Preferências
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Mídia
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="footer">
                  Avisos Legais
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-muted-foreground/60 mt-10 text-center text-sm">
          &copy; {new Date().getFullYear()} DKMovie, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
