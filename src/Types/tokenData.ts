export interface TokenData {
  access_token: string;       // The access token for authenticating API requests
  expires_in: number;         // The remaining lifetime of the access token, in seconds
  refresh_token?: string;     // A token to refresh the access token (only provided on the first authorization)
  scope: string;              // The scope of the access token
  token_type: string;         // The type of the token (usually "Bearer")
  id_token?: string;          // The ID token (if requested)
}
