import { Token } from './tokenizer';

export interface Command {
  type: string;
  args: unknown[];
}

export class Parser {
  parse(tokens: Token[]): Command {
    if (tokens.length === 0) {
      throw new Error('No tokens to parse');
    }

    const commandType = tokens[0].value.toLowerCase();
    const args = tokens.slice(1).map((t) => t.value);

    return {
      type: commandType,
      args,
    };
  }
}
