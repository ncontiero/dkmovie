export interface ReauthenticateProps {
  readonly onReAuthenticated: () => void;
  readonly cancel?: () => void;
}
