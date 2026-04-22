declare module "bcryptjs" {
  const bcrypt: {
    hashSync(password: string, salt?: number | string): string;
    compareSync(password: string, hash: string): boolean;
    hash(password: string, salt?: number | string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
    genSaltSync(rounds?: number): string;
    genSalt(rounds?: number): Promise<string>;
  };

  export default bcrypt;
}
