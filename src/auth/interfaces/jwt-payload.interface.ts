export interface JwtPayload {
  id: string;
  email: string;
}

export interface JwtPayloadWithRt extends JwtPayload {
  refreshToken: string;
}